export function normalizeProjectIds(rawProjectIds: unknown) {
  if (Array.isArray(rawProjectIds)) {
    return rawProjectIds.map(String).filter((value) => value.trim() !== "");
  }

  if (typeof rawProjectIds === "string" && rawProjectIds.trim() !== "") {
    return [rawProjectIds];
  }

  return [];
}

export function parseProjectIdsFromBody(body: Record<string, unknown>) {
  const projectIdValues = normalizeProjectIds(body.projectIds);
  const fallbackProjectIdValues = normalizeProjectIds(body.projectId);

  return [...new Set(projectIdValues.length > 0 ? projectIdValues : fallbackProjectIdValues)]
    .map((value) => Number(value))
    .filter((value) => Number.isInteger(value) && value > 0);
}
