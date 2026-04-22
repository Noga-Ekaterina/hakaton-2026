import type { TaskStatus } from "@/entities/task";

export type TaskBoardColumn = {
  title: string;
  description: string;
  statuses: TaskStatus[];
  accent: string;
};

export const columnConfig: TaskBoardColumn[] = [
  {
    title: "В плане",
    description: "Задачи, которые еще ждут старта.",
    statuses: ["NEW"],
    accent: "from-sky-500 to-cyan-500",
  },
  {
    title: "В процессе",
    description: "Задачи, над которыми уже работают.",
    statuses: ["IN_PROGRESS", "BLOCKED"],
    accent: "from-amber-500 to-orange-500",
  },
  {
    title: "Сделаны",
    description: "Задачи, которые уже закрыты.",
    statuses: ["DONE"],
    accent: "from-emerald-500 to-teal-500",
  },
];
