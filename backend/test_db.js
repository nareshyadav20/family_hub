const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const events = await prisma.event.findMany({ select: { id: true, name: true, streamId: true } });
  console.log(events);
  await prisma.$disconnect();
}
main();
