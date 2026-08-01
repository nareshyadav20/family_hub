const dns = require('dns').promises;
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class DnsWorker {
  
  /**
   * Main job processor for DNS Queue
   */
  async processJob(job) {
    console.log(`[DNS Worker] Processing job ${job.id} for domain ${job.data.domain}`);
    const { domainId, domainName } = job.data;

    try {
      // 1. Fetch Expected DNS Records
      const expectedRecords = await prisma.domainDnsRecord.findMany({
        where: { domainId, isVerified: false }
      });

      if (!expectedRecords || expectedRecords.length === 0) {
        console.log(`[DNS Worker] No pending DNS records for ${domainName}. Skipping.`);
        return { success: true, message: 'No records to verify' };
      }

      let allVerified = true;

      // 2. Iterate and Verify
      for (const record of expectedRecords) {
        const verified = await this.verifyRecord(domainName, record);
        
        if (verified) {
          await prisma.domainDnsRecord.update({
            where: { id: record.id },
            data: { isVerified: true, status: 'Verified', actualValue: record.expectedValue }
          });
        } else {
          allVerified = false;
        }
      }

      // 3. Update Domain Status if all verified
      if (allVerified) {
        await prisma.familyDomain.update({
          where: { id: domainId },
          data: { dnsVerified: true, domainStatus: 'DNS_CONFIGURED' }
        });

        await prisma.domainEvent.create({
          data: {
            domainId,
            eventType: 'DNS_VERIFIED',
            message: `Automated DNS worker verified all records for ${domainName}.`,
            triggeredBy: 'SYSTEM_WORKER'
          }
        });

        console.log(`[DNS Worker] Domain ${domainName} is fully DNS verified.`);
      }

      return { success: true, allVerified };

    } catch (error) {
      console.error(`[DNS Worker] Failed for ${domainName}:`, error);
      throw error;
    }
  }

  async verifyRecord(domain, record) {
    try {
      switch (record.recordType) {
        case 'A': {
          const addresses = await dns.resolve4(domain);
          return addresses.includes(record.expectedValue);
        }
        case 'CNAME': {
          // If CNAME is for www.
          const checkDomain = record.recordName === 'www' ? `www.${domain}` : domain;
          const addresses = await dns.resolveCname(checkDomain);
          return addresses.includes(record.expectedValue);
        }
        case 'TXT': {
          const records = await dns.resolveTxt(domain);
          const flatRecords = records.flat();
          return flatRecords.includes(record.expectedValue);
        }
        default:
          return false;
      }
    } catch (e) {
      // dns.resolve throws if not found
      return false;
    }
  }
}

module.exports = new DnsWorker();
