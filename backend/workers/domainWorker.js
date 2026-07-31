const cron = require('node-cron');
const dns = require('dns').promises;
const prisma = require('../prismaClient');

const verifyDns = async (domain) => {
  try {
    const aRecords = await dns.resolve4(domain);
    return aRecords.length > 0;
  } catch (err) {
    try {
      const cnameRecords = await dns.resolveCname(domain);
      return cnameRecords.length > 0;
    } catch (err2) {
      return false;
    }
  }
};

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
        const isValid = await verifyDns(fd.domainName);

        if (isValid) {
          console.log(`[Domain Worker] DNS is valid for ${fd.domainName}. Updating status...`);
          
          await prisma.$transaction(async (tx) => {
            const updated = await tx.familyDomain.update({
              where: { id: fd.id },
              data: {
                domainStatus: 'DNS_VERIFIED',
                dnsVerified: true
              }
            });

            await tx.domainHistory.create({
              data: {
                familyDomainId: fd.id,
                status: 'DNS_VERIFIED',
                updatedBy: 'SYSTEM_WORKER',
                notes: 'DNS automatically verified by worker.'
              }
            });

            // Mock SSL Generation
            console.log(`[Domain Worker] Mocking SSL generation for ${fd.domainName}...`);
            await tx.familyDomain.update({
              where: { id: fd.id },
              data: {
                domainStatus: 'LIVE',
                sslStatus: 'ACTIVE'
              }
            });

            await tx.domainHistory.create({
              data: {
                familyDomainId: fd.id,
                status: 'LIVE',
                updatedBy: 'SYSTEM_WORKER',
                notes: 'SSL automatically provisioned and domain is now LIVE.'
              }
            });
          });
          console.log(`[Domain Worker] ${fd.domainName} is now LIVE.`);
        } else {
          console.log(`[Domain Worker] DNS not yet propagated for ${fd.domainName}.`);
        }
      }
    } catch (err) {
      console.error('❌ [Domain Worker] Error:', err);
    }
  });
};

module.exports = domainWorker;
