import { processPendingReminders } from "./reminderService";
import { REMINDER_CONFIG } from "./config";

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
function startWorker(): void {
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
 */
function stopWorker(): void {
  console.log("\n⏸️  Stopping Appointment Reminder Worker...");

  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }

  // Wait for current operation to finish
  const checkInterval = setInterval(() => {
    if (!isRunning) {
      clearInterval(checkInterval);
      console.log("✅ Worker stopped gracefully");
      process.exit(0);
    }
  }, 100);

  // Force exit after 10 seconds if still running
  setTimeout(() => {
    console.log("⚠️  Force stopping worker");
    process.exit(1);
  }, 10000);
}

// Handle graceful shutdown
process.on("SIGTERM", stopWorker);
process.on("SIGINT", stopWorker);

// Handle uncaught errors
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  stopWorker();
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  stopWorker();
});

// Start the worker
startWorker();

