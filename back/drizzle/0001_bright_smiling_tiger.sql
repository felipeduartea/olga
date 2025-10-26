CREATE TABLE "appointment_outputs" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"appointment_id" varchar(128) NOT NULL,
	"diagnosis" text,
	"common_symptoms" text,
	"additional_observations" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "appointment_outputs_appointment_id_unique" UNIQUE("appointment_id")
);
--> statement-breakpoint
CREATE TABLE "prescriptions" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"appointment_id" varchar(128) NOT NULL,
	"medication_name" varchar(255) NOT NULL,
	"pharmaceutical_form" varchar(100),
	"dosage" varchar(100),
	"frequency" varchar(255),
	"duration" varchar(100),
	"additional_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "reminders_sent" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "reminder_times" jsonb DEFAULT '[1440]'::jsonb;--> statement-breakpoint
ALTER TABLE "appointment_outputs" ADD CONSTRAINT "appointment_outputs_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" DROP COLUMN "doctor_instructions";