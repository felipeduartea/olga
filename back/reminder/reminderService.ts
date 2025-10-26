import { db } from "../db/index.js";
import { appointments, patients, doctors } from "../db/schema.js";
import { eq, and, gte, lte, sql } from "drizzle-orm";
import { sendReminderNotification } from "./notifications.js";
import { REMINDER_CONFIG, formatReminderTime } from "./config.js";

/**
 * Process all pending reminders
 * Checks for appointments that need reminders sent and processes them
 */
export async function processPendingReminders(): Promise<void> {
  const now = new Date();
  
  console.log(`[${now.toISOString()}] Checking for pending reminders...`);

  try {
    // Query all scheduled appointments
    const scheduledAppointments = await db
      .select()
      .from(appointments)
      .where(eq(appointments.status, "scheduled"));

    let remindersProcessed = 0;

    for (const appointment of scheduledAppointments) {
      // Get reminder intervals (use default if not set)
      const reminderIntervals = appointment.reminderTimes && appointment.reminderTimes.length > 0
        ? appointment.reminderTimes
        : REMINDER_CONFIG.DEFAULT_REMINDER_INTERVALS;

      const remindersSent = appointment.remindersSent || [];

      // Check each reminder interval
      for (const minutesBefore of reminderIntervals) {
        const reminderKey = formatReminderTime(minutesBefore);

        // Skip if already sent
        if (remindersSent.includes(reminderKey)) {
          continue;
        }

        // Check if appointment is within the reminder window
        if (shouldSendReminder(appointment.appointmentTime, minutesBefore, now)) {
          await sendReminder(appointment.id, reminderKey, minutesBefore);
          remindersProcessed++;
        }
      }
    }

    if (remindersProcessed > 0) {
      console.log(`✅ Processed ${remindersProcessed} reminder(s)`);
    } else {
      console.log(`No reminders to send`);
    }
  } catch (error) {
    console.error("❌ Error processing reminders:", error);
    throw error;
  }
}

/**
 * Determine if a reminder should be sent based on appointment time and reminder interval
 */
function shouldSendReminder(
  appointmentTime: Date,
  minutesBefore: number,
  currentTime: Date
): boolean {
  const appointmentMs = appointmentTime.getTime();
  const currentMs = currentTime.getTime();
  
  // Calculate when the reminder should be sent
  const reminderTimeMs = appointmentMs - (minutesBefore * 60 * 1000);
  
  // Calculate the buffer window
  const bufferMs = REMINDER_CONFIG.TIME_BUFFER_MINUTES * 60 * 1000;
  
  // Check if current time is within the reminder window
  // (reminderTime - buffer) <= currentTime <= (reminderTime + buffer)
  return currentMs >= (reminderTimeMs - bufferMs) && 
         currentMs <= (reminderTimeMs + bufferMs);
}

/**
 * Send a reminder for a specific appointment
 */
async function sendReminder(
  appointmentId: string,
  reminderKey: string,
  minutesBefore: number
): Promise<void> {
  try {
    // Fetch full appointment details with patient and doctor info
    const result = await db
      .select({
        appointment: appointments,
        patient: patients,
        doctor: doctors,
      })
      .from(appointments)
      .innerJoin(patients, eq(appointments.patientId, patients.id))
      .innerJoin(doctors, eq(appointments.doctorId, doctors.id))
      .where(eq(appointments.id, appointmentId))
      .limit(1);

    if (result.length === 0) {
      console.error(`Appointment ${appointmentId} not found`);
      return;
    }

    const { appointment, patient, doctor } = result[0];

    // Send the notification
    await sendReminderNotification({
      appointment,
      patient,
      doctor,
      reminderType: reminderKey,
      minutesBefore,
    });

    // Update appointment to mark reminder as sent
    const updatedRemindersSent = [
      ...(appointment.remindersSent || []),
      reminderKey,
    ];

    await db
      .update(appointments)
      .set({
        remindersSent: updatedRemindersSent,
        updatedAt: new Date(),
      })
      .where(eq(appointments.id, appointmentId));

    console.log(`✅ Sent ${reminderKey} reminder for appointment ${appointmentId}`);
  } catch (error) {
    console.error(`❌ Error sending reminder for appointment ${appointmentId}:`, error);
    throw error;
  }
}
