import { createApp } from "./app.js";
import { prisma } from "./lib/prisma.js";
import { startTaskNotificationWorker } from "./workers/taskNotifications.js";

const port = Number(process.env.PORT ?? 4000);
const app = createApp();
const stopTaskNotificationWorker = startTaskNotificationWorker();

async function shutdown() {
  stopTaskNotificationWorker();
  await prisma.$disconnect();
}

process.on("SIGINT", async () => {
  await shutdown();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await shutdown();
  process.exit(0);
});

app.listen(port, () => {
  console.log(`QITask API is running on http://localhost:${port}`);
});
