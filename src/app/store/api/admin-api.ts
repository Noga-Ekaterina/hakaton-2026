import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { Department } from "@/entities/department";
import type { User, UserRole } from "@/entities/user";
import { API_URL } from "@/shared/config/api";

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
  password: string;
  role: UserRole;
  departmentId: number | null;
  departmentName: string | null;
};

export type ChangeUserRoleInput = {
  id: number;
  role: UserRole;
};

export type AssignUserDepartmentInput = {
  id: number;
  departmentId: number;
};

export const adminApi = createApi({
  reducerPath: "adminApi",
  tagTypes: ["Users", "Departments"],
  baseQuery: fetchBaseQuery({
    baseUrl: API_URL,
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
      query: (params) => ({
        url: "/users/register",
        method: "POST",
        params,
      }),
      invalidatesTags: [{ type: "Users", id: "LIST" }],
    }),
    changeUserRole: builder.mutation<User, ChangeUserRoleInput>({
      query: ({ id, role }) => ({
        url: `/users/${id}/change-role`,
        method: "POST",
        params: { role },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Users", id },
        { type: "Users", id: "LIST" },
      ],
    }),
    assignUserDepartment: builder.mutation<User, AssignUserDepartmentInput>({
      query: ({ id, departmentId }) => ({
        url: `/users/${id}/assign-department`,
        method: "POST",
        params: { departmentId },
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
  useChangeUserRoleMutation,
  useAssignUserDepartmentMutation,
} = adminApi;
