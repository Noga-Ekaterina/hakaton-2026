import { prisma } from "../lib/prisma.js";

const DEFAULT_INTERVAL_MS = 1000 * 60 * 60 * 24;

type StartRefreshSessionCleanupWorkerOptions = {
  intervalMs?: number;
};

export async function deleteExpiredRefreshSessions() {
  return prisma.refreshSession.deleteMany({
    where: {
      expiresAt: {
        lte: new Date(),
      },
    },
  });
}

export function startRefreshSessionCleanupWorker(options: StartRefreshSessionCleanupWorkerOptions = {}) {
  const intervalMs = options.intervalMs ?? DEFAULT_INTERVAL_MS;
  let isRunning = false;

  const run = async () => {
    if (isRunning) {
      return;
    }

    isRunning = true;

    try {
      await deleteExpiredRefreshSessions();
    } catch (error) {
      console.error("Refresh session cleanup worker error:", error);
    } finally {
      isRunning = false;
    }
  };

  void run();

  const timer = setInterval(() => {
    void run();
  }, intervalMs);

  return () => {
    clearInterval(timer);
  };
}
