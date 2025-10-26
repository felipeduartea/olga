/**
 * Configuration for the Follow-up Calling System
 * 
 * This system handles post-appointment follow-up calls based on two triggers:
 * 1. Follow-up appointments (when hasFollowUp = true)
 * 2. Prescriptions (when prescriptions exist for an appointment)
 * 
 * If BOTH triggers are present, they are COMBINED into a single calling schedule
 * to avoid redundant calls to patients.
 */

export const FOLLOWUP_CONFIG = {
  /**
   * How often the worker checks for follow-up calls that need to be made (in milliseconds)
   * Default: Every 6 hours (more frequent than reminders since follow-ups are time-sensitive)
   */
  CHECK_INTERVAL_MS: 6 * 60 * 60 * 1000, // 6 hours

  /**
   * PHASE 1: DAILY CALLS
   * Days 1-7 after appointment completion
   * Critical period for monitoring immediate post-appointment issues,
   * medication side effects, and initial prescription compliance
   */
  DAILY_PHASE: {
    duration: 7, // 7 days
    interval: 1, // Call every 1 day
    description: 'Daily monitoring for the first week',
  },

  /**
   * PHASE 2: WEEKLY CALLS  
   * Weeks 2-5 (Days 8-35 after appointment)
   * Calls on days: 14, 21, 28, 35
   * Continued monitoring as patient stabilizes, checking prescription effectiveness
   */
  WEEKLY_PHASE: {
    duration: 28, // 4 weeks
    interval: 7, // Call every 7 days
    startDay: 8, // Starts after daily phase ends (day 7 + 1)
    description: 'Weekly check-ins for the next month',
  },

  /**
   * PHASE 3: MONTHLY CALLS
   * After week 5 (Day 36+)
   * Calls on days: 65, 95, 125, etc. (roughly monthly)
   * Long-term monitoring for chronic conditions or extended prescriptions
   */
  MONTHLY_PHASE: {
    interval: 30, // Call every 30 days
    startDay: 36, // Starts after weekly phase ends (day 35 + 1)
    maxCalls: 12, // Maximum 12 monthly calls (1 year total)
    description: 'Monthly check-ins for long-term monitoring',
  },

  /**
   * Time window for considering a call "due"
   * If the scheduled call time is within this window, the call should be made
   * Example: If buffer is 4 hours and call scheduled for 10am, call can be made 6am-2pm
   */
  CALL_TIME_BUFFER_HOURS: 4,

  /**
   * Only create follow-ups for appointments with these statuses
   */
  VALID_APPOINTMENT_STATUSES: ['completed'] as const,

  /**
   * Automatically deactivate follow-up series after this many days of inactivity
   * (e.g., if patient requests to stop calls or becomes unreachable)
   */
  AUTO_DEACTIVATE_AFTER_DAYS: 90,

  /**
   * Maximum number of retry attempts for failed calls
   */
  MAX_RETRY_ATTEMPTS: 3,

  /**
   * Retry delay for failed calls (in hours)
   */
  RETRY_DELAY_HOURS: 24,
} as const;

/**
 * Follow-up type enumeration
 */
export enum FollowUpType {
  FOLLOW_UP_ONLY = 'follow_up',
  PRESCRIPTION_ONLY = 'prescription', 
  BOTH = 'both',
}

/**
 * Call phase enumeration
 */
export enum CallPhase {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  COMPLETED = 'completed',
}

/**
 * Call status enumeration
 */
export enum CallStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  SKIPPED = 'skipped',
  FAILED = 'failed',
}

/**
 * Helper function to format days into human-readable format
 */
export function formatDuration(days: number): string {
  if (days === 1) return '1 day';
  if (days < 7) return `${days} days`;
  if (days === 7) return '1 week';
  if (days < 30) {
    const weeks = Math.floor(days / 7);
    return `${weeks} week${weeks > 1 ? 's' : ''}`;
  }
  const months = Math.floor(days / 30);
  return `${months} month${months > 1 ? 's' : ''}`;
}

/**
 * Calculate which phase a follow-up should be in based on days elapsed
 */
export function determinePhase(daysElapsed: number): CallPhase {
  if (daysElapsed <= FOLLOWUP_CONFIG.DAILY_PHASE.duration) {
    return CallPhase.DAILY;
  } else if (daysElapsed <= FOLLOWUP_CONFIG.DAILY_PHASE.duration + FOLLOWUP_CONFIG.WEEKLY_PHASE.duration) {
    return CallPhase.WEEKLY;
  } else {
    return CallPhase.MONTHLY;
  }
}

/**
 * Generate the complete call schedule for a follow-up series
 * Returns an array of scheduled call dates
 */
export function generateCallSchedule(startDate: Date): Array<{
  callNumber: number;
  scheduledFor: Date;
  phase: CallPhase;
  status: CallStatus;
}> {
  const schedule: Array<{
    callNumber: number;
    scheduledFor: Date;
    phase: CallPhase;
    status: CallStatus;
  }> = [];
  
  let callNumber = 1;
  const startTime = new Date(startDate).getTime();

  // PHASE 1: Daily calls (Days 1-7)
  for (let day = 1; day <= FOLLOWUP_CONFIG.DAILY_PHASE.duration; day++) {
    const scheduledDate = new Date(startTime + day * 24 * 60 * 60 * 1000);
    schedule.push({
      callNumber: callNumber++,
      scheduledFor: scheduledDate,
      phase: CallPhase.DAILY,
      status: CallStatus.PENDING,
    });
  }

  // PHASE 2: Weekly calls (Days 14, 21, 28, 35)
  const weeklyPhaseEnd = FOLLOWUP_CONFIG.DAILY_PHASE.duration + FOLLOWUP_CONFIG.WEEKLY_PHASE.duration;
  for (
    let day = FOLLOWUP_CONFIG.WEEKLY_PHASE.startDay + FOLLOWUP_CONFIG.WEEKLY_PHASE.interval - 1;
    day <= weeklyPhaseEnd;
    day += FOLLOWUP_CONFIG.WEEKLY_PHASE.interval
  ) {
    const scheduledDate = new Date(startTime + day * 24 * 60 * 60 * 1000);
    schedule.push({
      callNumber: callNumber++,
      scheduledFor: scheduledDate,
      phase: CallPhase.WEEKLY,
      status: CallStatus.PENDING,
    });
  }

  // PHASE 3: Monthly calls (Days 65, 95, 125, etc.)
  for (let i = 0; i < FOLLOWUP_CONFIG.MONTHLY_PHASE.maxCalls; i++) {
    const day = FOLLOWUP_CONFIG.MONTHLY_PHASE.startDay + (i * FOLLOWUP_CONFIG.MONTHLY_PHASE.interval);
    const scheduledDate = new Date(startTime + day * 24 * 60 * 60 * 1000);
    schedule.push({
      callNumber: callNumber++,
      scheduledFor: scheduledDate,
      phase: CallPhase.MONTHLY,
      status: CallStatus.PENDING,
    });
  }

  return schedule;
}

/**
 * Check if a call is due based on current time and buffer
 */
export function isCallDue(scheduledFor: Date, currentTime: Date = new Date()): boolean {
  const scheduledMs = new Date(scheduledFor).getTime();
  const currentMs = currentTime.getTime();
  const bufferMs = FOLLOWUP_CONFIG.CALL_TIME_BUFFER_HOURS * 60 * 60 * 1000;

  // Call is due if current time is within the buffer window
  // (scheduledTime - buffer) <= currentTime <= (scheduledTime + buffer)
  return currentMs >= (scheduledMs - bufferMs) && currentMs <= (scheduledMs + bufferMs);
}

