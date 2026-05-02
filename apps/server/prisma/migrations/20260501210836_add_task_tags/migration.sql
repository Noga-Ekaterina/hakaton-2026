-- DropIndex
DROP INDEX `TaskEvent_type_idx` ON `TaskEvent`;

-- CreateTable
CREATE TABLE `TaskTag` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `projectId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `TaskTag_projectId_idx`(`projectId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_TaskToTaskTag` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_TaskToTaskTag_AB_unique`(`A`, `B`),
    INDEX `_TaskToTaskTag_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `TaskTag` ADD CONSTRAINT `TaskTag_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_TaskToTaskTag` ADD CONSTRAINT `_TaskToTaskTag_A_fkey` FOREIGN KEY (`A`) REFERENCES `Task`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_TaskToTaskTag` ADD CONSTRAINT `_TaskToTaskTag_B_fkey` FOREIGN KEY (`B`) REFERENCES `TaskTag`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
