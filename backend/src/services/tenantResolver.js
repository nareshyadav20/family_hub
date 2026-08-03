const prisma = require('../../prismaClient');
const redisClient = require('../../redisClient');

class TenantResolver {
  async resolve(hostname) {
    if (!hostname) return null;

    // Normalize hostname
    hostname = hostname.replace(/^www\./, '');

    const cacheKey = `tenant-domain:${hostname}`;

    try {
      const cachedTenantStr = await redisClient.get(cacheKey);
      if (cachedTenantStr) {
        if (cachedTenantStr === 'NOT_FOUND') {
          return null; // Known invalid domain
        }
        return JSON.parse(cachedTenantStr); // HIT -> Return Tenant
      }
    } catch (e) {
      console.warn('[Redis] Cache read failed', e);
    }

    // MISS -> Database lookup
    let family = null;
    let domainRecord = null;

    // 1. Check FamilyDomain table
    const familyDomain = await prisma.familyDomain.findUnique({
      where: { domainName: hostname },
      include: { family: true }
    });

    if (familyDomain) {
      // Validate
      const isDomainLive = familyDomain.domainStatus === 'LIVE';
      const isFamilyActive = familyDomain.family && familyDomain.family.status === 'Active';
      const isDnsVerified = familyDomain.dnsVerified === true || familyDomain.verificationStatus === 'VERIFIED';
      
      // Note: We might relax DNS verified if 'LIVE' implies it's verified, but being explicit is good.
      if (isDomainLive && isFamilyActive) {
        family = familyDomain.family;
        domainRecord = familyDomain;
      }
    }

    // 2. Fallback to legacy customDomain on Family model if not found
    if (!family) {
      const legacyFamily = await prisma.family.findUnique({
        where: { customDomain: hostname },
      });
      if (legacyFamily && legacyFamily.status === 'Active') {
        family = legacyFamily;
      }
    }

    // 3. Cache and return
    if (family) {
      const tenantData = {
        ...family,
        domainRecord: domainRecord
      };

      try {
        await redisClient.set(cacheKey, JSON.stringify(tenantData), {
          EX: 300 // Cache for 5 minutes
        });
      } catch (e) {
        console.warn('[Redis] Cache write failed', e);
      }
      return tenantData;
    } else {
      try {
        await redisClient.set(cacheKey, 'NOT_FOUND', { EX: 300 });
      } catch (e) {
        console.warn('[Redis] Cache write failed', e);
      }
      return null;
    }
  }
}

module.exports = new TenantResolver();
