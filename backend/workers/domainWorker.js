const cron = require('node-cron');
const prisma = require('../prismaClient');
const domainService = require('../src/services/domainService');

const domainWorker = () => {
  console.log('🔄 [Domain Worker] Initialized. Running every 5 minutes...');

  cron.schedule('*/5 * * * *', async () => {
    console.log('🔄 [Domain Worker] Checking for pending domains...');
    
    try {
      const pendingDomains = await prisma.familyDomain.findMany({
        where: {
          domainStatus: {
            in: ['PENDING_SETUP', 'DNS_CONFIGURED']
          }
        }
      });

      for (const fd of pendingDomains) {
        console.log(`[Domain Worker] Verifying DNS for ${fd.domainName}...`);
        try {
          await domainService.verifyDomain(fd.id, { app: null });
        } catch (err) {
          console.error(`[Domain Worker] Verification attempt error for ${fd.domainName}:`, err.message);
        }
      }
    } catch (err) {
      console.error('❌ [Domain Worker] Error:', err);
    }
  });
};

module.exports = domainWorker;
