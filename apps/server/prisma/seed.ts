import { PrismaClient, UserRole, TaskPriority, TaskStatus } from "@prisma/client";

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
      password: "admin123",
      role: UserRole.ADMIN,
    },
  });

  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: "Иван Петров",
        email: "ivan.petrov@qitask.local",
        password: "123456",
        role: UserRole.USER,
        projectId: projects[0]!.id,
      },
    }),
    prisma.user.create({
      data: {
        name: "Анна Смирнова",
        email: "anna.smirnova@qitask.local",
        password: "123456",
        role: UserRole.USER,
        projectId: projects[0]!.id,
      },
    }),
    prisma.user.create({
      data: {
        name: "Дмитрий Козлов",
        email: "dmitry.kozlov@qitask.local",
        password: "123456",
        role: UserRole.USER,
        projectId: projects[1]!.id,
      },
    }),
    prisma.user.create({
      data: {
        name: "Елена Орлова",
        email: "elena.orlova@qitask.local",
        password: "123456",
        role: UserRole.USER,
        projectId: projects[2]!.id,
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
        deadline: new Date("2026-04-10T18:00:00.000Z"),
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
        deadline: new Date("2026-04-18T12:00:00.000Z"),
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
        deadline: new Date("2026-04-05T12:00:00.000Z"),
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
        status: TaskStatus.BLOCKED,
        priority: TaskPriority.CRITICAL,
        deadline: new Date("2026-04-12T15:00:00.000Z"),
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
        deadline: new Date("2026-04-16T13:00:00.000Z"),
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
