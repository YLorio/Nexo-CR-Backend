/*
  Warnings:

  - You are about to drop the column `canton` on the `addresses` table. All the data in the column will be lost.
  - You are about to drop the column `district` on the `addresses` table. All the data in the column will be lost.
  - You are about to drop the column `province` on the `addresses` table. All the data in the column will be lost.
  - Added the required column `cantonId` to the `addresses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `distritoId` to the `addresses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `provinciaId` to the `addresses` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `addresses` DROP COLUMN `canton`,
    DROP COLUMN `district`,
    DROP COLUMN `province`,
    ADD COLUMN `cantonId` VARCHAR(10) NOT NULL,
    ADD COLUMN `distritoId` VARCHAR(10) NOT NULL,
    ADD COLUMN `provinciaId` VARCHAR(10) NOT NULL;

-- CreateTable
CREATE TABLE `provincias` (
    `id` VARCHAR(10) NOT NULL,
    `nombre` VARCHAR(100) NOT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cantones` (
    `id` VARCHAR(10) NOT NULL,
    `provinciaId` VARCHAR(10) NOT NULL,
    `nombre` VARCHAR(100) NOT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `cantones_provinciaId_idx`(`provinciaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `distritos` (
    `id` VARCHAR(10) NOT NULL,
    `cantonId` VARCHAR(10) NOT NULL,
    `nombre` VARCHAR(100) NOT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `distritos_cantonId_idx`(`cantonId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `addresses_provinciaId_idx` ON `addresses`(`provinciaId`);

-- CreateIndex
CREATE INDEX `addresses_cantonId_idx` ON `addresses`(`cantonId`);

-- CreateIndex
CREATE INDEX `addresses_distritoId_idx` ON `addresses`(`distritoId`);

-- AddForeignKey
ALTER TABLE `cantones` ADD CONSTRAINT `cantones_provinciaId_fkey` FOREIGN KEY (`provinciaId`) REFERENCES `provincias`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `distritos` ADD CONSTRAINT `distritos_cantonId_fkey` FOREIGN KEY (`cantonId`) REFERENCES `cantones`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `addresses` ADD CONSTRAINT `addresses_provinciaId_fkey` FOREIGN KEY (`provinciaId`) REFERENCES `provincias`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `addresses` ADD CONSTRAINT `addresses_cantonId_fkey` FOREIGN KEY (`cantonId`) REFERENCES `cantones`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `addresses` ADD CONSTRAINT `addresses_distritoId_fkey` FOREIGN KEY (`distritoId`) REFERENCES `distritos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
