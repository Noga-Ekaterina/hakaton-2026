import * as React from "react";
import type { SelectHTMLAttributes } from "react";
import { useAppSelector } from "@/app/store/hooks";
import type { User } from "../model/types";

type UserOption = Pick<User, "id" | "name">;

type UserSelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  users: UserOption[];
  emptyLabel?: string;
  currentUserLabel?: string;
};

export const UserSelect = React.forwardRef<HTMLSelectElement, UserSelectProps>(
  ({ users, emptyLabel = "Выберите исполнителя", currentUserLabel = "Я", className, ...props }, ref) => {
    const currentUserId = useAppSelector((state) => state.auth.user?.id ?? null);

    return (
      <select
        ref={ref}
        className={[
          "h-11 w-full rounded-2xl border border-border bg-white px-4 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      >
        <option value="">{emptyLabel}</option>
        {currentUserId ? (
          <option key={currentUserId} value={currentUserId}>
            {currentUserLabel}
          </option>
        ) : null}
        {users
          .filter((user) => user.id !== currentUserId)
          .map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
      </select>
    );
  },
);

UserSelect.displayName = "UserSelect";
