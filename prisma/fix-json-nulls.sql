-- Fix NULL values in JSON columns that were added later
-- Run this script to update existing rows with proper empty JSON arrays

-- Fix Tenant.bannerUrls
UPDATE tenants
SET banner_urls = '[]'
WHERE banner_urls IS NULL;

-- Fix Product.imageUrls
UPDATE products
SET image_urls = '[]'
WHERE image_urls IS NULL;

-- Verify the fix
SELECT id, name, banner_urls FROM tenants;
SELECT id, name, image_urls FROM products LIMIT 10;
