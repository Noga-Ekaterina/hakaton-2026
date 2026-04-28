import { Prisma, UserRole } from "@prisma/client";
import type { Project, Task, TaskPriority as SharedTaskPriority, TaskStatus as SharedTaskStatus, User, UserRole as SharedUserRole } from "@hakaton/shared";

type TaskWithRelations = Prisma.TaskGetPayload<{
  include: {
    author: true;
    assignee: true;
    project: true;
  };
}>;

type UserWithProject = Prisma.UserGetPayload<{
  include: {
    projects: true;
  };
}>;

export function toIso(value: Date) {
  return value.toISOString();
}

export function buildShortDescription(description: string) {
  const trimmed = description.trim();
  return trimmed.length <= 96 ? trimmed : `${trimmed.slice(0, 93)}...`;
}

export function serializeProject(project: { id: number; name: string }): Project {
  return {
    id: project.id,
    name: project.name,
  };
}

export function serializeUser(user: UserWithProject): User {
  const projects = user.projects.map(serializeProject);
  const primaryProject = projects[0] ?? null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role as SharedUserRole,
    projectId: primaryProject?.id ?? null,
    projectName: primaryProject?.name ?? null,
    projects,
  };
}

export function serializeTask(task: TaskWithRelations): Task {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    shortDescription: task.shortDescription,
    status: task.status as SharedTaskStatus,
    priority: task.priority as SharedTaskPriority,
    storyPoints: task.storyPoints,
    createdAt: toIso(task.createdAt),
    authorId: task.authorId,
    authorName: task.author.name,
    assigneeId: task.assigneeId,
    assigneeName: task.assignee.name,
    projectId: task.projectId,
  };
}
