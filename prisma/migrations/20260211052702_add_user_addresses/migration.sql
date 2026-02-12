-- CreateTable
CREATE TABLE `user_addresses` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `label` VARCHAR(50) NULL,
    `provinciaId` VARCHAR(10) NOT NULL,
    `cantonId` VARCHAR(10) NOT NULL,
    `distritoId` VARCHAR(10) NOT NULL,
    `streetAddress` VARCHAR(500) NOT NULL,
    `additionalInfo` VARCHAR(500) NULL,
    `contactName` VARCHAR(100) NULL,
    `contactPhone` VARCHAR(20) NULL,
    `isDefault` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    INDEX `user_addresses_userId_idx`(`userId`),
    INDEX `user_addresses_userId_isDefault_idx`(`userId`, `isDefault`),
    INDEX `user_addresses_provinciaId_idx`(`provinciaId`),
    INDEX `user_addresses_cantonId_idx`(`cantonId`),
    INDEX `user_addresses_distritoId_idx`(`distritoId`),
    INDEX `user_addresses_deletedAt_idx`(`deletedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `user_addresses` ADD CONSTRAINT `user_addresses_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_addresses` ADD CONSTRAINT `user_addresses_provinciaId_fkey` FOREIGN KEY (`provinciaId`) REFERENCES `provincias`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_addresses` ADD CONSTRAINT `user_addresses_cantonId_fkey` FOREIGN KEY (`cantonId`) REFERENCES `cantones`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_addresses` ADD CONSTRAINT `user_addresses_distritoId_fkey` FOREIGN KEY (`distritoId`) REFERENCES `distritos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
