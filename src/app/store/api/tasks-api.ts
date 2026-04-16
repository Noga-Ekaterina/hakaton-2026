import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { Task, TaskStatus } from "@/entities/task";

export type CreateTaskMeta = {
  priorities: Task["priority"][];
  statuses: TaskStatus[];
  assignees: Array<{
    id: number;
    name: string;
  }>;
  departments: Array<{
    id: number;
    name: string;
  }>;
};

export type CreateTaskInput = {
  title: string;
  shortDescription: string;
  status: TaskStatus;
  priority: Task["priority"];
  deadline: string;
  authorId: number;
  authorName: string;
  assigneeId: number;
  assigneeName: string;
  departmentId: number;
  createdAt: string;
  isOverdue: boolean;
};

export const tasksApi = createApi({
  reducerPath: "tasksApi",
  tagTypes: ["Tasks"],
  baseQuery: fetchBaseQuery({
    baseUrl: "https://backend-hackathon-production-faa2.up.railway.app/api",
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
      query: () => "/forms/create-task-meta",
    }),
    
    createTask: builder.mutation<Task, CreateTaskInput>({
      query: (body) => ({
        url: "/tasks",
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
