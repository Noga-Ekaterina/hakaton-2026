import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useGetProjectsQuery, useGetUsersQuery } from "@/app/store/api/admin-api";
import { useAppSelector } from "@/app/store/hooks";

function getErrorMessage(error: unknown) {
  if (typeof error === "object" && error && "data" in error) {
    return String((error as { data: unknown }).data);
  }

  return null;
}

export function useProjectLayoutModel() {
  const params = useParams();
  const projectId = params.projectId ? Number(params.projectId) : null;
  const currentUser = useAppSelector((state) => state.auth.user);
  const { data: projects, isLoading: projectsLoading, isError: projectsError, error: projectsFetchError } =
    useGetProjectsQuery();
  const { data: users } = useGetUsersQuery();

  const project = useMemo(
    () => (Number.isInteger(projectId) ? projects?.find((item) => item.id === projectId) ?? null : null),
    [projectId, projects],
  );

  const projectUsers = useMemo(() => {
    if (!project || !users) {
      return [];
    }

    return users.filter((user) => user.role === "ADMIN" || user.projects?.some((item) => item.id === project.id));
  }, [project, users]);

  const accessibleProjectIds = useMemo(() => {
    if (currentUser?.role === "ADMIN") {
      return new Set(projects?.map((item) => item.id) ?? []);
    }

    return new Set(currentUser?.projects?.map((item) => item.id) ?? []);
  }, [currentUser?.projects, currentUser?.role, projects]);

  return {
    currentUser,
    projectId,
    project,
    users,
    memberCount: projectUsers.length,
    projectsLoading,
    projectsError,
    projectsErrorMessage: projectsError ? getErrorMessage(projectsFetchError) : null,
    hasAccess: !project || accessibleProjectIds.has(project.id),
  };
}
