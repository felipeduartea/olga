import { pgTable, text, timestamp, varchar, integer, real, jsonb } from "drizzle-orm/pg-core";
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
  doctorInstructions: jsonb("doctor_instructions").$type<string[]>(), // array of instructions
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

// Type exports
export type Patient = typeof patients.$inferSelect;
export type NewPatient = typeof patients.$inferInsert;
export type Doctor = typeof doctors.$inferSelect;
export type NewDoctor = typeof doctors.$inferInsert;
export type Appointment = typeof appointments.$inferSelect;
export type NewAppointment = typeof appointments.$inferInsert;

