import { UserCard, type User } from "@/entities/user";
import { Button } from "@/shared/ui/button";

type ProjectMembersAvailableUsersProps = {
  users: User[];
  isPending: boolean;
  pendingUserId: number | null;
  submitError: string | null;
  onAddUser: (user: User) => void;
};

export function ProjectMembersAvailableUsers({
  users,
  isPending,
  pendingUserId,
  submitError,
  onAddUser,
}: ProjectMembersAvailableUsersProps) {
  return (
    <div className="space-y-4">
      {submitError ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{submitError}</p> : null}

      {users.length === 0 ? (
        <p className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
          Все подходящие сотрудники уже добавлены в этот проект.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {users.map((user) => (
            <UserCard key={user.id} user={user}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Button type="button" disabled={isPending} onClick={() => onAddUser(user)}>
                  {pendingUserId === user.id ? "Добавляем..." : "Добавить"}
                </Button>
              </div>
            </UserCard>
          ))}
        </div>
      )}
    </div>
  );
}
