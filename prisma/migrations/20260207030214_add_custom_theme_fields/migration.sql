-- AlterTable
ALTER TABLE `tenants` ADD COLUMN `backgroundColor` VARCHAR(7) NOT NULL DEFAULT '#ffffff',
    ADD COLUMN `trustBadges` JSON NULL;
