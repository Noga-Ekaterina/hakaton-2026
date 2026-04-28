import { PrismaClient, UserRole, TaskPriority, TaskStatus } from "@prisma/client";

import { hashPassword } from "../src/lib/auth.js";

const prisma = new PrismaClient();

async function main() {
  await prisma.task.deleteMany();
  await prisma.user.deleteMany();
  await prisma.project.deleteMany();

  const projects = await Promise.all([
    prisma.project.create({ data: { name: "Операционный отдел" } }),
    prisma.project.create({ data: { name: "Маркетинг" } }),
    prisma.project.create({ data: { name: "HR" } }),
  ]);

  const admin = await prisma.user.create({
    data: {
      name: "Алексей Орлов",
      email: "admin@qitask.local",
      password: await hashPassword("admin123"),
      role: UserRole.ADMIN,
    },
  });

  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: "Иван Петров",
        email: "ivan.petrov@qitask.local",
        password: await hashPassword("123456"),
        role: UserRole.USER,
        projects: {
          connect: { id: projects[0]!.id },
        },
      },
    }),
    prisma.user.create({
      data: {
        name: "Анна Смирнова",
        email: "anna.smirnova@qitask.local",
        password: await hashPassword("123456"),
        role: UserRole.USER,
        projects: {
          connect: { id: projects[0]!.id },
        },
      },
    }),
    prisma.user.create({
      data: {
        name: "Дмитрий Козлов",
        email: "dmitry.kozlov@qitask.local",
        password: await hashPassword("123456"),
        role: UserRole.USER,
        projects: {
          connect: { id: projects[1]!.id },
        },
      },
    }),
    prisma.user.create({
      data: {
        name: "Елена Орлова",
        email: "elena.orlova@qitask.local",
        password: await hashPassword("123456"),
        role: UserRole.USER,
        projects: {
          connect: { id: projects[2]!.id },
        },
      },
    }),
  ]);

  const [ivan, anna, dmitry, elena] = users;

  await Promise.all([
    prisma.task.create({
      data: {
        title: "Подготовить отчет по продажам",
        description: "Собрать данные за месяц, сверить показатели с CRM и подготовить презентацию для руководства.",
        shortDescription: "Собрать данные за месяц и подготовить презентацию.",
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.HIGH,
        storyPoints: 8,
        authorId: admin.id,
        assigneeId: anna.id,
        projectId: projects[0]!.id,
      },
    }),
    prisma.task.create({
      data: {
        title: "Обновить лендинг компании",
        description: "Добавить новый промо-блок, обновить CTA и передать изменения на публикацию.",
        shortDescription: "Добавить новый блок с акцией.",
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.MEDIUM,
        storyPoints: 5,
        authorId: admin.id,
        assigneeId: dmitry.id,
        projectId: projects[1]!.id,
      },
    }),
    prisma.task.create({
      data: {
        title: "Подготовить договор для клиента ABC",
        description: "Проверить шаблон, внести реквизиты клиента и передать документ на подпись.",
        shortDescription: "Проверить шаблон и отправить на согласование.",
        status: TaskStatus.NEW,
        priority: TaskPriority.HIGH,
        storyPoints: null,
        authorId: admin.id,
        assigneeId: anna.id,
        projectId: projects[0]!.id,
      },
    }),
    prisma.task.create({
      data: {
        title: "Подготовить welcome-план для нового сотрудника",
        description: "Сформировать программу адаптации на первую неделю и согласовать список встреч.",
        shortDescription: "Сформировать план адаптации на первую неделю.",
        status: TaskStatus.AWAITING_INSPECTION,
        priority: TaskPriority.CRITICAL,
        storyPoints: 3,
        authorId: admin.id,
        assigneeId: elena.id,
        projectId: projects[2]!.id,
      },
    }),
    prisma.task.create({
      data: {
        title: "Подготовить список закупок на неделю",
        description: "Собрать потребности отделов и сформировать единый список на закупку.",
        shortDescription: "Сформировать список закупок на неделю.",
        status: TaskStatus.DONE,
        priority: TaskPriority.LOW,
        storyPoints: 2,
        authorId: admin.id,
        assigneeId: anna.id,
        projectId: projects[0]!.id,
      },
    }),
  ]);

  console.log(`Seeded qitask database with ${projects.length} projects, ${users.length + 1} users and sample tasks.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
