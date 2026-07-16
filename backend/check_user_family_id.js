const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'panganareshyadav24@gmail.com' },
    select: { id: true, familyId: true, role: true }
  });
  fs.writeFileSync('user_output.json', JSON.stringify(user, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
