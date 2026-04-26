import { UserCard, type User } from "@/entities/user";
import { Button } from "@/shared/ui/button";

type ProjectMembersUsersListProps = {
  users: User[];
  isPending: boolean;
  pendingUserId: number | null;
  submitError: string | null;
  onRemoveUser: (user: User) => void;
};

export function ProjectMembersUsersList({
  users,
  isPending,
  pendingUserId,
  submitError,
  onRemoveUser,
}: ProjectMembersUsersListProps) {
  return (
    <div className="space-y-4">
      {submitError ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{submitError}</p> : null}

      {users.length === 0 ? (
        <p className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">В проекте пока нет участников.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {users.map((user) => (
            <UserCard key={user.id} user={user}>
              <div className="flex flex-wrap gap-3">
                <Button type="button" variant="secondary" disabled={isPending} onClick={() => onRemoveUser(user)}>
                  {pendingUserId === user.id ? "Удаляем..." : "Удалить из проекта"}
                </Button>
              </div>
            </UserCard>
          ))}
        </div>
      )}
    </div>
  );
}
