import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { Project } from "@/entities/project";
import type { Task, TaskPriority, TaskStatus } from "@/entities/task";
import type { UserRole } from "@/entities/user";
import { API_URL } from "@/shared/config/api";

export type CreateTaskProject = Project & {
  description: string | null;
};

export type CreateTaskUser = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  project: CreateTaskProject | null;
  createdAt: string;
  active: boolean;
};

export type CreateTaskMeta = {
  projects: CreateTaskProject[];
  users: CreateTaskUser[];
  roles: UserRole[];
  taskStatuses: TaskStatus[];
  taskPriorities: TaskPriority[];
};

export type CreateTaskInput = {
  title: string;
  description: string;
  priority: TaskPriority;
  deadline: string;
  assigneeId: number;
  projectId: number;
};

export const tasksApi = createApi({
  reducerPath: "tasksApi",
  tagTypes: ["Tasks"],
  baseQuery: fetchBaseQuery({
    baseUrl: API_URL,
    credentials: "include",
  }),
  endpoints: (builder) => ({
    getTasks: builder.query<Task[], number>({
      query: (projectId) => `/tasks?projectId=${projectId}`,
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: "Tasks" as const, id })), { type: "Tasks" as const, id: "LIST" }]
          : [{ type: "Tasks" as const, id: "LIST" }],
    }),
    getCreateTaskMeta: builder.query<CreateTaskMeta, void>({
      query: () => "/meta",
    }),
    createTask: builder.mutation<Task, { authorId: number; body: CreateTaskInput }>({
      query: ({ authorId, body }) => ({
        url: "/tasks",
        method: "POST",
        body: {
          authorId,
          ...body,
        },
      }),
      invalidatesTags: [{ type: "Tasks", id: "LIST" }],
    }),
    updateTaskStatus: builder.mutation<Task, { id: number; status: TaskStatus; projectId: number }>({
      query: ({ id, status }) => ({
        url: `/tasks/${id}`,
        method: "PATCH",
        body: { status },
      }),
      async onQueryStarted({ id, status, projectId }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          tasksApi.util.updateQueryData("getTasks", projectId, (draft) => {
            const task = draft.find((item) => item.id === id);
            if (task) {
              task.status = status;
            }
          }),
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Tasks", id },
        { type: "Tasks", id: "LIST" },
      ],
    }),
  }),
});

export const { useGetTasksQuery, useGetCreateTaskMetaQuery, useCreateTaskMutation, useUpdateTaskStatusMutation } =
  tasksApi;
