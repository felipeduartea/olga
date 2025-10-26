import type { Appointment, Patient, Doctor } from "../db/schema";

export interface ReminderContext {
  appointment: Appointment;
  patient: Patient;
  doctor: Doctor;
  reminderType: string; // e.g., "24h", "1h"
  minutesBefore: number;
}

/**
 * Mock notification function - logs reminder details
 * Replace this with real SMS/Email/Call implementation later
 */
export async function sendReminderNotification(
  context: ReminderContext
): Promise<void> {
  const { appointment, patient, doctor, reminderType, minutesBefore } = context;

  console.log("\n" + "=".repeat(60));
  console.log("📢 REMINDER NOTIFICATION");
  console.log("=".repeat(60));
  console.log(`Reminder Type: ${reminderType} (${minutesBefore} minutes before)`);
  console.log(`\nPatient:`);
  console.log(`  - Name: ${patient.name}`);
  console.log(`  - Phone: ${patient.phone || "N/A"}`);
  console.log(`  - Email: ${patient.email || "N/A"}`);
  console.log(`\nDoctor:`);
  console.log(`  - Name: ${doctor.name}`);
  console.log(`  - Specialty: ${doctor.specialty || "N/A"}`);
  console.log(`\nAppointment:`);
  console.log(`  - ID: ${appointment.id}`);
  console.log(`  - Time: ${appointment.appointmentTime.toISOString()}`);
  console.log(`  - Duration: ${appointment.duration} minutes`);
  console.log(`  - Timezone: ${appointment.timeZone}`);
  console.log(`  - Status: ${appointment.status}`);
  console.log("=".repeat(60) + "\n");

  // TODO: Replace with actual notification service
  // Examples:
  // - await sendSMS(patient.phone, message)
  // - await sendEmail(patient.email, subject, message)
  // - await makePhoneCall(patient.phone, message)
}

/**
 * Format a friendly reminder message
 */
export function formatReminderMessage(
  context: ReminderContext
): string {
  const { appointment, doctor, reminderType } = context;
  
  const appointmentDate = new Date(appointment.appointmentTime).toLocaleString(
    "en-US",
    {
      timeZone: appointment.timeZone,
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }
  );

  return `Reminder: You have an appointment with ${doctor.name} in ${reminderType}. 
Appointment: ${appointmentDate}
Duration: ${appointment.duration} minutes
Please arrive 10 minutes early.`;
}

