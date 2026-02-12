import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('=== Checking Order #15 Details ===');
  const order = await prisma.order.findFirst({
    where: { orderNumber: "15" },
    select: { id: true, orderNumber: true, paymentProofUrl: true, paymentMethod: true }
  });
  
  if (order) {
    console.log(`Order ID: ${order.id}`);
    console.log(`Order Number: ${order.orderNumber}`);
    console.log(`Payment Method: ${order.paymentMethod}`);
    console.log(`Payment Proof URL: ${order.paymentProofUrl || 'NULL (Empty)'}`);
  } else {
    console.log('Order #15 not found.');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
