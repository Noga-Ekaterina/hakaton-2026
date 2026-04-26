import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { Project } from "@/entities/project";
import type { User, UserRole } from "@/entities/user";
import { API_URL } from "@/shared/config/api";

export type CreateProjectInput = {
  name: string;
};

export type UpdateProjectInput = {
  id: number;
  name: string;
};

export type CreateUserInput = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  projectId: number | null;
  projectName: string | null;
};

export type ChangeUserRoleInput = {
  id: number;
  role: UserRole;
};

export type AssignUserProjectInput = {
  id: number;
  projectId: number;
};

export type RemoveUserProjectInput = {
  id: number;
  projectId: number;
};

export const adminApi = createApi({
  reducerPath: "adminApi",
  tagTypes: ["Users", "Projects"],
  baseQuery: fetchBaseQuery({
    baseUrl: API_URL,
    credentials: "include",
  }),
  endpoints: (builder) => ({
    getUsers: builder.query<User[], void>({
      query: () => "/users",
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: "Users" as const, id })), { type: "Users" as const, id: "LIST" }]
          : [{ type: "Users" as const, id: "LIST" }],
    }),
    getProjects: builder.query<Project[], void>({
      query: () => "/projects",
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: "Projects" as const, id })), { type: "Projects" as const, id: "LIST" }]
          : [{ type: "Projects" as const, id: "LIST" }],
    }),
    createProject: builder.mutation<Project, CreateProjectInput>({
      query: (body) => ({
        url: "/projects",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Projects", id: "LIST" }],
    }),
    updateProject: builder.mutation<Project, UpdateProjectInput>({
      query: ({ id, ...body }) => ({
        url: `/projects/${id}`,
        method: "PATCH",
        body,
      }),
  async onQueryStarted({ id, name }, { dispatch, queryFulfilled }) {
        const patchProjects = dispatch(
          adminApi.util.updateQueryData("getProjects", undefined, (draft) => {
            const project = draft.find((item) => item.id === id);
            if (project) {
              project.name = name;
            }
          }),
        );

        const patchUsers = dispatch(
        adminApi.util.updateQueryData("getUsers", undefined, (draft) => {
          draft.forEach((user) => {
              if (user.projectId === id) {
                user.projectName = name;
              }

              user.projects?.forEach((project) => {
                if (project.id === id) {
                  project.name = name;
                }
              });
            });
        }),
      );

        try {
          await queryFulfilled;
        } catch {
          patchProjects.undo();
          patchUsers.undo();
        }
      },
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Projects", id },
        { type: "Projects", id: "LIST" },
        { type: "Users", id: "LIST" },
      ],
    }),
    createUser: builder.mutation<User, CreateUserInput>({
      query: ({ projectId, ...body }) => ({
        url: "/users/register",
        method: "POST",
        body: {
          ...body,
          projectId: projectId == null ? undefined : String(projectId),
        },
      }),
      invalidatesTags: [{ type: "Users", id: "LIST" }],
    }),
    changeUserRole: builder.mutation<User, ChangeUserRoleInput>({
      query: ({ id, role }) => ({
        url: `/users/${id}/change-role`,
        method: "POST",
        body: { role },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Users", id },
        { type: "Users", id: "LIST" },
      ],
    }),
    assignUserProject: builder.mutation<User, AssignUserProjectInput>({
      query: ({ id, projectId }) => ({
        url: `/users/${id}/assign-project`,
        method: "POST",
        body: { projectId: String(projectId) },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Users", id },
        { type: "Users", id: "LIST" },
      ],
    }),
    removeUserProject: builder.mutation<User, RemoveUserProjectInput>({
      query: ({ id, projectId }) => ({
        url: `/users/${id}/projects/${projectId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Users", id },
        { type: "Users", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetProjectsQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useCreateUserMutation,
  useChangeUserRoleMutation,
  useAssignUserProjectMutation,
  useRemoveUserProjectMutation,
} = adminApi;
