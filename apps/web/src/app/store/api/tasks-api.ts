import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { Task, TaskComment, TaskPriority, TaskStatus, TaskTimelineItem } from "@/entities/task";
import type { UserRole } from "@/entities/user";
import { API_URL } from "@/shared/config/api";

export type CreateTaskUser = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  projectId?: number | null;
  projectName?: string | null;
  createdAt: string;
  active: boolean;
};

export type CreateTaskMeta = {
  users: CreateTaskUser[];
  roles: UserRole[];
  taskStatuses: TaskStatus[];
  taskPriorities: TaskPriority[];
};

export type CreateTaskInput = {
  title: string;
  description: string;
  priority: TaskPriority;
  assigneeId: number;
  projectId: number;
  photos: File[];
};

export type UpdateTaskInput = {
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  assigneeId: number;
  storyPoints: number | null;
  keepImageIds: number[];
  photos: File[];
};

function buildCreateTaskFormData(authorId: number, body: CreateTaskInput) {
  const formData = new FormData();

  formData.append("authorId", String(authorId));
  formData.append("title", body.title);
  formData.append("description", body.description);
  formData.append("priority", body.priority);
  formData.append("assigneeId", String(body.assigneeId));
  formData.append("projectId", String(body.projectId));
  body.photos.forEach((photo) => formData.append("photos", photo));

  return formData;
}

function buildUpdateTaskFormData(body: UpdateTaskInput) {
  const formData = new FormData();

  formData.append("title", body.title);
  formData.append("description", body.description);
  formData.append("priority", body.priority);
  formData.append("status", body.status);
  formData.append("assigneeId", String(body.assigneeId));
  formData.append("storyPoints", body.storyPoints === null ? "" : String(body.storyPoints));
  if (body.keepImageIds.length === 0) {
    formData.append("keepImageIds", "");
  } else {
    body.keepImageIds.forEach((imageId) => formData.append("keepImageIds", String(imageId)));
  }
  body.photos.forEach((photo) => formData.append("photos", photo));

  return formData;
}

export const tasksApi = createApi({
  reducerPath: "tasksApi",
  tagTypes: ["Tasks", "TaskTimeline"],
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
    getTask: builder.query<Task, number>({
      query: (id) => `/tasks/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Tasks", id }],
    }),
    getTaskTimeline: builder.query<TaskTimelineItem[], number>({
      query: (id) => `/tasks/${id}/timeline`,
      providesTags: (_result, _error, id) => [{ type: "TaskTimeline", id }],
    }),
    getCreateTaskMeta: builder.query<CreateTaskMeta, number>({
      query: (projectId) => `/meta?projectId=${projectId}`,
    }),
    createTask: builder.mutation<Task, { authorId: number; body: CreateTaskInput }>({
      query: ({ authorId, body }) => ({
        url: "/tasks",
        method: "POST",
        body: buildCreateTaskFormData(authorId, body),
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
        { type: "TaskTimeline", id },
      ],
    }),
    updateTask: builder.mutation<Task, { id: number; projectId: number; body: UpdateTaskInput }>({
      query: ({ id, body }) => ({
        url: `/tasks/${id}`,
        method: "PATCH",
        body: buildUpdateTaskFormData(body),
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Tasks", id },
        { type: "Tasks", id: "LIST" },
        { type: "TaskTimeline", id },
      ],
    }),
    createTaskComment: builder.mutation<TaskComment, { taskId: number; body: string }>({
      query: ({ taskId, body }) => ({
        url: `/tasks/${taskId}/comments`,
        method: "POST",
        body: { body },
      }),
      invalidatesTags: (_result, _error, { taskId }) => [{ type: "TaskTimeline", id: taskId }],
    }),
    deleteTask: builder.mutation<void, { id: number; projectId: number }>({
      query: ({ id }) => ({
        url: `/tasks/${id}`,
        method: "DELETE",
      }),
      async onQueryStarted({ id, projectId }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          tasksApi.util.updateQueryData("getTasks", projectId, (draft) => draft.filter((task) => task.id !== id)),
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
        { type: "TaskTimeline", id },
      ],
    }),
  }),
});

export const {
  useGetTasksQuery,
  useGetTaskQuery,
  useGetTaskTimelineQuery,
  useGetCreateTaskMetaQuery,
  useCreateTaskMutation,
  useUpdateTaskStatusMutation,
  useUpdateTaskMutation,
  useCreateTaskCommentMutation,
  useDeleteTaskMutation,
} =
  tasksApi;
