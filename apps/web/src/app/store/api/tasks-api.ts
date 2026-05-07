import { createApi } from "@reduxjs/toolkit/query/react";
import type { Task, TaskComment, TaskListItem, TaskPriority, TaskStatus, TaskTag, TaskTimelineItem } from "@/entities/task";
import type { UserRole } from "@/entities/user";
import { baseQueryWithAuthRefresh } from "./base-query";

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
  tags: TaskTag[];
};

export type CreateTaskInput = {
  title: string;
  description: string;
  priority: TaskPriority;
  assigneeId: number;
  projectId: number;
  tagIds: number[];
  photos: File[];
};

export type UpdateTaskInput = {
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  assigneeId: number;
  storyPoints: number | null;
  tagIds: number[];
  keepImageIds: number[];
  photos: File[];
};

export type CreateProjectTagInput = {
  projectId: number;
  name: string;
  color: string;
};

export type UpdateProjectTagInput = {
  projectId: number;
  tagId: number;
  name: string;
  color: string;
};

export type UpdateTaskStoryPointsInput = {
  id: number;
  projectId: number;
  storyPoints: number | null;
};

function buildCreateTaskFormData(authorId: number, body: CreateTaskInput) {
  const formData = new FormData();

  formData.append("authorId", String(authorId));
  formData.append("title", body.title);
  formData.append("description", body.description);
  formData.append("priority", body.priority);
  formData.append("assigneeId", String(body.assigneeId));
  formData.append("projectId", String(body.projectId));
  body.tagIds.forEach((tagId) => formData.append("tagIds", String(tagId)));
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
  if (body.tagIds.length === 0) {
    formData.append("tagIds", "");
  } else {
    body.tagIds.forEach((tagId) => formData.append("tagIds", String(tagId)));
  }
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
  tagTypes: ["Tasks", "TaskTimeline", "TaskTags", "TaskMeta"],
  baseQuery: baseQueryWithAuthRefresh,
  endpoints: (builder) => ({
    getTasks: builder.query<TaskListItem[], number>({
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
      providesTags: (_result, _error, projectId) => [{ type: "TaskMeta", id: projectId }],
    }),
    getProjectTags: builder.query<TaskTag[], number>({
      query: (projectId) => `/projects/${projectId}/tags`,
      providesTags: (result, _error, projectId) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "TaskTags" as const, id })),
              { type: "TaskTags" as const, id: `PROJECT-${projectId}` },
            ]
          : [{ type: "TaskTags" as const, id: `PROJECT-${projectId}` }],
    }),
    createProjectTag: builder.mutation<TaskTag, CreateProjectTagInput>({
      query: ({ projectId, ...body }) => ({
        url: `/projects/${projectId}/tags`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, { projectId }) => [
        { type: "TaskTags", id: `PROJECT-${projectId}` },
        { type: "TaskMeta", id: projectId },
      ],
    }),
    updateProjectTag: builder.mutation<TaskTag, UpdateProjectTagInput>({
      query: ({ projectId, tagId, ...body }) => ({
        url: `/projects/${projectId}/tags/${tagId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { projectId, tagId }) => [
        { type: "TaskTags", id: tagId },
        { type: "TaskTags", id: `PROJECT-${projectId}` },
        { type: "TaskMeta", id: projectId },
        { type: "Tasks", id: "LIST" },
      ],
    }),
    deleteProjectTag: builder.mutation<void, { projectId: number; tagId: number }>({
      query: ({ projectId, tagId }) => ({
        url: `/projects/${projectId}/tags/${tagId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { projectId, tagId }) => [
        { type: "TaskTags", id: tagId },
        { type: "TaskTags", id: `PROJECT-${projectId}` },
        { type: "TaskMeta", id: projectId },
        { type: "Tasks", id: "LIST" },
      ],
    }),
    createTask: builder.mutation<TaskListItem, { authorId: number; body: CreateTaskInput }>({
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
    updateTaskStoryPoints: builder.mutation<Task, UpdateTaskStoryPointsInput>({
      query: ({ id, storyPoints }) => ({
        url: `/tasks/${id}`,
        method: "PATCH",
        body: { storyPoints },
      }),
      async onQueryStarted({ id, projectId, storyPoints }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          tasksApi.util.updateQueryData("getTasks", projectId, (draft) => {
            const task = draft.find((item) => item.id === id);
            if (task) {
              task.storyPoints = storyPoints;
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
  useGetProjectTagsQuery,
  useCreateProjectTagMutation,
  useUpdateProjectTagMutation,
  useDeleteProjectTagMutation,
  useCreateTaskMutation,
  useUpdateTaskStatusMutation,
  useUpdateTaskStoryPointsMutation,
  useUpdateTaskMutation,
  useCreateTaskCommentMutation,
  useDeleteTaskMutation,
} =
  tasksApi;
