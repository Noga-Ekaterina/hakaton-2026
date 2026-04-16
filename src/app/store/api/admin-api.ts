import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { Department } from "@/entities/department";
import type { User, UserRole } from "@/entities/user";

export type CreateDepartmentInput = {
  name: string;
};

export type UpdateDepartmentInput = {
  id: number;
  name: string;
};

export type CreateUserInput = {
  name: string;
  email: string;
  role: UserRole;
  departmentId: number;
  departmentName: string;
};

export type UpdateUserInput = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  departmentId: number;
  departmentName: string;
};

export const adminApi = createApi({
  reducerPath: "adminApi",
  tagTypes: ["Users", "Departments"],
  baseQuery: fetchBaseQuery({
    baseUrl: "https://backend-hackathon-production-faa2.up.railway.app/api",
  }),
  endpoints: (builder) => ({
    getUsers: builder.query<User[], void>({
      query: () => "/users",
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: "Users" as const, id })), { type: "Users" as const, id: "LIST" }]
          : [{ type: "Users" as const, id: "LIST" }],
    }),
    getDepartments: builder.query<Department[], void>({
      query: () => "/departments",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Departments" as const, id })),
              { type: "Departments" as const, id: "LIST" },
            ]
          : [{ type: "Departments" as const, id: "LIST" }],
    }),
    createDepartment: builder.mutation<Department, CreateDepartmentInput>({
      query: (body) => ({
        url: "/departments",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Departments", id: "LIST" }],
    }),
    updateDepartment: builder.mutation<Department, UpdateDepartmentInput>({
      query: ({ id, ...body }) => ({
        url: `/departments/${id}`,
        method: "PATCH",
        body,
      }),
      async onQueryStarted({ id, name }, { dispatch, queryFulfilled }) {
        const patchDepartments = dispatch(
          adminApi.util.updateQueryData("getDepartments", undefined, (draft) => {
            const department = draft.find((item) => item.id === id);
            if (department) {
              department.name = name;
            }
          }),
        );

        const patchUsers = dispatch(
          adminApi.util.updateQueryData("getUsers", undefined, (draft) => {
            draft.forEach((user) => {
              if (user.departmentId === id) {
                user.departmentName = name;
              }
            });
          }),
        );

        try {
          await queryFulfilled;
        } catch {
          patchDepartments.undo();
          patchUsers.undo();
        }
      },
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Departments", id },
        { type: "Departments", id: "LIST" },
        { type: "Users", id: "LIST" },
      ],
    }),
    createUser: builder.mutation<User, CreateUserInput>({
      query: (body) => ({
        url: "/users",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Users", id: "LIST" }],
    }),
    updateUser: builder.mutation<User, UpdateUserInput>({
      query: ({ id, ...body }) => ({
        url: `/users/${id}`,
        method: "PATCH",
        body,
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
  useGetDepartmentsQuery,
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
  useCreateUserMutation,
  useUpdateUserMutation,
} = adminApi;
