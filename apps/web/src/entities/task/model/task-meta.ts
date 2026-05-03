import type { TaskPriority, TaskStatus } from "./types";

export const taskPriorityValues = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const satisfies readonly TaskPriority[];

export const taskStatusLabels: Record<TaskStatus, string> = {
  NEW: "Новая",
  IN_PROGRESS: "В работе",
  AWAITING_INSPECTION: "На проверке",
  DONE: "Готово",
};

export const taskPriorityLabels: Record<TaskPriority, string> = {
  LOW: "Низкий",
  MEDIUM: "Средний",
  HIGH: "Высокий",
  CRITICAL: "Критический",
};

export const taskStatusMeta: Record<TaskStatus, { label: string; className: string; color: string }> = {
  NEW: {
    label: taskStatusLabels.NEW,
    className: "bg-sky-100 text-sky-900",
    color: "#0284c7",
  },
  IN_PROGRESS: {
    label: taskStatusLabels.IN_PROGRESS,
    className: "bg-amber-100 text-amber-900",
    color: "#d97706",
  },
  AWAITING_INSPECTION: {
    label: taskStatusLabels.AWAITING_INSPECTION,
    className: "bg-indigo-100 text-indigo-900",
    color: "#4f46e5",
  },
  DONE: {
    label: taskStatusLabels.DONE,
    className: "bg-emerald-100 text-emerald-900",
    color: "#059669",
  },
};

export const taskPriorityMeta: Record<TaskPriority, { label: string; className: string; color: string }> = {
  LOW: {
    label: taskPriorityLabels.LOW,
    className: "bg-slate-100 text-slate-700",
    color: "#64748b",
  },
  MEDIUM: {
    label: taskPriorityLabels.MEDIUM,
    className: "bg-cyan-100 text-cyan-900",
    color: "#0891b2",
  },
  HIGH: {
    label: taskPriorityLabels.HIGH,
    className: "bg-orange-100 text-orange-900",
    color: "#ea580c",
  },
  CRITICAL: {
    label: taskPriorityLabels.CRITICAL,
    className: "bg-red-100 text-red-900",
    color: "#dc2626",
  },
};
