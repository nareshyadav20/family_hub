const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const prisma = new PrismaClient();

async function testToken() {
  const user = await prisma.user.findUnique({
    where: { email: 'panganareshyadav24@gmail.com' }
  });
  console.log("User familyId from DB:", user.familyId);
  const token = jwt.sign(
    { userId: user.id, role: user.role, familyId: user.familyId },
    process.env.JWT_SECRET || 'fallback',
    { expiresIn: '7d' }
  );
  const decoded = jwt.decode(token);
  console.log("Decoded Token Payload:", decoded);
}
testToken().catch(console.error).finally(() => prisma.$disconnect());
