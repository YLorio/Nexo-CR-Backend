import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('=== Checking Users ===');
  const users = await prisma.user.findMany({
    select: { id: true, email: true, firstName: true, role: true }
  });
  console.log(`Users found: ${users.length}`);
  users.forEach(u => console.log(`- ${u.email} (${u.id}) [${u.role}]`));

  console.log('\n=== Checking Customer Profiles ===');
  const profiles = await prisma.customerProfile.findMany({
    include: { 
      user: { select: { email: true } }, 
      tenant: { select: { name: true } } 
    }
  });
  console.log(`Customer Profiles found: ${profiles.length}`);
  profiles.forEach(p => console.log(`- User: ${p.user?.email || 'N/A'} in Tenant: ${p.tenant?.name || 'N/A'} (ProfileID: ${p.id})`));

  console.log('\n=== Checking Orders ===');
  const orders = await prisma.order.findMany({
    select: { id: true, orderNumber: true, customerName: true, customerProfileId: true, customerEmail: true }
  });
  console.log(`Orders found: ${orders.length}`);
  orders.forEach(o => console.log(`- Order #${o.orderNumber} for ${o.customerName} (Email: ${o.customerEmail}, ProfileID: ${o.customerProfileId})`));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());