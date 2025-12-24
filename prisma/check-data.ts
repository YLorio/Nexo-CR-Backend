import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Checking data in database...\n');

  // Check tenants
  const tenants = await prisma.$queryRaw`
    SELECT id, name, banner_url, banner_urls,
           CHAR_LENGTH(banner_urls) as banner_urls_len,
           HEX(banner_urls) as banner_urls_hex
    FROM tenants
  ` as any[];

  console.log('=== TENANTS ===');
  for (const t of tenants) {
    console.log(`ID: ${t.id}`);
    console.log(`Name: ${t.name}`);
    console.log(`banner_url: ${t.banner_url}`);
    console.log(`banner_urls: ${t.banner_urls}`);
    console.log(`banner_urls length: ${t.banner_urls_len}`);
    console.log(`banner_urls hex: ${t.banner_urls_hex}`);
    console.log('---');
  }

  // Check products
  const products = await prisma.$queryRaw`
    SELECT id, name, image_url, image_urls,
           CHAR_LENGTH(image_urls) as image_urls_len,
           HEX(image_urls) as image_urls_hex
    FROM products
    LIMIT 5
  ` as any[];

  console.log('\n=== PRODUCTS (first 5) ===');
  for (const p of products) {
    console.log(`ID: ${p.id}`);
    console.log(`Name: ${p.name}`);
    console.log(`image_url: ${p.image_url}`);
    console.log(`image_urls: ${p.image_urls}`);
    console.log(`image_urls length: ${p.image_urls_len}`);
    console.log(`image_urls hex: ${p.image_urls_hex}`);
    console.log('---');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
