CREATE TABLE "follow_up_calls" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"appointment_id" varchar(128) NOT NULL,
	"follow_up_start_date" timestamp with time zone NOT NULL,
	"follow_up_type" varchar(20) NOT NULL,
	"call_schedule" jsonb DEFAULT '[]'::jsonb,
	"next_call_date" timestamp with time zone,
	"current_phase" varchar(20) DEFAULT 'daily' NOT NULL,
	"calls_made" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"completed_at" timestamp with time zone,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "follow_up_calls" ADD CONSTRAINT "follow_up_calls_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE cascade ON UPDATE no action;