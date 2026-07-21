const { PrismaClient } = require('@prisma/client'); 
const prisma = new PrismaClient(); 
async function main() { 
  try { 
    const e = await prisma.event.create({ 
      data: { familyId: 'fam_123', eventId: 'EVT-00', name: 'Test', eventDate: new Date(), streamId: 'abc1234', streamStatus: 'OFFLINE' } 
    }); 
    console.log(e); 
  } catch(e) { 
    console.error('ERROR:', e.message); 
  } finally { 
    await prisma.$disconnect(); 
  } 
} 
main();
