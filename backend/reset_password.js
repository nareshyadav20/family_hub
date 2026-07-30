const bcrypt = require('bcrypt');
const prisma = require('./prismaClient');

async function main() {
  const email = 'panganareshyadav24@gmail.com';
  const newPassword = 'password123';
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  
  const user = await prisma.user.update({
    where: { email },
    data: { password: hashedPassword }
  });
  console.log(`Password reset for ${user.email}`);
}
main().catch(console.error).finally(() => prisma.$disconnect());
