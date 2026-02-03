-- CreateTable
CREATE TABLE `tenants` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(100) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `whatsapp_number` VARCHAR(20) NOT NULL,
    `email` VARCHAR(255) NULL,
    `primary_color` VARCHAR(7) NOT NULL DEFAULT '#6366f1',
    `accent_color` VARCHAR(7) NOT NULL DEFAULT '#f59e0b',
    `logo_url` VARCHAR(500) NULL,
    `currency` VARCHAR(3) NOT NULL DEFAULT 'CRC',
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `tenants_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `categories` (
    `id` VARCHAR(191) NOT NULL,
    `tenant_id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,
    `image_url` VARCHAR(500) NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `categories_tenant_id_idx`(`tenant_id`),
    INDEX `categories_tenant_id_is_active_idx`(`tenant_id`, `is_active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `products` (
    `id` VARCHAR(191) NOT NULL,
    `tenant_id` VARCHAR(191) NOT NULL,
    `category_id` VARCHAR(191) NULL,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `image_url` VARCHAR(500) NULL,
    `price_in_cents` INTEGER NOT NULL,
    `is_service` BOOLEAN NOT NULL DEFAULT false,
    `stock` INTEGER NOT NULL DEFAULT 0,
    `sku` VARCHAR(50) NULL,
    `duration_minutes` INTEGER NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `products_tenant_id_idx`(`tenant_id`),
    INDEX `products_tenant_id_is_active_idx`(`tenant_id`, `is_active`),
    INDEX `products_tenant_id_category_id_idx`(`tenant_id`, `category_id`),
    INDEX `products_tenant_id_is_service_idx`(`tenant_id`, `is_service`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `availability_blocks` (
    `id` VARCHAR(191) NOT NULL,
    `tenant_id` VARCHAR(191) NOT NULL,
    `day_of_week` ENUM('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY') NOT NULL,
    `start_time` VARCHAR(5) NOT NULL,
    `end_time` VARCHAR(5) NOT NULL,
    `capacity` INTEGER NOT NULL DEFAULT 1,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `availability_blocks_tenant_id_idx`(`tenant_id`),
    INDEX `availability_blocks_tenant_id_day_of_week_idx`(`tenant_id`, `day_of_week`),
    INDEX `availability_blocks_tenant_id_day_of_week_is_active_idx`(`tenant_id`, `day_of_week`, `is_active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `orders` (
    `id` VARCHAR(191) NOT NULL,
    `tenant_id` VARCHAR(191) NOT NULL,
    `order_number` INTEGER NOT NULL,
    `customer_name` VARCHAR(255) NOT NULL,
    `customer_phone` VARCHAR(20) NOT NULL,
    `customer_email` VARCHAR(255) NULL,
    `subtotal_in_cents` INTEGER NOT NULL,
    `total_in_cents` INTEGER NOT NULL,
    `status` ENUM('PENDING_PAYMENT', 'PAID', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING_PAYMENT',
    `customer_notes` TEXT NULL,
    `internal_notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `paid_at` DATETIME(3) NULL,
    `completed_at` DATETIME(3) NULL,
    `cancelled_at` DATETIME(3) NULL,

    INDEX `orders_tenant_id_idx`(`tenant_id`),
    INDEX `orders_tenant_id_status_idx`(`tenant_id`, `status`),
    INDEX `orders_tenant_id_created_at_idx`(`tenant_id`, `created_at`),
    INDEX `orders_customer_phone_idx`(`customer_phone`),
    UNIQUE INDEX `orders_tenant_id_order_number_key`(`tenant_id`, `order_number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `order_items` (
    `id` VARCHAR(191) NOT NULL,
    `order_id` VARCHAR(191) NOT NULL,
    `product_id` VARCHAR(191) NOT NULL,
    `product_name` VARCHAR(255) NOT NULL,
    `product_is_service` BOOLEAN NOT NULL,
    `unit_price_in_cents` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,
    `subtotal_in_cents` INTEGER NOT NULL,
    `appointment_date` DATE NULL,
    `appointment_time` VARCHAR(5) NULL,
    `duration_minutes` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `order_items_order_id_idx`(`order_id`),
    INDEX `order_items_product_id_idx`(`product_id`),
    INDEX `order_items_product_id_appointment_date_idx`(`product_id`, `appointment_date`),
    INDEX `order_items_appointment_date_idx`(`appointment_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tenant_order_counters` (
    `tenant_id` VARCHAR(191) NOT NULL,
    `last_number` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`tenant_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `categories` ADD CONSTRAINT `categories_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `products_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `products_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `availability_blocks` ADD CONSTRAINT `availability_blocks_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
