/*
  Warnings:

  - You are about to drop the column `created_at` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `image_url` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `is_active` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `sort_order` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `tenant_id` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `appointment_date` on the `order_items` table. All the data in the column will be lost.
  - You are about to drop the column `appointment_time` on the `order_items` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `order_items` table. All the data in the column will be lost.
  - You are about to drop the column `duration_minutes` on the `order_items` table. All the data in the column will be lost.
  - You are about to drop the column `order_id` on the `order_items` table. All the data in the column will be lost.
  - You are about to drop the column `product_id` on the `order_items` table. All the data in the column will be lost.
  - You are about to drop the column `product_is_service` on the `order_items` table. All the data in the column will be lost.
  - You are about to drop the column `product_name` on the `order_items` table. All the data in the column will be lost.
  - You are about to drop the column `subtotal_in_cents` on the `order_items` table. All the data in the column will be lost.
  - You are about to drop the column `unit_price_in_cents` on the `order_items` table. All the data in the column will be lost.
  - You are about to drop the column `cancelled_at` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `completed_at` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `customer_email` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `customer_name` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `customer_notes` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `customer_phone` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `internal_notes` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `order_number` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `paid_at` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `subtotal_in_cents` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `tenant_id` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `total_in_cents` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `orders` table. All the data in the column will be lost.
  - You are about to alter the column `status` on the `orders` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(1))` to `Enum(EnumId(13))`.
  - The primary key for the `tenant_order_counters` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `last_number` on the `tenant_order_counters` table. All the data in the column will be lost.
  - You are about to drop the column `tenant_id` on the `tenant_order_counters` table. All the data in the column will be lost.
  - You are about to drop the column `accent_color` on the `tenants` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `tenants` table. All the data in the column will be lost.
  - You are about to drop the column `currency` on the `tenants` table. All the data in the column will be lost.
  - You are about to drop the column `is_active` on the `tenants` table. All the data in the column will be lost.
  - You are about to drop the column `logo_url` on the `tenants` table. All the data in the column will be lost.
  - You are about to drop the column `primary_color` on the `tenants` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `tenants` table. All the data in the column will be lost.
  - You are about to drop the column `whatsapp_number` on the `tenants` table. All the data in the column will be lost.
  - You are about to drop the `availability_blocks` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `products` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[tenantId,slug]` on the table `categories` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenantId,parentId,name]` on the table `categories` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenantId,orderNumber]` on the table `orders` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `path` to the `categories` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `categories` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenantId` to the `categories` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `categories` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `order_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orderId` to the `order_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalCents` to the `order_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unitPriceInCents` to the `order_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `order_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orderNumber` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenantId` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenantId` to the `tenant_order_counters` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `tenants` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `availability_blocks` DROP FOREIGN KEY `availability_blocks_tenant_id_fkey`;

-- DropForeignKey
ALTER TABLE `categories` DROP FOREIGN KEY `categories_tenant_id_fkey`;

-- DropForeignKey
ALTER TABLE `order_items` DROP FOREIGN KEY `order_items_order_id_fkey`;

-- DropForeignKey
ALTER TABLE `order_items` DROP FOREIGN KEY `order_items_product_id_fkey`;

-- DropForeignKey
ALTER TABLE `orders` DROP FOREIGN KEY `orders_tenant_id_fkey`;

-- DropForeignKey
ALTER TABLE `products` DROP FOREIGN KEY `products_category_id_fkey`;

-- DropForeignKey
ALTER TABLE `products` DROP FOREIGN KEY `products_tenant_id_fkey`;

-- DropIndex
DROP INDEX `categories_tenant_id_is_active_idx` ON `categories`;

-- DropIndex
DROP INDEX `order_items_appointment_date_idx` ON `order_items`;

-- DropIndex
DROP INDEX `order_items_product_id_appointment_date_idx` ON `order_items`;

-- DropIndex
DROP INDEX `orders_customer_phone_idx` ON `orders`;

-- DropIndex
DROP INDEX `orders_tenant_id_created_at_idx` ON `orders`;

-- DropIndex
DROP INDEX `orders_tenant_id_order_number_key` ON `orders`;

-- DropIndex
DROP INDEX `orders_tenant_id_status_idx` ON `orders`;

-- AlterTable
ALTER TABLE `categories` DROP COLUMN `created_at`,
    DROP COLUMN `image_url`,
    DROP COLUMN `is_active`,
    DROP COLUMN `sort_order`,
    DROP COLUMN `tenant_id`,
    DROP COLUMN `updated_at`,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `deletedAt` DATETIME(3) NULL,
    ADD COLUMN `depth` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `imageUrl` VARCHAR(500) NULL,
    ADD COLUMN `isVisible` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `metaDescription` VARCHAR(500) NULL,
    ADD COLUMN `metaTitle` VARCHAR(255) NULL,
    ADD COLUMN `parentId` VARCHAR(191) NULL,
    ADD COLUMN `path` VARCHAR(1000) NOT NULL,
    ADD COLUMN `scope` ENUM('INVENTORY', 'SERVICE', 'BOTH') NOT NULL DEFAULT 'BOTH',
    ADD COLUMN `slug` VARCHAR(100) NOT NULL,
    ADD COLUMN `sortOrder` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `tenantId` VARCHAR(191) NOT NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `order_items` DROP COLUMN `appointment_date`,
    DROP COLUMN `appointment_time`,
    DROP COLUMN `created_at`,
    DROP COLUMN `duration_minutes`,
    DROP COLUMN `order_id`,
    DROP COLUMN `product_id`,
    DROP COLUMN `product_is_service`,
    DROP COLUMN `product_name`,
    DROP COLUMN `subtotal_in_cents`,
    DROP COLUMN `unit_price_in_cents`,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `discountCents` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `imageUrl` VARCHAR(500) NULL,
    ADD COLUMN `name` VARCHAR(255) NOT NULL,
    ADD COLUMN `notes` TEXT NULL,
    ADD COLUMN `orderId` VARCHAR(191) NOT NULL,
    ADD COLUMN `serviceId` VARCHAR(191) NULL,
    ADD COLUMN `sku` VARCHAR(100) NULL,
    ADD COLUMN `taxCents` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `totalCents` INTEGER NOT NULL,
    ADD COLUMN `unitPriceInCents` INTEGER NOT NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    ADD COLUMN `variantId` VARCHAR(191) NULL,
    ALTER COLUMN `quantity` DROP DEFAULT;

-- AlterTable
ALTER TABLE `orders` DROP COLUMN `cancelled_at`,
    DROP COLUMN `completed_at`,
    DROP COLUMN `created_at`,
    DROP COLUMN `customer_email`,
    DROP COLUMN `customer_name`,
    DROP COLUMN `customer_notes`,
    DROP COLUMN `customer_phone`,
    DROP COLUMN `internal_notes`,
    DROP COLUMN `order_number`,
    DROP COLUMN `paid_at`,
    DROP COLUMN `subtotal_in_cents`,
    DROP COLUMN `tenant_id`,
    DROP COLUMN `total_in_cents`,
    DROP COLUMN `updated_at`,
    ADD COLUMN `approvalExpiresAt` DATETIME(3) NULL,
    ADD COLUMN `approvedAt` DATETIME(3) NULL,
    ADD COLUMN `approvedBy` VARCHAR(30) NULL,
    ADD COLUMN `billingAddressId` VARCHAR(191) NULL,
    ADD COLUMN `cancellationReason` VARCHAR(500) NULL,
    ADD COLUMN `cancelledAt` DATETIME(3) NULL,
    ADD COLUMN `cancelledBy` VARCHAR(30) NULL,
    ADD COLUMN `completedAt` DATETIME(3) NULL,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `currency` ENUM('CRC', 'USD') NOT NULL DEFAULT 'CRC',
    ADD COLUMN `customerNotes` TEXT NULL,
    ADD COLUMN `customerProfileId` VARCHAR(191) NULL,
    ADD COLUMN `customerReputationScore` INTEGER NULL,
    ADD COLUMN `deletedAt` DATETIME(3) NULL,
    ADD COLUMN `deliveredAt` DATETIME(3) NULL,
    ADD COLUMN `discountCents` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `internalNotes` TEXT NULL,
    ADD COLUMN `isHighRiskOrder` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `orderNumber` VARCHAR(50) NOT NULL,
    ADD COLUMN `paidAmountCents` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `paidAt` DATETIME(3) NULL,
    ADD COLUMN `paymentMethod` ENUM('CASH', 'CARD', 'TRANSFER', 'SINPE_MOVIL', 'OTHER') NULL,
    ADD COLUMN `paymentReference` VARCHAR(255) NULL,
    ADD COLUMN `paymentStatus` ENUM('PENDING', 'PAID', 'PARTIAL', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    ADD COLUMN `placedAt` DATETIME(3) NULL,
    ADD COLUMN `rejectedAt` DATETIME(3) NULL,
    ADD COLUMN `rejectedBy` VARCHAR(30) NULL,
    ADD COLUMN `rejectionReason` VARCHAR(500) NULL,
    ADD COLUMN `requiresApproval` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `shadowProfileId` VARCHAR(191) NULL,
    ADD COLUMN `shippedAt` DATETIME(3) NULL,
    ADD COLUMN `shippingAddressId` VARCHAR(191) NULL,
    ADD COLUMN `shippingCents` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `subtotalCents` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `taxCents` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `tenantId` VARCHAR(191) NOT NULL,
    ADD COLUMN `totalCents` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `trackingNumber` VARCHAR(100) NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    MODIFY `status` ENUM('DRAFT', 'AWAITING_PAYMENT', 'AWAITING_APPROVAL', 'APPROVED', 'REJECTED', 'PROCESSING', 'READY', 'SHIPPED', 'COMPLETED', 'CANCELLED', 'REFUNDED') NOT NULL DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE `tenant_order_counters` DROP PRIMARY KEY,
    DROP COLUMN `last_number`,
    DROP COLUMN `tenant_id`,
    ADD COLUMN `lastNumber` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `tenantId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`tenantId`);

-- AlterTable
ALTER TABLE `tenants` DROP COLUMN `accent_color`,
    DROP COLUMN `created_at`,
    DROP COLUMN `currency`,
    DROP COLUMN `is_active`,
    DROP COLUMN `logo_url`,
    DROP COLUMN `primary_color`,
    DROP COLUMN `updated_at`,
    DROP COLUMN `whatsapp_number`,
    ADD COLUMN `accentColor` VARCHAR(7) NOT NULL DEFAULT '#f59e0b',
    ADD COLUMN `allowGuestCheckout` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `defaultCurrency` ENUM('CRC', 'USD') NOT NULL DEFAULT 'CRC',
    ADD COLUMN `deletedAt` DATETIME(3) NULL,
    ADD COLUMN `isActive` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `legalName` VARCHAR(255) NULL,
    ADD COLUMN `logo` VARCHAR(500) NULL,
    ADD COLUMN `lowReputationThreshold` INTEGER NOT NULL DEFAULT 50,
    ADD COLUMN `orderApprovalTimeoutMinutes` INTEGER NOT NULL DEFAULT 60,
    ADD COLUMN `phone` VARCHAR(20) NULL,
    ADD COLUMN `planType` ENUM('FREE', 'BASIC', 'PREMIUM', 'ENTERPRISE') NOT NULL DEFAULT 'FREE',
    ADD COLUMN `primaryColor` VARCHAR(7) NOT NULL DEFAULT '#6366f1',
    ADD COLUMN `requireOrderApproval` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `taxId` VARCHAR(50) NULL,
    ADD COLUMN `timezone` VARCHAR(50) NOT NULL DEFAULT 'America/Costa_Rica',
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    ADD COLUMN `website` VARCHAR(500) NULL,
    ADD COLUMN `whatsappNumber` VARCHAR(20) NULL;

-- DropTable
DROP TABLE `availability_blocks`;

-- DropTable
DROP TABLE `products`;

-- CreateTable
CREATE TABLE `tenant_banners` (
    `id` VARCHAR(191) NOT NULL,
    `tenantId` VARCHAR(191) NOT NULL,
    `imageUrl` VARCHAR(500) NOT NULL,
    `altText` VARCHAR(255) NULL,
    `linkUrl` VARCHAR(500) NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `tenant_banners_tenantId_isActive_sortOrder_idx`(`tenantId`, `isActive`, `sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(20) NULL,
    `passwordHash` VARCHAR(255) NULL,
    `firstName` VARCHAR(100) NULL,
    `lastName` VARCHAR(100) NULL,
    `avatarUrl` VARCHAR(500) NULL,
    `role` ENUM('SUPER_ADMIN', 'TENANT_OWNER', 'TENANT_ADMIN', 'TENANT_STAFF', 'CUSTOMER') NOT NULL DEFAULT 'CUSTOMER',
    `status` ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION') NOT NULL DEFAULT 'PENDING_VERIFICATION',
    `emailVerifiedAt` DATETIME(3) NULL,
    `phoneVerifiedAt` DATETIME(3) NULL,
    `lastLoginAt` DATETIME(3) NULL,
    `failedLoginAttempts` INTEGER NOT NULL DEFAULT 0,
    `lockedUntil` DATETIME(3) NULL,
    `mergedFromShadowId` VARCHAR(30) NULL,
    `mergedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    UNIQUE INDEX `users_phone_key`(`phone`),
    INDEX `users_email_idx`(`email`),
    INDEX `users_phone_idx`(`phone`),
    INDEX `users_status_idx`(`status`),
    INDEX `users_deletedAt_idx`(`deletedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `global_reputations` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `reputationScore` INTEGER NOT NULL DEFAULT 100,
    `totalOrders` INTEGER NOT NULL DEFAULT 0,
    `completedOrders` INTEGER NOT NULL DEFAULT 0,
    `cancelledOrders` INTEGER NOT NULL DEFAULT 0,
    `rejectedOrders` INTEGER NOT NULL DEFAULT 0,
    `totalBookings` INTEGER NOT NULL DEFAULT 0,
    `completedBookings` INTEGER NOT NULL DEFAULT 0,
    `noShowCount` INTEGER NOT NULL DEFAULT 0,
    `lateArrivalCount` INTEGER NOT NULL DEFAULT 0,
    `lastNoShowAt` DATETIME(3) NULL,
    `isHighRisk` BOOLEAN NOT NULL DEFAULT false,
    `riskNotes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `global_reputations_userId_key`(`userId`),
    INDEX `global_reputations_reputationScore_idx`(`reputationScore`),
    INDEX `global_reputations_isHighRisk_idx`(`isHighRisk`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `customer_profiles` (
    `id` VARCHAR(191) NOT NULL,
    `tenantId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `internalNotes` TEXT NULL,
    `tags` JSON NULL,
    `preferredContactMethod` VARCHAR(20) NULL,
    `totalSpentCents` BIGINT NOT NULL DEFAULT 0,
    `orderCount` INTEGER NOT NULL DEFAULT 0,
    `lastOrderAt` DATETIME(3) NULL,
    `averageOrderCents` INTEGER NOT NULL DEFAULT 0,
    `bookingCount` INTEGER NOT NULL DEFAULT 0,
    `lastBookingAt` DATETIME(3) NULL,
    `noShowCountLocal` INTEGER NOT NULL DEFAULT 0,
    `loyaltyPoints` INTEGER NOT NULL DEFAULT 0,
    `tierLevel` VARCHAR(50) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    INDEX `customer_profiles_tenantId_idx`(`tenantId`),
    INDEX `customer_profiles_userId_idx`(`userId`),
    INDEX `customer_profiles_tenantId_lastOrderAt_idx`(`tenantId`, `lastOrderAt`),
    INDEX `customer_profiles_deletedAt_idx`(`deletedAt`),
    UNIQUE INDEX `customer_profiles_tenantId_userId_key`(`tenantId`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `shadow_profiles` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(255) NULL,
    `phone` VARCHAR(20) NULL,
    `normalizedEmail` VARCHAR(255) NULL,
    `normalizedPhone` VARCHAR(20) NULL,
    `firstName` VARCHAR(100) NULL,
    `lastName` VARCHAR(100) NULL,
    `matchedUserId` VARCHAR(30) NULL,
    `matchConfidence` DOUBLE NULL,
    `matchedAt` DATETIME(3) NULL,
    `isMerged` BOOLEAN NOT NULL DEFAULT false,
    `mergedToUserId` VARCHAR(30) NULL,
    `mergedAt` DATETIME(3) NULL,
    `consentGiven` BOOLEAN NOT NULL DEFAULT false,
    `consentText` TEXT NULL,
    `consentTimestamp` DATETIME(3) NULL,
    `expiresAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `shadow_profiles_email_idx`(`email`),
    INDEX `shadow_profiles_phone_idx`(`phone`),
    INDEX `shadow_profiles_normalizedEmail_idx`(`normalizedEmail`),
    INDEX `shadow_profiles_normalizedPhone_idx`(`normalizedPhone`),
    INDEX `shadow_profiles_matchedUserId_idx`(`matchedUserId`),
    INDEX `shadow_profiles_isMerged_idx`(`isMerged`),
    INDEX `shadow_profiles_expiresAt_idx`(`expiresAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tenant_staff` (
    `id` VARCHAR(191) NOT NULL,
    `tenantId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `role` ENUM('SUPER_ADMIN', 'TENANT_OWNER', 'TENANT_ADMIN', 'TENANT_STAFF', 'CUSTOMER') NOT NULL DEFAULT 'TENANT_STAFF',
    `jobTitle` VARCHAR(100) NULL,
    `canReceiveBookings` BOOLEAN NOT NULL DEFAULT false,
    `bookingColor` VARCHAR(7) NULL,
    `permissions` JSON NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    INDEX `tenant_staff_tenantId_idx`(`tenantId`),
    INDEX `tenant_staff_tenantId_canReceiveBookings_idx`(`tenantId`, `canReceiveBookings`),
    INDEX `tenant_staff_deletedAt_idx`(`deletedAt`),
    UNIQUE INDEX `tenant_staff_tenantId_userId_key`(`tenantId`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inventory_items` (
    `id` VARCHAR(191) NOT NULL,
    `tenantId` VARCHAR(191) NOT NULL,
    `categoryId` VARCHAR(191) NULL,
    `name` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `shortDescription` VARCHAR(500) NULL,
    `brand` VARCHAR(100) NULL,
    `manufacturer` VARCHAR(100) NULL,
    `model` VARCHAR(100) NULL,
    `weightGrams` INTEGER NULL,
    `lengthCm` DOUBLE NULL,
    `widthCm` DOUBLE NULL,
    `heightCm` DOUBLE NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `isFeatured` BOOLEAN NOT NULL DEFAULT false,
    `metaTitle` VARCHAR(255) NULL,
    `metaDescription` VARCHAR(500) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    INDEX `inventory_items_tenantId_categoryId_idx`(`tenantId`, `categoryId`),
    INDEX `inventory_items_tenantId_isActive_idx`(`tenantId`, `isActive`),
    INDEX `inventory_items_tenantId_isFeatured_idx`(`tenantId`, `isFeatured`),
    INDEX `inventory_items_deletedAt_idx`(`deletedAt`),
    UNIQUE INDEX `inventory_items_tenantId_slug_key`(`tenantId`, `slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `item_images` (
    `id` VARCHAR(191) NOT NULL,
    `inventoryItemId` VARCHAR(191) NOT NULL,
    `imageUrl` VARCHAR(500) NOT NULL,
    `altText` VARCHAR(255) NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `isPrimary` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `item_images_inventoryItemId_sortOrder_idx`(`inventoryItemId`, `sortOrder`),
    INDEX `item_images_inventoryItemId_isPrimary_idx`(`inventoryItemId`, `isPrimary`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_variants` (
    `id` VARCHAR(191) NOT NULL,
    `inventoryItemId` VARCHAR(191) NOT NULL,
    `sku` VARCHAR(100) NOT NULL,
    `barcode` VARCHAR(100) NULL,
    `supplierSku` VARCHAR(100) NULL,
    `name` VARCHAR(255) NULL,
    `attributes` JSON NULL,
    `costInCents` INTEGER NOT NULL DEFAULT 0,
    `priceInCents` INTEGER NOT NULL,
    `comparePriceInCents` INTEGER NULL,
    `currency` ENUM('CRC', 'USD') NOT NULL DEFAULT 'CRC',
    `stock` INTEGER NOT NULL DEFAULT 0,
    `lowStockThreshold` INTEGER NOT NULL DEFAULT 5,
    `reservedStock` INTEGER NOT NULL DEFAULT 0,
    `allowBackorder` BOOLEAN NOT NULL DEFAULT false,
    `trackInventory` BOOLEAN NOT NULL DEFAULT true,
    `isDefault` BOOLEAN NOT NULL DEFAULT false,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    INDEX `product_variants_sku_idx`(`sku`),
    INDEX `product_variants_barcode_idx`(`barcode`),
    INDEX `product_variants_inventoryItemId_isDefault_idx`(`inventoryItemId`, `isDefault`),
    INDEX `product_variants_inventoryItemId_isActive_idx`(`inventoryItemId`, `isActive`),
    INDEX `product_variants_deletedAt_idx`(`deletedAt`),
    UNIQUE INDEX `product_variants_inventoryItemId_sku_key`(`inventoryItemId`, `sku`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `stock_reservations` (
    `id` VARCHAR(191) NOT NULL,
    `variantId` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL,
    `status` ENUM('ACTIVE', 'RELEASED', 'CONFIRMED') NOT NULL DEFAULT 'ACTIVE',
    `expiresAt` DATETIME(3) NOT NULL,
    `releasedAt` DATETIME(3) NULL,
    `confirmedAt` DATETIME(3) NULL,
    `releaseReason` VARCHAR(100) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `stock_reservations_variantId_status_idx`(`variantId`, `status`),
    INDEX `stock_reservations_orderId_idx`(`orderId`),
    INDEX `stock_reservations_status_expiresAt_idx`(`status`, `expiresAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `waitlist_requests` (
    `id` VARCHAR(191) NOT NULL,
    `variantId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `email` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(20) NULL,
    `firstName` VARCHAR(100) NULL,
    `requestedQuantity` INTEGER NOT NULL DEFAULT 1,
    `status` ENUM('WAITING', 'NOTIFIED', 'CONVERTED', 'EXPIRED', 'CANCELLED') NOT NULL DEFAULT 'WAITING',
    `notifiedAt` DATETIME(3) NULL,
    `notificationCount` INTEGER NOT NULL DEFAULT 0,
    `lastNotificationError` VARCHAR(500) NULL,
    `convertedOrderId` VARCHAR(30) NULL,
    `convertedAt` DATETIME(3) NULL,
    `expiresAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `waitlist_requests_variantId_status_idx`(`variantId`, `status`),
    INDEX `waitlist_requests_userId_idx`(`userId`),
    INDEX `waitlist_requests_email_idx`(`email`),
    INDEX `waitlist_requests_status_expiresAt_idx`(`status`, `expiresAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `service_definitions` (
    `id` VARCHAR(191) NOT NULL,
    `tenantId` VARCHAR(191) NOT NULL,
    `categoryId` VARCHAR(191) NULL,
    `name` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `shortDescription` VARCHAR(500) NULL,
    `basePriceInCents` INTEGER NOT NULL,
    `currency` ENUM('CRC', 'USD') NOT NULL DEFAULT 'CRC',
    `durationMinutes` INTEGER NOT NULL,
    `bufferMinutes` INTEGER NOT NULL DEFAULT 0,
    `timezone` VARCHAR(50) NOT NULL DEFAULT 'America/Costa_Rica',
    `maxCapacity` INTEGER NOT NULL DEFAULT 1,
    `minAdvanceMinutes` INTEGER NOT NULL DEFAULT 60,
    `maxAdvanceDays` INTEGER NOT NULL DEFAULT 30,
    `cancellationMinutes` INTEGER NOT NULL DEFAULT 1440,
    `allowWaitlist` BOOLEAN NOT NULL DEFAULT true,
    `requiresApproval` BOOLEAN NOT NULL DEFAULT false,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `isFeatured` BOOLEAN NOT NULL DEFAULT false,
    `metaTitle` VARCHAR(255) NULL,
    `metaDescription` VARCHAR(500) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    INDEX `service_definitions_tenantId_categoryId_idx`(`tenantId`, `categoryId`),
    INDEX `service_definitions_tenantId_isActive_idx`(`tenantId`, `isActive`),
    INDEX `service_definitions_deletedAt_idx`(`deletedAt`),
    UNIQUE INDEX `service_definitions_tenantId_slug_key`(`tenantId`, `slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `service_images` (
    `id` VARCHAR(191) NOT NULL,
    `serviceId` VARCHAR(191) NOT NULL,
    `imageUrl` VARCHAR(500) NOT NULL,
    `altText` VARCHAR(255) NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `isPrimary` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `service_images_serviceId_sortOrder_idx`(`serviceId`, `sortOrder`),
    INDEX `service_images_serviceId_isPrimary_idx`(`serviceId`, `isPrimary`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `service_staff_assignments` (
    `id` VARCHAR(191) NOT NULL,
    `serviceId` VARCHAR(191) NOT NULL,
    `staffId` VARCHAR(191) NOT NULL,
    `customPriceInCents` INTEGER NULL,
    `customDurationMinutes` INTEGER NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `service_staff_assignments_staffId_idx`(`staffId`),
    INDEX `service_staff_assignments_serviceId_isActive_idx`(`serviceId`, `isActive`),
    UNIQUE INDEX `service_staff_assignments_serviceId_staffId_key`(`serviceId`, `staffId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `service_time_slots` (
    `id` VARCHAR(191) NOT NULL,
    `serviceId` VARCHAR(191) NOT NULL,
    `dayOfWeek` ENUM('SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY') NULL,
    `startTime` VARCHAR(5) NOT NULL,
    `endTime` VARCHAR(5) NOT NULL,
    `specificDate` DATE NULL,
    `isBlocked` BOOLEAN NOT NULL DEFAULT false,
    `blockReason` VARCHAR(255) NULL,
    `capacityOverride` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `service_time_slots_serviceId_dayOfWeek_idx`(`serviceId`, `dayOfWeek`),
    INDEX `service_time_slots_serviceId_specificDate_idx`(`serviceId`, `specificDate`),
    INDEX `service_time_slots_serviceId_isBlocked_idx`(`serviceId`, `isBlocked`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bookings` (
    `id` VARCHAR(191) NOT NULL,
    `serviceId` VARCHAR(191) NOT NULL,
    `customerId` VARCHAR(191) NOT NULL,
    `staffId` VARCHAR(191) NULL,
    `orderId` VARCHAR(191) NULL,
    `userId` VARCHAR(191) NOT NULL,
    `scheduledStart` DATETIME(3) NOT NULL,
    `scheduledEnd` DATETIME(3) NOT NULL,
    `timezone` VARCHAR(50) NOT NULL,
    `status` ENUM('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'NO_SHOW', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `checkedInAt` DATETIME(3) NULL,
    `completedAt` DATETIME(3) NULL,
    `noShowMarkedAt` DATETIME(3) NULL,
    `cancelledAt` DATETIME(3) NULL,
    `cancelledBy` VARCHAR(30) NULL,
    `cancellationReason` VARCHAR(500) NULL,
    `isLateCancellation` BOOLEAN NOT NULL DEFAULT false,
    `customerNotes` TEXT NULL,
    `staffNotes` TEXT NULL,
    `priceInCents` INTEGER NOT NULL,
    `currency` ENUM('CRC', 'USD') NOT NULL,
    `reminderSentAt` DATETIME(3) NULL,
    `confirmationSentAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    INDEX `bookings_serviceId_scheduledStart_idx`(`serviceId`, `scheduledStart`),
    INDEX `bookings_customerId_idx`(`customerId`),
    INDEX `bookings_staffId_scheduledStart_idx`(`staffId`, `scheduledStart`),
    INDEX `bookings_userId_idx`(`userId`),
    INDEX `bookings_status_idx`(`status`),
    INDEX `bookings_scheduledStart_idx`(`scheduledStart`),
    INDEX `bookings_deletedAt_idx`(`deletedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `addresses` (
    `id` VARCHAR(191) NOT NULL,
    `tenantId` VARCHAR(191) NOT NULL,
    `label` VARCHAR(50) NULL,
    `province` VARCHAR(50) NOT NULL,
    `canton` VARCHAR(100) NOT NULL,
    `district` VARCHAR(100) NOT NULL,
    `streetAddress` VARCHAR(500) NOT NULL,
    `additionalInfo` VARCHAR(500) NULL,
    `postalCode` VARCHAR(20) NULL,
    `latitude` DOUBLE NULL,
    `longitude` DOUBLE NULL,
    `contactName` VARCHAR(100) NULL,
    `contactPhone` VARCHAR(20) NULL,
    `isDefault` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    INDEX `addresses_tenantId_idx`(`tenantId`),
    INDEX `addresses_tenantId_isDefault_idx`(`tenantId`, `isDefault`),
    INDEX `addresses_deletedAt_idx`(`deletedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `categories_tenantId_parentId_idx` ON `categories`(`tenantId`, `parentId`);

-- CreateIndex
CREATE INDEX `categories_tenantId_path_idx` ON `categories`(`tenantId`, `path`(255));

-- CreateIndex
CREATE INDEX `categories_tenantId_scope_idx` ON `categories`(`tenantId`, `scope`);

-- CreateIndex
CREATE INDEX `categories_deletedAt_idx` ON `categories`(`deletedAt`);

-- CreateIndex
CREATE UNIQUE INDEX `categories_tenantId_slug_key` ON `categories`(`tenantId`, `slug`);

-- CreateIndex
CREATE UNIQUE INDEX `categories_tenantId_parentId_name_key` ON `categories`(`tenantId`, `parentId`, `name`);

-- CreateIndex
CREATE INDEX `order_items_orderId_idx` ON `order_items`(`orderId`);

-- CreateIndex
CREATE INDEX `order_items_variantId_idx` ON `order_items`(`variantId`);

-- CreateIndex
CREATE INDEX `order_items_serviceId_idx` ON `order_items`(`serviceId`);

-- CreateIndex
CREATE INDEX `orders_tenantId_status_idx` ON `orders`(`tenantId`, `status`);

-- CreateIndex
CREATE INDEX `orders_tenantId_createdAt_idx` ON `orders`(`tenantId`, `createdAt`);

-- CreateIndex
CREATE INDEX `orders_customerProfileId_idx` ON `orders`(`customerProfileId`);

-- CreateIndex
CREATE INDEX `orders_shadowProfileId_idx` ON `orders`(`shadowProfileId`);

-- CreateIndex
CREATE INDEX `orders_status_approvalExpiresAt_idx` ON `orders`(`status`, `approvalExpiresAt`);

-- CreateIndex
CREATE INDEX `orders_paymentStatus_idx` ON `orders`(`paymentStatus`);

-- CreateIndex
CREATE INDEX `orders_deletedAt_idx` ON `orders`(`deletedAt`);

-- CreateIndex
CREATE UNIQUE INDEX `orders_tenantId_orderNumber_key` ON `orders`(`tenantId`, `orderNumber`);

-- CreateIndex
CREATE INDEX `tenants_slug_idx` ON `tenants`(`slug`);

-- CreateIndex
CREATE INDEX `tenants_isActive_idx` ON `tenants`(`isActive`);

-- CreateIndex
CREATE INDEX `tenants_deletedAt_idx` ON `tenants`(`deletedAt`);

-- AddForeignKey
ALTER TABLE `tenant_banners` ADD CONSTRAINT `tenant_banners_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenants`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `global_reputations` ADD CONSTRAINT `global_reputations_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `customer_profiles` ADD CONSTRAINT `customer_profiles_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenants`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `customer_profiles` ADD CONSTRAINT `customer_profiles_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tenant_staff` ADD CONSTRAINT `tenant_staff_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenants`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tenant_staff` ADD CONSTRAINT `tenant_staff_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `categories` ADD CONSTRAINT `categories_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenants`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `categories` ADD CONSTRAINT `categories_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventory_items` ADD CONSTRAINT `inventory_items_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenants`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventory_items` ADD CONSTRAINT `inventory_items_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `item_images` ADD CONSTRAINT `item_images_inventoryItemId_fkey` FOREIGN KEY (`inventoryItemId`) REFERENCES `inventory_items`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_variants` ADD CONSTRAINT `product_variants_inventoryItemId_fkey` FOREIGN KEY (`inventoryItemId`) REFERENCES `inventory_items`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stock_reservations` ADD CONSTRAINT `stock_reservations_variantId_fkey` FOREIGN KEY (`variantId`) REFERENCES `product_variants`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stock_reservations` ADD CONSTRAINT `stock_reservations_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `waitlist_requests` ADD CONSTRAINT `waitlist_requests_variantId_fkey` FOREIGN KEY (`variantId`) REFERENCES `product_variants`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `waitlist_requests` ADD CONSTRAINT `waitlist_requests_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `service_definitions` ADD CONSTRAINT `service_definitions_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenants`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `service_definitions` ADD CONSTRAINT `service_definitions_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `service_images` ADD CONSTRAINT `service_images_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `service_definitions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `service_staff_assignments` ADD CONSTRAINT `service_staff_assignments_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `service_definitions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `service_staff_assignments` ADD CONSTRAINT `service_staff_assignments_staffId_fkey` FOREIGN KEY (`staffId`) REFERENCES `tenant_staff`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `service_time_slots` ADD CONSTRAINT `service_time_slots_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `service_definitions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `service_definitions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `customer_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_staffId_fkey` FOREIGN KEY (`staffId`) REFERENCES `tenant_staff`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenants`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_customerProfileId_fkey` FOREIGN KEY (`customerProfileId`) REFERENCES `customer_profiles`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_shadowProfileId_fkey` FOREIGN KEY (`shadowProfileId`) REFERENCES `shadow_profiles`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_shippingAddressId_fkey` FOREIGN KEY (`shippingAddressId`) REFERENCES `addresses`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_billingAddressId_fkey` FOREIGN KEY (`billingAddressId`) REFERENCES `addresses`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_variantId_fkey` FOREIGN KEY (`variantId`) REFERENCES `product_variants`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `service_definitions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `addresses` ADD CONSTRAINT `addresses_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenants`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tenant_order_counters` ADD CONSTRAINT `tenant_order_counters_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenants`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
