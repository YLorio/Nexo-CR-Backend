/*
  Warnings:

  - Added the required column `customerName` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customerPhone` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `orders` ADD COLUMN `customerEmail` VARCHAR(255) NULL,
    ADD COLUMN `customerName` VARCHAR(255) NOT NULL,
    ADD COLUMN `customerPhone` VARCHAR(50) NOT NULL;
