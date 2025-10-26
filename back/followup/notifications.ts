/**
 * Follow-up Call Notifications
 * 
 * This module handles the actual notification/call logic for follow-up calls.
 * In production, this would integrate with:
 * - Phone call APIs (Twilio, Vonage, etc.)
 * - SMS services
 * - Email services
 * - Push notifications
 * - AI voice agents (like your Olga agent)
 * 
 * For now, this is a detailed placeholder that logs what would be sent
 * and provides the structure for real implementations.
 */

import type {
  Appointment,
  Patient,
  Doctor,
  AppointmentOutput,
  Prescription,
  FollowUpCall,
} from "../db/schema.js";
import { CallPhase } from "./config.js";

/**
 * Follow-up call context - all information needed to make an effective call
 */
export interface FollowUpCallContext {
  followUp: FollowUpCall;
  appointment: Appointment;
  patient: Patient;
  doctor: Doctor;
  output: AppointmentOutput | null;
  prescriptions: Prescription[];
  callNumber: number;
  phase: string;
}

/**
 * Main function to send a follow-up call
 * This orchestrates the entire call process
 */
export async function sendFollowUpCall(context: FollowUpCallContext): Promise<void> {
  const {
    followUp,
    appointment,
    patient,
    doctor,
    output,
    prescriptions,
    callNumber,
    phase,
  } = context;

  console.log("\n" + "=".repeat(80));
  console.log("📞 FOLLOW-UP CALL NOTIFICATION");
  console.log("=".repeat(80));

  // Determine the call type and content
  const callContent = generateCallContent(context);

  // Log the call details (in production, this would make the actual call)
  logCallDetails(context, callContent);

  // Send the notification through all configured channels
  await Promise.all([
    sendPhoneCall(context, callContent),
    sendSMSNotification(context, callContent),
    sendEmailNotification(context, callContent),
  ]);

  console.log("=".repeat(80) + "\n");
}

/**
 * Generate personalized call content based on the follow-up type and phase
 */
function generateCallContent(context: FollowUpCallContext): CallContent {
  const { followUp, patient, doctor, output, prescriptions, callNumber, phase } = context;

  // Base greeting
  const greeting = `Hello ${patient.name}, this is a follow-up call from Dr. ${doctor.name}'s office.`;

  // Determine what to ask about based on follow-up type
  const questions: string[] = [];
  const purpose: string[] = [];

  // FOLLOW-UP APPOINTMENT QUESTIONS
  if (followUp.followUpType === 'follow_up' || followUp.followUpType === 'both') {
    purpose.push('checking on your follow-up appointment');
    
    if (output?.diagnosis) {
      questions.push(`How are you feeling since your diagnosis of ${output.diagnosis}?`);
    }
    
    if (output?.commonSymptoms) {
      questions.push(`Are you still experiencing any of the following symptoms: ${output.commonSymptoms}?`);
    }

    questions.push('Have you noticed any new symptoms or concerns?');
    
    if (output?.hasFollowUp && output.followUpDate) {
      const followUpDate = new Date(output.followUpDate).toLocaleDateString();
      questions.push(`Do you remember your scheduled follow-up appointment on ${followUpDate}?`);
    }
  }

  // PRESCRIPTION MONITORING QUESTIONS
  if (followUp.followUpType === 'prescription' || followUp.followUpType === 'both') {
    purpose.push('checking on your medications');

    if (prescriptions.length > 0) {
      questions.push('Are you taking your prescribed medications as directed?');
      
      // List medications
      const medList = prescriptions
        .map(p => `${p.medicationName} (${p.dosage}, ${p.frequency})`)
        .join(', ');
      questions.push(`For reference, you were prescribed: ${medList}`);

      questions.push('Are you experiencing any side effects from your medications?');
      questions.push('Do you have any questions about how to take your medications?');
      
      // Phase-specific questions
      if (phase === CallPhase.DAILY) {
        questions.push('Are you having any trouble with the medication schedule?');
      } else if (phase === CallPhase.WEEKLY) {
        questions.push('Have you been able to maintain your medication routine?');
        questions.push('Do you need a refill on any medications?');
      } else if (phase === CallPhase.MONTHLY) {
        questions.push('How effective do you feel your medications have been?');
        questions.push('Would you like to discuss your treatment plan with the doctor?');
      }
    }
  }

  // Phase-specific content
  let phaseContext = '';
  if (phase === CallPhase.DAILY) {
    phaseContext = 'This is part of our daily check-in during your first week of treatment.';
  } else if (phase === CallPhase.WEEKLY) {
    phaseContext = 'This is your weekly check-in to ensure everything is going well.';
  } else if (phase === CallPhase.MONTHLY) {
    phaseContext = 'This is your monthly follow-up to monitor your long-term progress.';
  }

  // Closing
  const closing = [
    'Is there anything else you would like to discuss?',
    'If you have any concerns, please dont hesitate to call our office.',
    'Thank you for taking the time to speak with us today.',
  ];

  return {
    greeting,
    purpose: purpose.join(' and '),
    phaseContext,
    questions,
    closing,
    callNumber,
    phase,
  };
}

/**
 * Log detailed call information (for debugging and records)
 */
function logCallDetails(context: FollowUpCallContext, content: CallContent): void {
  const { patient, doctor, followUp, appointment } = context;

  console.log(`\nPatient: ${patient.name}`);
  console.log(`Phone: ${patient.phone || 'Not provided'}`);
  console.log(`Email: ${patient.email || 'Not provided'}`);
  console.log(`Doctor: ${doctor.name}`);
  console.log(`\nFollow-up Type: ${followUp.followUpType.toUpperCase()}`);
  console.log(`Call Number: ${content.callNumber}`);
  console.log(`Phase: ${content.phase.toUpperCase()}`);
  console.log(`Appointment ID: ${appointment.id}`);
  console.log(`\nCall Script:`);
  console.log(`-`.repeat(80));
  console.log(content.greeting);
  console.log(`\n${content.phaseContext}`);
  console.log(`\nWe're ${content.purpose}.`);
  console.log(`\nQuestions:`);
  content.questions.forEach((q, i) => {
    console.log(`${i + 1}. ${q}`);
  });
  console.log(`\nClosing:`);
  content.closing.forEach(c => console.log(`- ${c}`));
  console.log(`-`.repeat(80));
}

/**
 * Send actual phone call (placeholder for real implementation)
 * 
 * PRODUCTION IMPLEMENTATION:
 * This would integrate with:
 * - Twilio Voice API
 * - Vonage Voice API  
 * - Custom AI voice agent (like Olga)
 * - Hospital's phone system API
 */
async function sendPhoneCall(
  context: FollowUpCallContext,
  content: CallContent
): Promise<void> {
  const { patient } = context;

  // TODO: Integrate with actual phone calling service
  // Example Twilio integration:
  /*
  const call = await twilioClient.calls.create({
    to: patient.phone,
    from: TWILIO_PHONE_NUMBER,
    url: 'https://your-server.com/twiml/follow-up-call',
    statusCallback: 'https://your-server.com/call-status',
    statusCallbackMethod: 'POST',
  });
  */

  console.log(`\n📞 PHONE CALL: Would call ${patient.phone || 'NO PHONE'}`);
  
  if (!patient.phone) {
    console.log(`   ⚠️  WARNING: No phone number on file for patient`);
  }
}

/**
 * Send SMS notification (placeholder for real implementation)
 * 
 * PRODUCTION IMPLEMENTATION:
 * - Twilio SMS API
 * - AWS SNS
 * - Other SMS gateways
 */
async function sendSMSNotification(
  context: FollowUpCallContext,
  content: CallContent
): Promise<void> {
  const { patient, doctor } = context;

  const smsMessage = `Hello ${patient.name}, this is Dr. ${doctor.name}'s office. ` +
    `We're following up on your recent appointment. ${content.phaseContext} ` +
    `Please call us back at your earliest convenience. Thank you!`;

  // TODO: Integrate with actual SMS service
  // Example Twilio SMS:
  /*
  const message = await twilioClient.messages.create({
    body: smsMessage,
    to: patient.phone,
    from: TWILIO_PHONE_NUMBER,
  });
  */

  console.log(`\n💬 SMS: Would send to ${patient.phone || 'NO PHONE'}`);
  console.log(`   Message: "${smsMessage.substring(0, 100)}..."`);
}

/**
 * Send email notification (placeholder for real implementation)
 * 
 * PRODUCTION IMPLEMENTATION:
 * - SendGrid
 * - AWS SES
 * - Mailgun
 * - Hospital's email system
 */
async function sendEmailNotification(
  context: FollowUpCallContext,
  content: CallContent
): Promise<void> {
  const { patient, doctor, followUp, output, prescriptions } = context;

  const emailSubject = `Follow-up: ${content.phase} check-in from Dr. ${doctor.name}`;
  
  const emailBody = `
Dear ${patient.name},

${content.greeting}

${content.phaseContext}

We're ${content.purpose} and want to ensure you're doing well.

${output?.diagnosis ? `Diagnosis: ${output.diagnosis}` : ''}

${prescriptions.length > 0 ? `
Prescribed Medications:
${prescriptions.map(p => `- ${p.medicationName}: ${p.dosage}, ${p.frequency}`).join('\n')}
` : ''}

Please take a moment to let us know how you're doing. You can:
- Reply to this email
- Call our office at ${doctor.phone || 'the number on file'}
- Use our patient portal

Key questions we'd like to know about:
${content.questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

${content.closing.join('\n')}

Best regards,
${doctor.name}, ${doctor.specialty || 'MD'}
`.trim();

  // TODO: Integrate with actual email service
  // Example SendGrid:
  /*
  await sgMail.send({
    to: patient.email,
    from: VERIFIED_SENDER_EMAIL,
    subject: emailSubject,
    text: emailBody,
    html: generateHTMLEmail(emailBody),
  });
  */

  console.log(`\n📧 EMAIL: Would send to ${patient.email || 'NO EMAIL'}`);
  console.log(`   Subject: "${emailSubject}"`);
  console.log(`   Preview: "${emailBody.substring(0, 150)}..."`);
}

/**
 * Call content structure
 */
interface CallContent {
  greeting: string;
  purpose: string;
  phaseContext: string;
  questions: string[];
  closing: string[];
  callNumber: number;
  phase: string;
}

/**
 * Helper function to format call transcript for storage
 * This would be used when storing the results of the call
 */
export function formatCallTranscript(
  context: FollowUpCallContext,
  content: CallContent,
  responses?: Record<string, string>
): string {
  const timestamp = new Date().toISOString();
  
  let transcript = `FOLLOW-UP CALL TRANSCRIPT\n`;
  transcript += `Date: ${timestamp}\n`;
  transcript += `Call Number: ${content.callNumber}\n`;
  transcript += `Phase: ${content.phase}\n`;
  transcript += `Type: ${context.followUp.followUpType}\n`;
  transcript += `\n${'='.repeat(80)}\n\n`;
  
  transcript += `${content.greeting}\n\n`;
  transcript += `${content.phaseContext}\n\n`;
  
  if (responses) {
    transcript += `PATIENT RESPONSES:\n`;
    Object.entries(responses).forEach(([question, answer]) => {
      transcript += `Q: ${question}\n`;
      transcript += `A: ${answer}\n\n`;
    });
  }
  
  transcript += `\n${content.closing.join(' ')}\n`;
  
  return transcript;
}

