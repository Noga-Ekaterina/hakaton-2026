import type { Project } from "@hakaton/shared";

export function serializeProject(project: { id: number; name: string; memberCount?: number }): Project {
  return {
    id: project.id,
    name: project.name,
    memberCount: project.memberCount,
  };
}
