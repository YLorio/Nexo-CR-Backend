import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Fixing empty/NULL JSON values...');

  // Fix Tenant.bannerUrls - update both NULL and empty strings
  const tenantsFixed = await prisma.$executeRaw`
    UPDATE tenants
    SET banner_urls = '[]'
    WHERE banner_urls IS NULL
       OR banner_urls = ''
       OR CHAR_LENGTH(banner_urls) = 0
  `;
  console.log(`Fixed ${tenantsFixed} tenant(s) with empty/NULL bannerUrls`);

  // Fix Product.imageUrls - update both NULL and empty strings
  const productsFixed = await prisma.$executeRaw`
    UPDATE products
    SET image_urls = '[]'
    WHERE image_urls IS NULL
       OR image_urls = ''
       OR CHAR_LENGTH(image_urls) = 0
  `;
  console.log(`Fixed ${productsFixed} product(s) with empty/NULL imageUrls`);

  // Verify
  const tenantCheck = await prisma.$queryRaw`
    SELECT COUNT(*) as count FROM tenants WHERE banner_urls = '[]'
  ` as any[];
  console.log(`\nTenants with valid empty array: ${tenantCheck[0].count}`);

  const productCheck = await prisma.$queryRaw`
    SELECT COUNT(*) as count FROM products WHERE image_urls = '[]'
  ` as any[];
  console.log(`Products with valid empty array: ${productCheck[0].count}`);

  console.log('\nDone!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
