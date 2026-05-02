import { Prisma } from "@prisma/client";
import type { User, UserRole as SharedUserRole } from "@hakaton/shared";

import { serializeProject } from "../../projects/lib/serialize.js";
import { userSelect } from "./userRelations.js";

type UserWithProject = Prisma.UserGetPayload<{
  select: typeof userSelect;
}>;

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
