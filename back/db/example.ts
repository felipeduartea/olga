import { db } from "./index";
import { patients, doctors, appointments } from "./schema";
import { eq } from "drizzle-orm";

// Example: Create a new patient
async function createPatient() {
  const newPatient = await db
    .insert(patients)
    .values({
      name: "John Doe",
      age: 35,
      sex: "MALE",
      email: "john@example.com",
      phone: "+1234567890",
    })
    .returning();

  console.log("Created patient:", newPatient);
  return newPatient[0];
}

// Example: Create a new doctor
async function createDoctor() {
  const newDoctor = await db
    .insert(doctors)
    .values({
      name: "Dr. Sarah Smith",
      email: "sarah@clinic.com",
      specialty: "General Practice",
      timeZone: "America/Los_Angeles",
      defaultAppointmentDuration: 30,
    })
    .returning();

  console.log("Created doctor:", newDoctor);
  return newDoctor[0];
}

// Example: Create an appointment
async function createAppointment(patientId: string, doctorId: string) {
  const appointmentTime = new Date("2025-10-26T10:00:00-07:00");
  const appointmentEnd = new Date("2025-10-26T10:30:00-07:00");

  const newAppointment = await db
    .insert(appointments)
    .values({
      patientId,
      doctorId,
      appointmentTime,
      appointmentEnd,
      duration: 30,
      status: "scheduled",
      timeZone: "America/Los_Angeles",
    })
    .returning();

  console.log("Created appointment:", newAppointment);
  return newAppointment[0];
}

// Example: Get all appointments for a patient
async function getPatientAppointments(patientId: string) {
  const patientAppointments = await db
    .select()
    .from(appointments)
    .where(eq(appointments.patientId, patientId));

  console.log("Patient appointments:", patientAppointments);
  return patientAppointments;
}

// Example: Update appointment with transcript URLs
async function addTranscriptToAppointment(
  appointmentId: string,
  transcriptUrl: string
) {
  const updated = await db
    .update(appointments)
    .set({
      callTranscriptUrls: [transcriptUrl],
      status: "completed",
    })
    .where(eq(appointments.id, appointmentId))
    .returning();

  console.log("Updated appointment:", updated);
  return updated[0];
}

// Run examples
async function main() {
  const patient = await createPatient();
  const doctor = await createDoctor();
  const appointment = await createAppointment(patient.id, doctor.id);
  await getPatientAppointments(patient.id);
  await addTranscriptToAppointment(
    appointment.id,
    "https://storage.example.com/transcripts/123.txt"
  );
}

// Uncomment to run:
// main().catch(console.error);

