import type express from "express";

import { allowedOrigins } from "../lib/constants.js";

const safeMethods = new Set(["GET", "HEAD", "OPTIONS"]);

export function requireAllowedOrigin(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (safeMethods.has(req.method)) {
    next();
    return;
  }

  const origin = req.get("origin");

  if (!origin || origin === "null" || !allowedOrigins.has(origin)) {
    res.status(403).json({ message: "Origin is not allowed." });
    return;
  }

  next();
}
