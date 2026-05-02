export const userRelations = {
  projects: { select: { id: true, name: true } },
} as const;

export const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  ...userRelations,
} as const;

export const userWithPasswordSelect = {
  ...userSelect,
  password: true,
} as const;
