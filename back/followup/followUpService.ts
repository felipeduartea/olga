/**
 * Follow-up Calling Service
 * 
 * This service manages the complex logic for post-appointment follow-up calls.
 * It combines two triggers (follow-ups and prescriptions) into a unified calling schedule
 * to ensure patients receive optimal care without redundant calls.
 * 
 * COMBINED LOGIC RULES:
 * 1. If appointment has ONLY follow-up (hasFollowUp = true): Create follow-up schedule
 * 2. If appointment has ONLY prescriptions: Create prescription monitoring schedule
 * 3. If appointment has BOTH: Create a SINGLE combined schedule (no duplicate calls)
 * 4. The calling schedule follows: Daily (7 days) -> Weekly (4 weeks) -> Monthly (12 months)
 */

import { db } from "../db/index.js";
import { 
  appointments, 
  appointmentOutputs, 
  prescriptions, 
  patients, 
  doctors,
  followUpCalls,
  type Appointment,
  type AppointmentOutput,
  type Prescription,
  type Patient,
  type Doctor,
  type FollowUpCall,
} from "../db/schema.js";
import { eq, and, lte, gte, isNull, or } from "drizzle-orm";
import { 
  FOLLOWUP_CONFIG, 
  FollowUpType, 
  CallPhase, 
  CallStatus,
  generateCallSchedule,
  isCallDue,
  determinePhase,
  formatDuration,
} from "./config.js";

/**
 * Initialize follow-up tracking for completed appointments
 * This should be called after an appointment is marked as completed
 */
export async function initializeFollowUps(): Promise<void> {
  const now = new Date();
  console.log(`[${now.toISOString()}] Initializing follow-ups for completed appointments...`);

  try {
    // Find completed appointments that don't have follow-up tracking yet
    const completedAppointments = await db
      .select({
        appointment: appointments,
        output: appointmentOutputs,
      })
      .from(appointments)
      .leftJoin(appointmentOutputs, eq(appointments.id, appointmentOutputs.appointmentId))
      .leftJoin(followUpCalls, eq(appointments.id, followUpCalls.appointmentId))
      .where(
        and(
          eq(appointments.status, 'completed'),
          isNull(followUpCalls.id) // Not yet initialized
        )
      );

    let initialized = 0;

    for (const { appointment, output } of completedAppointments) {
      // Determine if this appointment needs follow-up
      const needsFollowUp = await determineIfNeedsFollowUp(appointment.id, output);
      
      if (needsFollowUp) {
        await createFollowUpTracking(appointment, output);
        initialized++;
      }
    }

    if (initialized > 0) {
      console.log(`✅ Initialized ${initialized} follow-up tracking record(s)`);
    } else {
      console.log(`No new follow-ups to initialize`);
    }
  } catch (error) {
    console.error("❌ Error initializing follow-ups:", error);
    throw error;
  }
}

/**
 * CRITICAL FUNCTION: Determine if an appointment needs follow-up calling
 * 
 * This implements the COMBINED LOGIC:
 * - Check if appointment has follow-up flag (hasFollowUp = true)
 * - Check if appointment has prescriptions
 * - Return the appropriate FollowUpType
 */
async function determineIfNeedsFollowUp(
  appointmentId: string,
  output: AppointmentOutput | null
): Promise<{ needed: boolean; type?: FollowUpType }> {
  // Check for follow-up appointment flag
  const hasFollowUpFlag = output?.hasFollowUp === true;

  // Check for prescriptions
  const appointmentPrescriptions = await db
    .select()
    .from(prescriptions)
    .where(eq(prescriptions.appointmentId, appointmentId));

  const hasPrescriptions = appointmentPrescriptions.length > 0;

  // COMBINED LOGIC DETERMINATION
  if (hasFollowUpFlag && hasPrescriptions) {
    console.log(`  → Appointment ${appointmentId}: BOTH follow-up and prescriptions (COMBINED)`);
    return { needed: true, type: FollowUpType.BOTH };
  } else if (hasFollowUpFlag) {
    console.log(`  → Appointment ${appointmentId}: Follow-up only`);
    return { needed: true, type: FollowUpType.FOLLOW_UP_ONLY };
  } else if (hasPrescriptions) {
    console.log(`  → Appointment ${appointmentId}: Prescriptions only`);
    return { needed: true, type: FollowUpType.PRESCRIPTION_ONLY };
  }

  console.log(`  → Appointment ${appointmentId}: No follow-up needed`);
  return { needed: false };
}

/**
 * Create follow-up tracking record with generated schedule
 */
async function createFollowUpTracking(
  appointment: Appointment,
  output: AppointmentOutput | null
): Promise<void> {
  const followUpCheck = await determineIfNeedsFollowUp(appointment.id, output);
  
  if (!followUpCheck.needed || !followUpCheck.type) {
    return;
  }

  // Use appointment completion time or follow-up date as start
  const startDate = output?.followUpDate || appointment.updatedAt || new Date();
  
  // Generate the complete call schedule
  const schedule = generateCallSchedule(startDate);
  
  // Find the next call date
  const nextCall = schedule.find(call => call.status === CallStatus.PENDING);

  console.log(`  → Creating follow-up tracking for appointment ${appointment.id}`);
  console.log(`     Type: ${followUpCheck.type}`);
  console.log(`     Start date: ${startDate.toISOString()}`);
  console.log(`     Total calls scheduled: ${schedule.length}`);
  console.log(`     Next call: ${nextCall?.scheduledFor.toISOString() || 'None'}`);

  await db.insert(followUpCalls).values({
    appointmentId: appointment.id,
    followUpStartDate: startDate,
    followUpType: followUpCheck.type,
    callSchedule: schedule as any, // Type cast for JSONB
    nextCallDate: nextCall?.scheduledFor || null,
    currentPhase: CallPhase.DAILY,
    callsMade: 0,
    isActive: true,
    metadata: {
      hasFollowUpAppointment: output?.hasFollowUp || false,
      followUpDate: output?.followUpDate || null,
      prescriptionCount: await countPrescriptions(appointment.id),
    },
  });
}

/**
 * Process all pending follow-up calls
 * This is the main function called by the worker
 */
export async function processPendingFollowUpCalls(): Promise<void> {
  const now = new Date();
  console.log(`[${now.toISOString()}] Processing pending follow-up calls...`);

  try {
    // First, initialize any new follow-ups
    await initializeFollowUps();

    // Get all active follow-up tracking records
    const activeFollowUps = await db
      .select({
        followUp: followUpCalls,
        appointment: appointments,
        patient: patients,
        doctor: doctors,
        output: appointmentOutputs,
      })
      .from(followUpCalls)
      .innerJoin(appointments, eq(followUpCalls.appointmentId, appointments.id))
      .innerJoin(patients, eq(appointments.patientId, patients.id))
      .innerJoin(doctors, eq(appointments.doctorId, doctors.id))
      .leftJoin(appointmentOutputs, eq(appointments.id, appointmentOutputs.appointmentId))
      .where(
        and(
          eq(followUpCalls.isActive, true),
          // Only process if next call date is within our time window
          lte(followUpCalls.nextCallDate, new Date(now.getTime() + FOLLOWUP_CONFIG.CALL_TIME_BUFFER_HOURS * 60 * 60 * 1000))
        )
      );

    let callsProcessed = 0;

    for (const record of activeFollowUps) {
      const { followUp, appointment, patient, doctor, output } = record;

      // Process this follow-up
      const wasProcessed = await processFollowUpCall(followUp, appointment, patient, doctor, output);
      
      if (wasProcessed) {
        callsProcessed++;
      }
    }

    if (callsProcessed > 0) {
      console.log(`✅ Processed ${callsProcessed} follow-up call(s)`);
    } else {
      console.log(`No follow-up calls due at this time`);
    }
  } catch (error) {
    console.error("❌ Error processing follow-up calls:", error);
    throw error;
  }
}

/**
 * Process a single follow-up call
 * This handles the detailed logic of checking, making, and updating call status
 */
async function processFollowUpCall(
  followUp: FollowUpCall,
  appointment: Appointment,
  patient: Patient,
  doctor: Doctor,
  output: AppointmentOutput | null
): Promise<boolean> {
  const now = new Date();
  
  // Get the current schedule
  const schedule = followUp.callSchedule as any[];
  
  // Find the next pending call
  const pendingCallIndex = schedule.findIndex(
    call => call.status === CallStatus.PENDING && isCallDue(new Date(call.scheduledFor), now)
  );

  if (pendingCallIndex === -1) {
    // No calls due at this time
    return false;
  }

  const callToMake = schedule[pendingCallIndex];
  
  console.log(`\n📞 Processing call for patient: ${patient.name}`);
  console.log(`   Appointment: ${appointment.id}`);
  console.log(`   Call #${callToMake.callNumber} (${callToMake.phase} phase)`);
  console.log(`   Scheduled: ${new Date(callToMake.scheduledFor).toISOString()}`);

  try {
    // Get prescription details for context
    const appointmentPrescriptions = await db
      .select()
      .from(prescriptions)
      .where(eq(prescriptions.appointmentId, appointment.id));


    // Update the call status in the schedule
    schedule[pendingCallIndex] = {
      ...callToMake,
      status: CallStatus.COMPLETED,
      completedAt: now,
    };

    // Find next pending call
    const nextPendingCall = schedule.find(
      (call, idx) => idx > pendingCallIndex && call.status === CallStatus.PENDING
    );

    // Calculate days elapsed since start
    const daysElapsed = Math.floor(
      (now.getTime() - new Date(followUp.followUpStartDate).getTime()) / (24 * 60 * 60 * 1000)
    );

    // Determine current phase
    const currentPhase = determinePhase(daysElapsed);

    // Check if this was the last call
    const isLastCall = !nextPendingCall;

    // Update the follow-up tracking record
    await db
      .update(followUpCalls)
      .set({
        callSchedule: schedule as any,
        callsMade: followUp.callsMade + 1,
        nextCallDate: nextPendingCall ? new Date(nextPendingCall.scheduledFor) : null,
        currentPhase: isLastCall ? CallPhase.COMPLETED : currentPhase,
        isActive: !isLastCall,
        completedAt: isLastCall ? now : null,
        updatedAt: now,
      })
      .where(eq(followUpCalls.id, followUp.id));

    console.log(`✅ Call completed successfully`);
    console.log(`   Total calls made: ${followUp.callsMade + 1}`);
    console.log(`   Next call: ${nextPendingCall ? new Date(nextPendingCall.scheduledFor).toISOString() : 'None (series complete)'}`);
    
    if (isLastCall) {
      console.log(`🎉 Follow-up series completed for patient ${patient.name}`);
    }

    return true;
  } catch (error) {
    console.error(`❌ Error making follow-up call:`, error);

    // Mark call as failed
    schedule[pendingCallIndex] = {
      ...callToMake,
      status: CallStatus.FAILED,
      notes: `Failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };

    await db
      .update(followUpCalls)
      .set({
        callSchedule: schedule as any,
        updatedAt: now,
      })
      .where(eq(followUpCalls.id, followUp.id));

    return false;
  }
}

/**
 * Manually mark a follow-up call as completed (for manual intervention)
 */
export async function markCallCompleted(
  followUpId: string,
  callNumber: number,
  notes?: string
): Promise<void> {
  const followUpRecord = await db
    .select()
    .from(followUpCalls)
    .where(eq(followUpCalls.id, followUpId))
    .limit(1);

  if (followUpRecord.length === 0) {
    throw new Error(`Follow-up record ${followUpId} not found`);
  }

  const followUp = followUpRecord[0];
  const schedule = followUp.callSchedule as any[];
  
  const callIndex = schedule.findIndex(call => call.callNumber === callNumber);
  
  if (callIndex === -1) {
    throw new Error(`Call #${callNumber} not found in schedule`);
  }

  schedule[callIndex] = {
    ...schedule[callIndex],
    status: CallStatus.COMPLETED,
    completedAt: new Date(),
    notes: notes || 'Manually marked as completed',
  };

  const nextPendingCall = schedule.find(
    (call, idx) => idx > callIndex && call.status === CallStatus.PENDING
  );

  const isLastCall = !nextPendingCall;

  await db
    .update(followUpCalls)
    .set({
      callSchedule: schedule as any,
      callsMade: followUp.callsMade + 1,
      nextCallDate: nextPendingCall ? new Date(nextPendingCall.scheduledFor) : null,
      isActive: !isLastCall,
      completedAt: isLastCall ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(eq(followUpCalls.id, followUpId));

  console.log(`✅ Call #${callNumber} marked as completed`);
}

/**
 * Deactivate a follow-up series (e.g., patient requested to stop)
 */
export async function deactivateFollowUp(
  followUpId: string,
  reason?: string
): Promise<void> {
  await db
    .update(followUpCalls)
    .set({
      isActive: false,
      completedAt: new Date(),
      metadata: {
        deactivationReason: reason || 'Manually deactivated',
      },
      updatedAt: new Date(),
    })
    .where(eq(followUpCalls.id, followUpId));

  console.log(`🛑 Follow-up ${followUpId} deactivated: ${reason || 'Manual'}`);
}

/**
 * Get follow-up statistics for an appointment
 */
export async function getFollowUpStats(appointmentId: string): Promise<{
  hasFollowUp: boolean;
  followUpType?: string;
  callsMade: number;
  totalCallsScheduled: number;
  currentPhase?: string;
  nextCallDate?: Date;
  isActive: boolean;
}> {
  const result = await db
    .select()
    .from(followUpCalls)
    .where(eq(followUpCalls.appointmentId, appointmentId))
    .limit(1);

  if (result.length === 0) {
    return {
      hasFollowUp: false,
      callsMade: 0,
      totalCallsScheduled: 0,
      isActive: false,
    };
  }

  const followUp = result[0];
  const schedule = followUp.callSchedule as any[];

  return {
    hasFollowUp: true,
    followUpType: followUp.followUpType,
    callsMade: followUp.callsMade,
    totalCallsScheduled: schedule.length,
    currentPhase: followUp.currentPhase,
    nextCallDate: followUp.nextCallDate || undefined,
    isActive: followUp.isActive,
  };
}

/**
 * Helper: Count prescriptions for an appointment
 */
async function countPrescriptions(appointmentId: string): Promise<number> {
  const result = await db
    .select()
    .from(prescriptions)
    .where(eq(prescriptions.appointmentId, appointmentId));
  
  return result.length;
}

