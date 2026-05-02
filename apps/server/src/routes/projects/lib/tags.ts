export function serializeTaskTag(tag: { id: number; name: string; color: string; projectId: number }) {
  return {
    id: tag.id,
    name: tag.name,
    color: tag.color,
    projectId: tag.projectId,
  };
}
