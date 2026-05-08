import { Router } from "express";

import { prisma } from "../../lib/prisma.js";
import { isSessionAdmin } from "../../middleware/auth.js";
import { serializeUser } from "./lib/serialize.js";
import { userSelect } from "./lib/userRelations.js";

export const userListRouter = Router();

userListRouter.get("/", isSessionAdmin, async (req, res) => {
  const archived = req.query.archived === "archived" ? "archived" : "active";

  const users = await prisma.user.findMany({
    where: {
      archivedAt: archived === "archived" ? { not: null } : null,
    },
    orderBy: { id: "asc" },
    select: userSelect,
  });

  res.json(users.map(serializeUser));
});
