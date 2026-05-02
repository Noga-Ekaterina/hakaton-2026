export const taskRelations = {
  author: { select: { name: true } },
  assignee: { select: { name: true } },
  images: { select: { id: true, name: true } },
  tags: { select: { id: true, name: true, color: true, projectId: true } },
} as const;

export const taskDetailSelect = {
  id: true,
  title: true,
  description: true,
  shortDescription: true,
  status: true,
  priority: true,
  storyPoints: true,
  createdAt: true,
  authorId: true,
  assigneeId: true,
  projectId: true,
  ...taskRelations,
} as const;

export const taskListSelect = {
  id: true,
  title: true,
  shortDescription: true,
  status: true,
  priority: true,
  createdAt: true,
  authorId: true,
  assigneeId: true,
  projectId: true,
  author: { select: { name: true } },
  assignee: { select: { name: true } },
  images: { select: { id: true, name: true } },
  tags: { select: { id: true, name: true, color: true, projectId: true } },
} as const;
