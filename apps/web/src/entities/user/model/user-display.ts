type UserDisplayOption = {
  id: number;
  name: string;
};

export const currentUserDisplayName = "Я";

export function getUserDisplayName(user: UserDisplayOption, currentUserId: number | null, currentUserLabel = currentUserDisplayName) {
  return user.id === currentUserId ? currentUserLabel : user.name;
}

export function getUserDisplayOptions<T extends UserDisplayOption>(
  users: T[],
  currentUserId: number | null,
  currentUserLabel = currentUserDisplayName,
) {
  if (!currentUserId) {
    return users;
  }

  const currentUser = users.find((user) => user.id === currentUserId);
  const otherUsers = users.filter((user) => user.id !== currentUserId);

  return currentUser ? [{ ...currentUser, name: currentUserLabel }, ...otherUsers] : users;
}
