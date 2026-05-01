import { Router } from "express";

import { prisma } from "../../lib/prisma.js";
import { serializeUser } from "./lib/serialize.js";
import { userRelations } from "./lib/userRelations.js";

export const userListRouter = Router();

userListRouter.get("/", async (_req, res) => {
  const users = await prisma.user.findMany({
    orderBy: { id: "asc" },
    include: userRelations,
  });

  res.json(users.map(serializeUser));
});
