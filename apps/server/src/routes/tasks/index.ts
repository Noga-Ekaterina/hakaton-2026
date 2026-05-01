import { Router } from "express";

import { taskCommentsRouter } from "./comments.js";
import { taskCreateRouter } from "./create.js";
import { taskDeleteRouter } from "./delete.js";
import { taskGetRouter } from "./get.js";
import { taskListRouter } from "./list.js";
import { taskPhotosRouter } from "./photos.js";
import { taskTimelineRouter } from "./timeline.js";
import { taskUpdateRouter } from "./update.js";

export const tasksRouter = Router();

tasksRouter.use(taskTimelineRouter);
tasksRouter.use(taskCommentsRouter);
tasksRouter.use(taskPhotosRouter);
tasksRouter.use(taskListRouter);
tasksRouter.use(taskCreateRouter);
tasksRouter.use(taskGetRouter);
tasksRouter.use(taskUpdateRouter);
tasksRouter.use(taskDeleteRouter);
