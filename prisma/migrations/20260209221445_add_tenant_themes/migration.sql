-- AlterTable
ALTER TABLE `page_configs` ADD COLUMN `draftConfig` JSON NULL,
    ADD COLUMN `lastPublishedAt` DATETIME(3) NULL,
    ADD COLUMN `publishedConfig` JSON NULL,
    MODIFY `config` JSON NULL;

-- CreateTable
CREATE TABLE `tenant_themes` (
    `id` VARCHAR(191) NOT NULL,
    `tenantId` VARCHAR(191) NOT NULL,
    `config` JSON NOT NULL,
    `layoutConfig` JSON NULL,
    `fontFamilyHeading` VARCHAR(100) NOT NULL DEFAULT 'Inter',
    `fontFamilyBody` VARCHAR(100) NOT NULL DEFAULT 'Inter',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `tenant_themes_tenantId_key`(`tenantId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `tenant_themes` ADD CONSTRAINT `tenant_themes_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenants`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
