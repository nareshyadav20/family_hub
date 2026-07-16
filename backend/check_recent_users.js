const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: { email: true, role: true, createdAt: true },
    take: 5
  });
  console.log(users);
}
main().catch(console.error).finally(() => prisma.$disconnect());
