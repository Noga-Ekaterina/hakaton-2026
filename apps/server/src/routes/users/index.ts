import { Router } from "express";

import { userListRouter } from "./list.js";
import { userProjectsRouter } from "./projects.js";
import { userRegisterRouter } from "./register.js";
import { userRolesRouter } from "./roles.js";

export const usersRouter = Router();

usersRouter.use(userListRouter);
usersRouter.use(userRegisterRouter);
usersRouter.use(userRolesRouter);
usersRouter.use(userProjectsRouter);
