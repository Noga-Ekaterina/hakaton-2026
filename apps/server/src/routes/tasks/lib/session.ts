import type express from "express";

export function getSessionUserId(res: express.Response) {
  const userId = res.locals.sessionUser?.id;
  return typeof userId === "number" ? userId : null;
}
