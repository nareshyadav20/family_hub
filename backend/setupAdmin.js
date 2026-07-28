const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const email = 'admin@familyhub.com';
  const password = await bcrypt.hash('admin123', 10);
  
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      password,
      role: 'SUPER_ADMIN'
    },
    create: {
      email,
      password,
      firstName: 'Admin',
      lastName: 'User',
      role: 'SUPER_ADMIN',
      status: 'ACTIVE'
    }
  });

  console.log('Admin user ensured:', user.email);
}

main().catch(console.error).finally(() => prisma.$disconnect());
