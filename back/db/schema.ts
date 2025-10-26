import { pgTable, text, timestamp, varchar, integer, real, jsonb, boolean } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";

// Patients table
export const patients = pgTable("patients", {
  id: varchar("id", { length: 128 })
    .primaryKey()
    .$defaultFn(() => createId()),
  name: varchar("name", { length: 255 }).notNull(),
  dateOfBirth: timestamp("date_of_birth", { withTimezone: true }),
  age: integer("age"),
  height: real("height"),
  heightUnit: varchar("height_unit", { length: 10 }), // in cm or inches
  weight: real("weight"), // in kg or lbs
  weightUnit: varchar("weight_unit", { length: 10 }), // in kg or lbs
  sex: varchar("sex", { length: 10 }), // MALE, FEMALE, OTHER
  address: text("address"),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 255 }),
  metadata: jsonb("metadata"), // flexible field for additional patient info
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// Doctors table
export const doctors = pgTable("doctors", {
  id: varchar("id", { length: 128 })
    .primaryKey()
    .$defaultFn(() => createId()),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  specialty: varchar("specialty", { length: 100 }),
  timeZone: varchar("time_zone", { length: 50 })
    .notNull()
    .default("America/Los_Angeles"),
  // Working hours
  availabilityStart: timestamp("availability_start", { withTimezone: true }), // doctor time min
  availabilityEnd: timestamp("availability_end", { withTimezone: true }), // doctor time max
  defaultAppointmentDuration: integer("default_appointment_duration").default(30), // in minutes
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// Appointments table
export const appointments = pgTable("appointments", {
  id: varchar("id", { length: 128 })
    .primaryKey()
    .$defaultFn(() => createId()),
  patientId: varchar("patient_id", { length: 128 })
    .notNull()
    .references(() => patients.id, { onDelete: "cascade" }),
  doctorId: varchar("doctor_id", { length: 128 })
    .notNull()
    .references(() => doctors.id, { onDelete: "cascade" }),
  appointmentTime: timestamp("appointment_time", { withTimezone: true }).notNull(),
  appointmentEnd: timestamp("appointment_end", { withTimezone: true }),
  duration: integer("duration").notNull().default(30), // in minutes
  timeZone: varchar("time_zone", { length: 50 })
    .notNull()
    .default("America/Los_Angeles"),
  status: varchar("status", { length: 50 })
    .notNull()
    .default("scheduled"), // scheduled, completed, cancelled, no-show, rescheduled
  callTranscriptUrls: jsonb("call_transcript_urls").$type<string[]>(), // array of URLs to stored transcripts
  remindersSent: jsonb("reminders_sent").$type<string[]>().default([]), // track which reminders sent (e.g., ["24h", "1h"])
  reminderTimes: jsonb("reminder_times").$type<number[]>().default([1440]), // reminder intervals in minutes [1440 = 24h]
  metadata: jsonb("metadata"), // flexible field for additional appointment info
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// Appointment Outputs table - stores diagnosis and overall appointment outcome
export const appointmentOutputs = pgTable("appointment_outputs", {
  id: varchar("id", { length: 128 })
    .primaryKey()
    .$defaultFn(() => createId()),
  appointmentId: varchar("appointment_id", { length: 128 })
    .notNull()
    .references(() => appointments.id, { onDelete: "cascade" })
    .unique(), // one-to-one relationship with appointments
  diagnosis: text("diagnosis"), // primary diagnosis from the appointment
  commonSymptoms: text("common_symptoms"), // symptoms observed/reported
  additionalObservations: text("additional_observations"), // any additional notes
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  hasFollowUp: boolean("has_follow_up").notNull().default(false),
  followUpDate: timestamp("follow_up_date", { withTimezone: true }),
});

// Prescriptions table - stores individual medication prescriptions (many per appointment)
export const prescriptions = pgTable("prescriptions", {
  id: varchar("id", { length: 128 })
    .primaryKey()
    .$defaultFn(() => createId()),
  appointmentId: varchar("appointment_id", { length: 128 })
    .notNull()
    .references(() => appointments.id, { onDelete: "cascade" }),
  medicationName: varchar("medication_name", { length: 255 }).notNull(), // name of the medication
  pharmaceuticalForm: varchar("pharmaceutical_form", { length: 100 }), // tablet, capsule, syrup, injection, cream, etc.
  dosage: varchar("dosage", { length: 100 }), // e.g., "500mg", "10ml", "2 tablets"
  frequency: varchar("frequency", { length: 255 }), // e.g., "twice daily", "every 8 hours", "once at bedtime"
  duration: varchar("duration", { length: 100 }), // e.g., "7 days", "2 weeks", "until finished"
  additionalNotes: text("additional_notes"), // special instructions for this medication
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// Type exports
export type Patient = typeof patients.$inferSelect;
export type NewPatient = typeof patients.$inferInsert;
export type Doctor = typeof doctors.$inferSelect;
export type NewDoctor = typeof doctors.$inferInsert;
export type Appointment = typeof appointments.$inferSelect;
export type NewAppointment = typeof appointments.$inferInsert;
export type AppointmentOutput = typeof appointmentOutputs.$inferSelect;
export type NewAppointmentOutput = typeof appointmentOutputs.$inferInsert;
export type Prescription = typeof prescriptions.$inferSelect;
export type NewPrescription = typeof prescriptions.$inferInsert;

