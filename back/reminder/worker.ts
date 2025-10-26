import { processPendingReminders } from "./reminderService.js";
import { REMINDER_CONFIG } from "./config.js";

let isRunning = false;
let intervalId: NodeJS.Timeout | null = null;

/**
 * Main worker function that processes reminders
 */
async function runWorker(): Promise<void> {
  if (isRunning) {
    console.log("Worker already running, skipping this cycle");
    return;
  }

  isRunning = true;

  try {
    await processPendingReminders();
  } catch (error) {
    console.error("Worker error:", error);
  } finally {
    isRunning = false;
  }
}

/**
 * Start the reminder worker
 */
export function startWorker(): void {
  console.log("🚀 Starting Appointment Reminder Worker");
  console.log(`Check interval: ${REMINDER_CONFIG.CHECK_INTERVAL_MS / 1000 / 60} minutes`);
  console.log(`Default reminder intervals: ${REMINDER_CONFIG.DEFAULT_REMINDER_INTERVALS.join(", ")} minutes`);
  console.log("=".repeat(60) + "\n");

  // Run immediately on start
  runWorker();

  // Then run on interval
  intervalId = setInterval(runWorker, REMINDER_CONFIG.CHECK_INTERVAL_MS);
}

/**
 * Stop the worker gracefully
 * Returns a promise that resolves when the worker has stopped
 */
export async function stopWorker(): Promise<void> {
  console.log("\n⏸️  Stopping Appointment Reminder Worker...");

  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }

  // Wait for current operation to finish
  return new Promise((resolve, reject) => {
    const checkInterval = setInterval(() => {
      if (!isRunning) {
        clearInterval(checkInterval);
        console.log("✅ Worker stopped gracefully");
        resolve();
      }
    }, 100);

    // Timeout after 10 seconds
    setTimeout(() => {
      clearInterval(checkInterval);
      console.log("⚠️  Worker stop timeout");
      reject(new Error("Worker stop timeout"));
    }, 10000);
  });
}
