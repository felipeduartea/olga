# Follow-up Calling System

A comprehensive post-appointment follow-up calling system that monitors patient recovery, prescription compliance, and overall care quality.

## Overview

This system automatically manages follow-up calls for patients based on two key triggers:

1. **Follow-up Appointments** - When a doctor schedules a follow-up (`hasFollowUp = true`)
2. **Prescription Monitoring** - When medications are prescribed that require monitoring

### 🎯 Key Feature: Combined Logic

**If both triggers are present, they are intelligently combined into a SINGLE calling schedule** to avoid redundant calls and provide a better patient experience.

## Calling Schedule

The system uses a three-phase approach:

### Phase 1: Daily Calls (Days 1-7)
- **When**: First week after appointment
- **Frequency**: Every day
- **Purpose**: Critical monitoring period for immediate issues, medication side effects, and initial compliance
- **Total Calls**: 7

### Phase 2: Weekly Calls (Days 14, 21, 28, 35)
- **When**: Weeks 2-5 after appointment  
- **Frequency**: Once per week
- **Purpose**: Continued monitoring as patient stabilizes
- **Total Calls**: 4

### Phase 3: Monthly Calls (Days 65, 95, 125...)
- **When**: After 5 weeks
- **Frequency**: Once per month
- **Purpose**: Long-term monitoring for chronic conditions
- **Total Calls**: Up to 12 (configurable)

**Total Maximum Calls**: 23 calls over approximately 1 year

## Architecture

```
followup/
├── config.ts              # Configuration and scheduling logic
├── followUpService.ts     # Core service with combined logic
├── notifications.ts       # Call/notification handlers
├── worker.ts             # Worker process
├── index.ts              # Main exports
└── README.md             # This file
```

## Database Schema

### `follow_up_calls` Table

Tracks all follow-up calling series:

| Field | Type | Description |
|-------|------|-------------|
| `id` | varchar(128) | Primary key |
| `appointmentId` | varchar(128) | Reference to appointment |
| `followUpStartDate` | timestamp | When follow-up care started |
| `followUpType` | varchar(20) | 'follow_up', 'prescription', or 'both' |
| `callSchedule` | jsonb | Complete schedule with status tracking |
| `nextCallDate` | timestamp | Quick reference for next call |
| `currentPhase` | varchar(20) | 'daily', 'weekly', 'monthly', or 'completed' |
| `callsMade` | integer | Total successful calls |
| `isActive` | boolean | Whether series is still active |
| `completedAt` | timestamp | When series completed |
| `metadata` | jsonb | Additional tracking info |

## Usage

### Starting the Worker

```typescript
import { startFollowUpWorker } from './followup/index.js';

// Start the worker - it will run every 6 hours by default
startFollowUpWorker();
```

### Stopping the Worker

```typescript
import { stopFollowUpWorker } from './followup/index.js';

// Gracefully stop the worker
await stopFollowUpWorker();
```

### Manual Trigger

```typescript
import { runFollowUpWorkerNow } from './followup/index.js';

// Trigger an immediate run (useful for testing)
await runFollowUpWorkerNow();
```

### Get Follow-up Stats

```typescript
import { getFollowUpStats } from './followup/index.js';

const stats = await getFollowUpStats(appointmentId);
console.log(stats);
// {
//   hasFollowUp: true,
//   followUpType: 'both',
//   callsMade: 5,
//   totalCallsScheduled: 23,
//   currentPhase: 'weekly',
//   nextCallDate: Date,
//   isActive: true
// }
```

### Manual Call Management

```typescript
import { markCallCompleted, deactivateFollowUp } from './followup/index.js';

// Manually mark a call as completed
await markCallCompleted(followUpId, callNumber, 'Patient called back');

// Deactivate a follow-up series (e.g., patient requested)
await deactivateFollowUp(followUpId, 'Patient requested to stop calls');
```

## How It Works

### 1. Initialization

When an appointment is marked as `completed`:
- System checks if appointment has `hasFollowUp = true`
- System checks if appointment has prescriptions
- If either is true, creates a follow-up tracking record
- Generates complete calling schedule (all 23 calls pre-scheduled)

### 2. Combined Logic

The system intelligently determines the follow-up type:

```typescript
if (hasFollowUp && hasPrescriptions) {
  // Type: 'both' - ONE combined schedule
  followUpType = 'both';
} else if (hasFollowUp) {
  // Type: 'follow_up' - Follow-up only
  followUpType = 'follow_up';
} else if (hasPrescriptions) {
  // Type: 'prescription' - Prescription monitoring only
  followUpType = 'prescription';
}
```

### 3. Call Processing

Every 6 hours (configurable), the worker:
1. Checks for new completed appointments
2. Initializes follow-up tracking
3. Finds calls that are due (within time buffer)
4. Makes the calls through configured channels
5. Updates call status and schedules next call
6. Transitions between phases automatically

### 4. Call Content

Calls are personalized based on:
- Follow-up type (follow_up, prescription, or both)
- Current phase (daily, weekly, monthly)
- Patient's diagnosis and symptoms
- Prescribed medications
- Previous call responses

## Configuration

Edit `config.ts` to customize:

```typescript
export const FOLLOWUP_CONFIG = {
  // Worker check interval (default: 6 hours)
  CHECK_INTERVAL_MS: 6 * 60 * 60 * 1000,
  
  // Time buffer for "call is due" (default: ±4 hours)
  CALL_TIME_BUFFER_HOURS: 4,
  
  // Daily phase configuration
  DAILY_PHASE: {
    duration: 7,    // 7 days
    interval: 1,    // Every 1 day
  },
  
  // Weekly phase configuration
  WEEKLY_PHASE: {
    duration: 28,   // 4 weeks
    interval: 7,    // Every 7 days
    startDay: 8,
  },
  
  // Monthly phase configuration
  MONTHLY_PHASE: {
    interval: 30,   // Every 30 days
    startDay: 36,
    maxCalls: 12,   // Maximum 12 monthly calls
  },
};
```

## Notification Channels

The system supports multiple notification channels (currently placeholder):

1. **Phone Calls** - Primary channel (integrate with Twilio, Vonage, or AI agent)
2. **SMS** - Text message notifications
3. **Email** - Detailed email follow-ups
4. **Push Notifications** - Mobile app notifications (future)

### Integration Points

Edit `notifications.ts` to integrate with your services:

```typescript
// Phone calls - integrate with Twilio
async function sendPhoneCall(context, content) {
  const call = await twilioClient.calls.create({
    to: patient.phone,
    from: TWILIO_PHONE_NUMBER,
    url: 'https://your-server.com/twiml/follow-up-call',
  });
}

// SMS - integrate with Twilio SMS
async function sendSMSNotification(context, content) {
  const message = await twilioClient.messages.create({
    body: smsMessage,
    to: patient.phone,
    from: TWILIO_PHONE_NUMBER,
  });
}

// Email - integrate with SendGrid
async function sendEmailNotification(context, content) {
  await sgMail.send({
    to: patient.email,
    from: VERIFIED_SENDER_EMAIL,
    subject: emailSubject,
    text: emailBody,
  });
}
```

## Example Call Flow

For a patient with BOTH follow-up appointment and prescriptions:

```
Day 1:  ☎️ Daily call - How are you feeling? Taking medications?
Day 2:  ☎️ Daily call - Any side effects? Questions about medications?
Day 3:  ☎️ Daily call - Checking in on recovery progress
Day 4:  ☎️ Daily call - Medication routine going well?
Day 5:  ☎️ Daily call - Any new symptoms or concerns?
Day 6:  ☎️ Daily call - How effective are the medications?
Day 7:  ☎️ Daily call - Final daily check - any issues?

Day 14: ☎️ Weekly call - Overall progress check, medication effectiveness
Day 21: ☎️ Weekly call - Continued monitoring, refill needs?
Day 28: ☎️ Weekly call - Treatment plan discussion
Day 35: ☎️ Weekly call - Final weekly check before monthly phase

Day 65: ☎️ Monthly call - Long-term progress, treatment adjustments?
Day 95: ☎️ Monthly call - Continued care monitoring
...continues monthly for up to 1 year
```

## Monitoring & Health Checks

```typescript
import { getWorkerStatus } from './followup/index.js';

const status = getWorkerStatus();
console.log(status);
// {
//   isRunning: false,
//   isActive: true,
//   config: {
//     checkIntervalHours: 6,
//     callBufferHours: 4,
//     dailyPhaseDays: 7,
//     weeklyPhaseDays: 28,
//     monthlyPhaseMaxCalls: 12
//   }
// }
```

## Error Handling

The system includes comprehensive error handling:

- **Failed calls** are marked in the schedule with status 'failed'
- **Retry logic** can be implemented in notifications.ts
- **Worker crashes** are logged with full stack traces
- **Graceful shutdown** ensures current operations complete

## Future Enhancements

- [ ] AI voice agent integration for automated calls
- [ ] Response recording and analysis
- [ ] Sentiment analysis on patient responses
- [ ] Automatic escalation for concerning responses
- [ ] SMS two-way communication
- [ ] Patient portal integration
- [ ] Analytics dashboard for follow-up effectiveness
- [ ] A/B testing for different calling schedules
- [ ] Integration with electronic health records (EHR)

## Testing

```typescript
// Test the complete schedule generation
import { generateCallSchedule } from './followup/config.js';

const schedule = generateCallSchedule(new Date());
console.log(`Generated ${schedule.length} calls`);
console.log('First 5 calls:', schedule.slice(0, 5));

// Test call due logic
import { isCallDue } from './followup/config.js';

const callDate = new Date('2025-01-01T10:00:00Z');
const now = new Date('2025-01-01T11:00:00Z');
console.log('Is call due?', isCallDue(callDate, now)); // true (within buffer)
```

## Migration

To apply the database schema changes:

```bash
cd back
npm run db:migrate
```

## Questions?

For questions or issues with the follow-up calling system, please contact the development team or open an issue in the project repository.

---

**Built with care for better patient outcomes** 🏥💙

