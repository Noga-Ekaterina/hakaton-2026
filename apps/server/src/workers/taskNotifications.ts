import { prisma } from "../lib/prisma.js";
import { sendTaskAssigneeNotificationEmail } from "../lib/mail.js";

const DEFAULT_INTERVAL_MS = 30 * 60 * 1000;
const DEFAULT_BATCH_SIZE = 500;

type StartTaskNotificationWorkerOptions = {
  intervalMs?: number;
  batchSize?: number;
};

export async function processPendingTaskNotifications(batchSize = DEFAULT_BATCH_SIZE) {
  const events = await prisma.taskNotificationAssignee.findMany({
    orderBy: [
      {
        assigneeId: "asc",
      },
      {
        createdAt: "asc",
      },
    ],
    take: batchSize,
    include: {
      assignee: {
        select: {
          email: true,
        },
      },
      task: {
        select: {
          id: true,
          title: true,
          project: {
            select: {
              id: true,
              name: true,
            },
          }
        },
      },
    },
  });

  const groups = new Map<
    number,
    {
      email: string;
      tasks: { id: number; title: string; project: { id: number; name: string } }[];
      eventIds: number[];
    }
  >();

  for (const event of events) {
    if (!event.task) {
      continue;
    }

    const group = groups.get(event.assigneeId) ?? {
      email: event.assignee.email,
      tasks: [],
      eventIds: [],
    };

    group.tasks.push(event.task);
    group.eventIds.push(event.id);
    groups.set(event.assigneeId, group);
  }

  for (const group of groups.values()) {
    await sendTaskAssigneeNotificationEmail({
      email: group.email,
      tasks: group.tasks,
    });

    await prisma.taskNotificationAssignee.deleteMany({
      where: {
        id: {
          in: group.eventIds,
        },
      },
    });
  }
}

export function startTaskNotificationWorker(options: StartTaskNotificationWorkerOptions = {}) {
  const intervalMs = options.intervalMs ?? DEFAULT_INTERVAL_MS;
  const batchSize = options.batchSize ?? DEFAULT_BATCH_SIZE;
  let isRunning = false;

  const run = async () => {
    if (isRunning) {
      return;
    }

    isRunning = true;

    try {
      await processPendingTaskNotifications(batchSize);
    } catch (error) {
      console.error("Task notification worker error:", error);
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
