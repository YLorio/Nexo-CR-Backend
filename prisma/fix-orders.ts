import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = 'yeslerloriop21@gmail.com';
  console.log(`Linking existing orders for ${email}...`);

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.error('User not found');
    return;
  }

  // Get all orders with this email
  const orders = await prisma.order.findMany({
    where: { customerEmail: email, customerProfileId: null }
  });

  console.log(`Found ${orders.length} unlinked orders.`);

  for (const order of orders) {
    // Upsert profile for this tenant/user
    const profile = await prisma.customerProfile.upsert({
      where: {
        tenantId_userId: {
          tenantId: order.tenantId,
          userId: user.id,
        }
      },
      update: {},
      create: {
        tenantId: order.tenantId,
        userId: user.id,
      }
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { customerProfileId: profile.id }
    });
    
    console.log(`Linked order #${order.orderNumber} to profile ${profile.id}`);
  }

  console.log('Done!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
