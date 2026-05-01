import type { FileArray, UploadedFile } from "express-fileupload";
import { randomUUID } from "node:crypto";
import { mkdir, rm, unlink } from "node:fs/promises";
import path from "node:path";

const taskPhotoFieldNames = ["photos", "photos[]"];
const maxTaskPhotoCount = 10;
const maxTaskPhotoSize = 5 * 1024 * 1024;

export const taskUploadsRoot = path.resolve(process.cwd(), "uploads", "tasks");

function normalizeUploadedFiles(fileField: UploadedFile | UploadedFile[] | undefined) {
  if (!fileField) {
    return [];
  }

  return Array.isArray(fileField) ? fileField : [fileField];
}

export function getTaskPhotoFiles(files: FileArray | null | undefined) {
  if (!files) {
    return [];
  }

  return taskPhotoFieldNames.flatMap((fieldName) => normalizeUploadedFiles(files[fieldName]));
}

export function validateTaskPhotoFiles(files: UploadedFile[]) {
  if (files.length > maxTaskPhotoCount) {
    return `Можно загрузить не больше ${maxTaskPhotoCount} фото.`;
  }

  const invalidTypeFile = files.find((file) => !file.mimetype.startsWith("image/"));

  if (invalidTypeFile) {
    return "Можно загружать только изображения.";
  }

  const oversizedFile = files.find((file) => file.size > maxTaskPhotoSize);

  if (oversizedFile) {
    return "Размер одного фото не должен превышать 5 МБ.";
  }

  return null;
}

function buildTaskPhotoFileName(file: UploadedFile) {
  const extension = path.extname(file.name).toLowerCase();

  return `${randomUUID()}${extension}`;
}

export async function saveTaskPhotoFiles(taskId: number, files: UploadedFile[]) {
  if (files.length === 0) {
    return;
  }

  const taskUploadDir = path.join(taskUploadsRoot, String(taskId));
  await mkdir(taskUploadDir, { recursive: true });

  const names: string[] = [];

  await Promise.all(
    files.map((file) => {
      const fileName = buildTaskPhotoFileName(file);
      names.push(fileName);
      const filePath = path.join(taskUploadDir, fileName);
      return file.mv(filePath);
    }),
  );

  return names;
}

export function parseKeepImageIds(value: unknown) {
  if (typeof value === "undefined") {
    return null;
  }

  const rawValues = Array.isArray(value) ? value : [value];
  const ids = rawValues
    .flatMap((item) => String(item).split(","))
    .map((item) => Number(item.trim()))
    .filter((item) => Number.isInteger(item) && item > 0);

  return new Set(ids);
}

export async function deleteTaskPhotoFiles(taskId: number, imageNames: string[]) {
  await Promise.all(
    imageNames.map((name) =>
      unlink(path.join(taskUploadsRoot, String(taskId), name)).catch((error: NodeJS.ErrnoException) => {
        if (error.code !== "ENOENT") {
          throw error;
        }
      }),
    ),
  );
}

export async function deleteTaskUploadDir(taskId: number) {
  await rm(path.join(taskUploadsRoot, String(taskId)), { recursive: true, force: true });
}
