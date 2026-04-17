import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { Department } from "@/entities/department";
import type { Task, TaskPriority, TaskStatus } from "@/entities/task";
import type { UserRole } from "@/entities/user";
import { API_URL } from "@/shared/config/api";

export type CreateTaskDepartment = Department & {
  description: string | null;
};

export type CreateTaskUser = {
  id: number;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  department: CreateTaskDepartment | null;
  createdAt: string;
  active: boolean;
};

export type CreateTaskMeta = {
  departments: CreateTaskDepartment[];
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
  departmentId: number;
};

export const tasksApi = createApi({
  reducerPath: "tasksApi",
  tagTypes: ["Tasks"],
  baseQuery: fetchBaseQuery({
    baseUrl: API_URL,
  }),
  endpoints: (builder) => ({
    getTasks: builder.query<Task[], void>({
      query: () => "/tasks",
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
        params: { authorId },
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Tasks", id: "LIST" }],
    }),
    
    updateTaskStatus: builder.mutation<Task, { id: number; status: TaskStatus }>({
      query: ({ id, status }) => ({
        url: `/tasks/${id}`,
        method: "PATCH",
        body: { status },
      }),
      async onQueryStarted({ id, status }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          tasksApi.util.updateQueryData("getTasks", undefined, (draft) => {
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

export const {
  useGetTasksQuery,
  useGetCreateTaskMetaQuery,
  useCreateTaskMutation,
  useUpdateTaskStatusMutation,
} = tasksApi;
