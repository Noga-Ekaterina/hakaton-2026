import type { Project } from "@hakaton/shared";

export function serializeProject(project: { id: number; name: string }): Project {
  return {
    id: project.id,
    name: project.name,
  };
}
