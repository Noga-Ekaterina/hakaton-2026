import type { Prisma, PrismaClient } from "@prisma/client";

type PrismaTransaction =
  | Prisma.TransactionClient
  | Omit<
      PrismaClient,
      "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
    >;

export async function validateProjectTagIds(prisma: PrismaTransaction, projectId: number, tagIds: number[]) {
  const uniqueTagIds = [...new Set(tagIds)];

  if (uniqueTagIds.length === 0) {
    return true;
  }

  const tags = await prisma.taskTag.findMany({
    where: {
      id: { in: uniqueTagIds },
      projectId,
    },
    select: { id: true },
  });

  return tags.length === uniqueTagIds.length;
}

export function toTaskTagConnections(tagIds: number[]) {
  return [...new Set(tagIds)].map((id) => ({ id }));
}
