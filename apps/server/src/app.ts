import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import fileUpload from "express-fileupload";

import { allowedOrigins } from "./lib/constants.js";
import { requireAllowedOrigin } from "./middleware/originGuard.js";
import { authRouter } from "./routes/auth.js";
import { metaRouter } from "./routes/meta.js";
import { projectsRouter } from "./routes/projects/projects.js";
import { tasksRouter } from "./routes/tasks/index.js";
import { usersRouter } from "./routes/users/index.js";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || allowedOrigins.has(origin)) {
          callback(null, true);
          return;
        }

        callback(new Error(`Origin ${origin} is not allowed`));
      },
      credentials: true,
    }),
  );
  app.use(requireAllowedOrigin);
  app.use(express.json());
  app.use(
    fileUpload({
      abortOnLimit: true,
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  );
  app.use(cookieParser());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api/auth", authRouter);
  app.use("/api/users", usersRouter);
  app.use("/api/projects", projectsRouter);
  app.use("/api/tasks", tasksRouter);
  app.use("/api", metaRouter);

  app.use((_req, res) => {
    res.status(404).json({ message: "Маршрут не найден." });
  });

  return app;
}
