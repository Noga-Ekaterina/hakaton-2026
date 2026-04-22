import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { Prisma, PrismaClient, TaskPriority, TaskStatus, UserRole } from "@prisma/client";
import {
  assignUserProjectSchema,
  changeUserRoleSchema,
  createProjectSchema,
  createTaskSchema,
  createUserSchema,
  loginSchema,
  taskStatusSchema,
  type Project,
  type Task,
  type TaskPriority as SharedTaskPriority,
  type TaskStatus as SharedTaskStatus,
  type User,
  type UserRole as SharedUserRole,
} from "@hakaton/shared";

const prisma = new PrismaClient();
const app = express();
const port = Number(process.env.PORT ?? 4000);
const sessionCookieName = "qitask_session";

type TaskWithRelations = Prisma.TaskGetPayload<{
  include: {
    author: true;
    assignee: true;
    project: true;
  };
}>;

type UserWithProject = Prisma.UserGetPayload<{
  include: {
    project: true;
  };
}>;

const allowedOrigins = new Set([
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:4173",
]);

function toIso(value: Date) {
  return value.toISOString();
}

function buildShortDescription(description: string) {
  const trimmed = description.trim();
  return trimmed.length <= 96 ? trimmed : `${trimmed.slice(0, 93)}...`;
}

function serializeProject(project: { id: number; name: string }): Project {
  return {
    id: project.id,
    name: project.name,
  };
}

function serializeUser(user: UserWithProject): User {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role as SharedUserRole,
    projectId: user.projectId,
    projectName: user.project?.name ?? null,
    project: user.project ? serializeProject(user.project) : undefined,
  };
}

function serializeTask(task: TaskWithRelations): Task {
  const deadline = task.deadline.toISOString();

  return {
    id: task.id,
    title: task.title,
    description: task.description,
    shortDescription: task.shortDescription,
    status: task.status as SharedTaskStatus,
    priority: task.priority as SharedTaskPriority,
    deadline,
    createdAt: toIso(task.createdAt),
    authorId: task.authorId,
    authorName: task.author.name,
    assigneeId: task.assigneeId,
    assigneeName: task.assignee.name,
    projectId: task.projectId,
    isOverdue: task.status !== TaskStatus.DONE && task.deadline.getTime() < Date.now(),
  };
}

function getSessionUserId(req: express.Request) {
  const rawValue = req.cookies?.[sessionCookieName];
  if (typeof rawValue !== "string" || rawValue.trim() === "") {
    return null;
  }

  const parsed = Number(rawValue);
  return Number.isInteger(parsed) ? parsed : null;
}

async function requireSessionUser(req: express.Request, res: express.Response) {
  const userId = getSessionUserId(req);

  if (!userId) {
    res.status(401).json({ message: "Сессия не найдена." });
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { project: true },
  });

  if (!user) {
    res.status(401).json({ message: "Сессия не найдена." });
    return null;
  }

  return user;
}

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origin ${origin} is not allowed`));
    },
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/auth/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.issues[0]?.message ?? "Некорректные данные" });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    include: { project: true },
  });

  if (!user || user.password !== parsed.data.password) {
    res.status(401).json({ message: "Неверный email или пароль." });
    return;
  }

  res.cookie(sessionCookieName, String(user.id), {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
  });

  res.json(serializeUser(user));
});

app.get("/api/auth/me", async (req, res) => {
  const user = await requireSessionUser(req, res);

  if (!user) {
    return;
  }

  res.json(serializeUser(user));
});

app.post("/api/auth/logout", (_req, res) => {
  res.clearCookie(sessionCookieName, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
  });
  res.status(204).end();
});

app.get("/api/users", async (_req, res) => {
  const users = await prisma.user.findMany({
    orderBy: { id: "asc" },
    include: { project: true },
  });

  res.json(users.map(serializeUser));
});

app.post("/api/users/register", async (req, res) => {
  const parsed = createUserSchema.safeParse(req.query);

  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.issues[0]?.message ?? "Некорректные данные" });
    return;
  }

  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });

  if (existing) {
    res.status(409).json({ message: "Пользователь с таким email уже существует." });
    return;
  }

  const projectId = parsed.data.projectId ? Number(parsed.data.projectId) : null;

  if (parsed.data.role === "USER" && !projectId) {
    res.status(400).json({ message: "Выберите проект." });
    return;
  }

  const project = projectId
    ? await prisma.project.findUnique({ where: { id: projectId } })
    : null;

  if (projectId && !project) {
    res.status(404).json({ message: "Проект не найден." });
    return;
  }

  const createdUser = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      password: parsed.data.password,
      role: parsed.data.role as UserRole,
      projectId: parsed.data.role === "ADMIN" ? null : projectId,
    },
    include: { project: true },
  });

  res.status(201).json(serializeUser(createdUser));
});

app.post("/api/users/:id/change-role", async (req, res) => {
  const parsedParams = changeUserRoleSchema.safeParse(req.query);
  const userId = Number(req.params.id);

  if (!Number.isInteger(userId)) {
    res.status(400).json({ message: "Некорректный идентификатор пользователя." });
    return;
  }

  if (!parsedParams.success) {
    res.status(400).json({ message: parsedParams.error.issues[0]?.message ?? "Некорректные данные" });
    return;
  }

  const existing = await prisma.user.findUnique({
    where: { id: userId },
    include: { project: true },
  });

  if (!existing) {
    res.status(404).json({ message: "Пользователь не найден." });
    return;
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      role: parsedParams.data.role as UserRole,
      projectId: parsedParams.data.role === "ADMIN" ? null : undefined,
    },
    include: { project: true },
  });

  res.json(serializeUser(updated));
});

app.post("/api/users/:id/assign-project", async (req, res) => {
  const userId = Number(req.params.id);

  if (!Number.isInteger(userId)) {
    res.status(400).json({ message: "Некорректный идентификатор пользователя." });
    return;
  }

  const existing = await prisma.user.findUnique({
    where: { id: userId },
    include: { project: true },
  });

  if (!existing) {
    res.status(404).json({ message: "Пользователь не найден." });
    return;
  }

  const parsed = assignUserProjectSchema.safeParse(req.query);

  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.issues[0]?.message ?? "Некорректные данные" });
    return;
  }

  const projectId = Number(parsed.data.projectId);

  if (!Number.isInteger(projectId)) {
    res.status(400).json({ message: "Некорректный идентификатор проекта." });
    return;
  }

  const project = await prisma.project.findUnique({ where: { id: projectId } });

  if (!project) {
    res.status(404).json({ message: "Проект не найден." });
    return;
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { projectId },
    include: { project: true },
  });

  res.json(serializeUser(updated));
});

app.get("/api/projects", async (_req, res) => {
  const projects = await prisma.project.findMany({
    orderBy: { id: "asc" },
  });

  res.json(projects.map(serializeProject));
});

app.post("/api/projects", async (req, res) => {
  const parsed = createProjectSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.issues[0]?.message ?? "Некорректные данные" });
    return;
  }

  const project = await prisma.project.create({
    data: { name: parsed.data.name },
  });

  res.status(201).json(serializeProject(project));
});

app.patch("/api/projects/:id", async (req, res) => {
  const projectId = Number(req.params.id);

  if (!Number.isInteger(projectId)) {
    res.status(400).json({ message: "Некорректный идентификатор проекта." });
    return;
  }

  const existing = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!existing) {
    res.status(404).json({ message: "Проект не найден." });
    return;
  }

  const parsed = createProjectSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.issues[0]?.message ?? "Некорректные данные" });
    return;
  }

  const project = await prisma.project.update({
    where: { id: projectId },
    data: { name: parsed.data.name },
  });

  res.json(serializeProject(project));
});

app.get("/api/tasks", async (_req, res) => {
  const tasks = await prisma.task.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      author: true,
      assignee: true,
      project: true,
    },
  });

  res.json(tasks.map(serializeTask));
});

app.get("/api/meta", async (_req, res) => {
  const [projects, users] = await Promise.all([
    prisma.project.findMany({ orderBy: { id: "asc" } }),
    prisma.user.findMany({
      orderBy: { id: "asc" },
      include: { project: true },
    }),
  ]);

  res.json({
    projects: projects.map((project) => ({
      ...serializeProject(project),
      description: null,
    })),
    users: users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      password: user.password,
      role: user.role as SharedUserRole,
      project: user.project
        ? {
            ...serializeProject(user.project),
            description: null,
          }
        : null,
      createdAt: toIso(user.createdAt),
      active: true,
    })),
    roles: ["USER", "ADMIN"] as SharedUserRole[],
    taskStatuses: ["NEW", "IN_PROGRESS", "BLOCKED", "DONE"] as SharedTaskStatus[],
    taskPriorities: ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as SharedTaskPriority[],
  });
});

app.post("/api/tasks", async (req, res) => {
  const parsedBody = createTaskSchema.safeParse(req.body);
  const authorId = Number(req.query.authorId);

  if (!parsedBody.success) {
    res.status(400).json({ message: parsedBody.error.issues[0]?.message ?? "Некорректные данные" });
    return;
  }

  if (!Number.isInteger(authorId)) {
    res.status(400).json({ message: "Некорректный идентификатор автора." });
    return;
  }

  const assigneeId = Number(parsedBody.data.assigneeId);
  const projectId = Number(parsedBody.data.projectId);

  if (!Number.isInteger(assigneeId) || !Number.isInteger(projectId)) {
    res.status(400).json({ message: "Некорректные идентификаторы проекта или исполнителя." });
    return;
  }

  const [author, assignee, project] = await Promise.all([
    prisma.user.findUnique({ where: { id: authorId } }),
    prisma.user.findUnique({ where: { id: assigneeId } }),
    prisma.project.findUnique({ where: { id: projectId } }),
  ]);

  if (!author) {
    res.status(404).json({ message: "Автор не найден." });
    return;
  }

  if (!assignee) {
    res.status(404).json({ message: "Исполнитель не найден." });
    return;
  }

  if (!project) {
    res.status(404).json({ message: "Проект не найден." });
    return;
  }

  const task = await prisma.task.create({
    data: {
      title: parsedBody.data.title,
      description: parsedBody.data.description,
      shortDescription: buildShortDescription(parsedBody.data.description),
      priority: parsedBody.data.priority as TaskPriority,
      deadline: new Date(parsedBody.data.deadline),
      authorId,
      assigneeId,
      projectId,
      status: TaskStatus.NEW,
    },
    include: {
      author: true,
      assignee: true,
      project: true,
    },
  });

  res.status(201).json(serializeTask(task));
});

app.patch("/api/tasks/:id", async (req, res) => {
  const taskId = Number(req.params.id);

  if (!Number.isInteger(taskId)) {
    res.status(400).json({ message: "Некорректный идентификатор задачи." });
    return;
  }

  const existing = await prisma.task.findUnique({
    where: { id: taskId },
    include: { author: true, assignee: true, project: true },
  });

  if (!existing) {
    res.status(404).json({ message: "Задача не найдена." });
    return;
  }

  const parsed = taskStatusSchema.safeParse(req.body.status);

  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.issues[0]?.message ?? "Некорректные данные" });
    return;
  }

  const task = await prisma.task.update({
    where: { id: taskId },
    data: {
      status: parsed.data as TaskStatus,
    },
    include: {
      author: true,
      assignee: true,
      project: true,
    },
  });

  res.json(serializeTask(task));
});

app.use((_req, res) => {
  res.status(404).json({ message: "Маршрут не найден." });
});

async function shutdown() {
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
