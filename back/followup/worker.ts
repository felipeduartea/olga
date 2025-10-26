import { processPendingFollowUpCalls } from "./followUpService.js";
import { FOLLOWUP_CONFIG } from "./config.js";

let isRunning = false;
let intervalId: NodeJS.Timeout | null = null;

/**
 * Main worker function that processes follow-up calls
 */
async function runWorker(): Promise<void> {
  if (isRunning) {
    console.log("⏸️  Follow-up worker already running, skipping this cycle");
    return;
  }

  isRunning = true;
  const startTime = Date.now();

  try {
    console.log("\n" + "🔄".repeat(40));
    console.log("🏥 FOLLOW-UP WORKER CYCLE START");
    console.log("🔄".repeat(40));
    
    await processPendingFollowUpCalls();
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log("🔄".repeat(40));
    console.log(`✅ FOLLOW-UP WORKER CYCLE COMPLETE (${duration}s)`);
    console.log("🔄".repeat(40) + "\n");
  } catch (error) {
    console.error("❌ Follow-up worker error:", error);
    
    if (error instanceof Error) {
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
      });
    }
  } finally {
    isRunning = false;
  }
}

/**
 * Start the follow-up worker
 * Begins processing follow-up calls on a regular interval
 */
export function startFollowUpWorker(): void {
  console.log("▶️  Running initial follow-up check...\n");
  runWorker();
  intervalId = setInterval(runWorker, FOLLOWUP_CONFIG.CHECK_INTERVAL_MS);
  
  console.log(`✅ Follow-up worker started successfully`);
  console.log(`   Next check in ${FOLLOWUP_CONFIG.CHECK_INTERVAL_MS / 1000 / 60 / 60} hours\n`);
}

/**
 * Stop the worker gracefully
 * Waits for current operation to finish before stopping
 */
export async function stopFollowUpWorker(): Promise<void> {
  console.log("\n⏸️  Stopping Follow-up Worker...");

  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    console.log("   ⏸️  Interval cleared");
  }

  // Wait for current operation to finish
  return new Promise((resolve, reject) => {
    let waitTime = 0;
    const maxWaitTime = 30000; // 30 seconds
    const checkInterval = 100; // Check every 100ms

    const interval = setInterval(() => {
      waitTime += checkInterval;

      if (!isRunning) {
        clearInterval(interval);
        console.log("✅ Follow-up worker stopped gracefully");
        resolve();
      } else if (waitTime >= maxWaitTime) {
        clearInterval(interval);
        console.log("⚠️  Follow-up worker stop timeout (operation still running)");
        reject(new Error("Follow-up worker stop timeout"));
      } else {
        // Log waiting status every 5 seconds
        if (waitTime % 5000 === 0) {
          console.log(`   ⏳ Waiting for current operation to finish (${waitTime / 1000}s)...`);
        }
      }
    }, checkInterval);
  });
}

/**
 * Get worker status
 * Useful for health checks and monitoring
 */
export function getWorkerStatus(): {
  isRunning: boolean;
  isActive: boolean;
  config: {
    checkIntervalHours: number;
    callBufferHours: number;
    dailyPhaseDays: number;
    weeklyPhaseDays: number;
    monthlyPhaseMaxCalls: number;
  };
} {
  return {
    isRunning,
    isActive: intervalId !== null,
    config: {
      checkIntervalHours: FOLLOWUP_CONFIG.CHECK_INTERVAL_MS / 1000 / 60 / 60,
      callBufferHours: FOLLOWUP_CONFIG.CALL_TIME_BUFFER_HOURS,
      dailyPhaseDays: FOLLOWUP_CONFIG.DAILY_PHASE.duration,
      weeklyPhaseDays: FOLLOWUP_CONFIG.WEEKLY_PHASE.duration,
      monthlyPhaseMaxCalls: FOLLOWUP_CONFIG.MONTHLY_PHASE.maxCalls,
    },
  };
}

/**
 * Trigger an immediate worker run (for manual testing or immediate processing)
 */
export async function runFollowUpWorkerNow(): Promise<void> {
  console.log("🔥 Manual trigger: Running follow-up worker immediately...\n");
  await runWorker();
}

