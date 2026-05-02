-- CreateTable
CREATE TABLE `TaskNotificationAssignee` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `assigneeId` INTEGER NOT NULL,
    `taskId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `TaskNotificationAssignee_taskId_key`(`taskId`),
    INDEX `TaskNotificationAssignee_assigneeId_createdAt_idx`(`assigneeId`, `createdAt`),
    INDEX `TaskNotificationAssignee_taskId_createdAt_idx`(`taskId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `TaskNotificationAssignee` ADD CONSTRAINT `TaskNotificationAssignee_assigneeId_fkey` FOREIGN KEY (`assigneeId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TaskNotificationAssignee` ADD CONSTRAINT `TaskNotificationAssignee_taskId_fkey` FOREIGN KEY (`taskId`) REFERENCES `Task`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
