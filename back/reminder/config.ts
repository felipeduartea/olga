export const REMINDER_CONFIG = {
  // How often the worker checks for appointments needing reminders (in milliseconds)
  CHECK_INTERVAL_MS: 5 * 60 * 1000, // 5 minutes

  // Default reminder times in minutes before appointment
  DEFAULT_REMINDER_INTERVALS: [
    1440, // 24 hours
    // 60,  // 1 hour (can add more)
    // 15,  // 15 minutes
  ],

  // Time buffer/tolerance in minutes
  // If an appointment is within (reminderTime ± buffer), send the reminder
  TIME_BUFFER_MINUTES: 10,

  // Only send reminders for appointments with these statuses
  VALID_STATUSES: ["scheduled"],
} as const;

// Helper function to convert minutes to human-readable format
export function formatReminderTime(minutes: number): string {
  if (minutes >= 1440) {
    const days = Math.floor(minutes / 1440);
    return `${days}d`;
  } else if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    return `${hours}h`;
  } else {
    return `${minutes}m`;
  }
}

