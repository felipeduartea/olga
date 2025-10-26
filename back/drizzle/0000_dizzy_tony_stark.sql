CREATE TABLE "appointments" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"patient_id" varchar(128) NOT NULL,
	"doctor_id" varchar(128) NOT NULL,
	"appointment_time" timestamp with time zone NOT NULL,
	"appointment_end" timestamp with time zone,
	"duration" integer DEFAULT 30 NOT NULL,
	"time_zone" varchar(50) DEFAULT 'America/Los_Angeles' NOT NULL,
	"status" varchar(50) DEFAULT 'scheduled' NOT NULL,
	"call_transcript_urls" jsonb,
	"doctor_instructions" jsonb,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "doctors" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(50),
	"specialty" varchar(100),
	"time_zone" varchar(50) DEFAULT 'America/Los_Angeles' NOT NULL,
	"availability_start" timestamp with time zone,
	"availability_end" timestamp with time zone,
	"default_appointment_duration" integer DEFAULT 30,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "patients" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"date_of_birth" timestamp with time zone,
	"age" integer,
	"height" real,
	"height_unit" varchar(10),
	"weight" real,
	"weight_unit" varchar(10),
	"sex" varchar(10),
	"address" text,
	"phone" varchar(50),
	"email" varchar(255),
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_doctor_id_doctors_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."doctors"("id") ON DELETE cascade ON UPDATE no action;