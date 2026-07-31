const cron = require('node-cron');
const prisma = require('../prismaClient');
const domainService = require('../src/services/domainService');

let isRunning = false;

const domainWorker = () => {
  console.log('🔄 [Domain Worker] Initialized. Running every 5 minutes...');

  cron.schedule('*/5 * * * *', async () => {
    if (isRunning) {
      console.warn('⚠️ [Domain Worker] Previous job still running, skipping this tick.');
      return;
    }
    
    isRunning = true;
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
    } finally {
      isRunning = false;
    }
  });
};

module.exports = domainWorker;
