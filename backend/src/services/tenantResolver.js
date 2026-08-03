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
      console.warn('[Redis] Cache read failed', e.message);
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
      // We shouldn't block CORS or routing for 'Pending' families, otherwise they can't complete onboarding or login.
      if (familyDomain.family) {
        family = familyDomain.family;
        domainRecord = familyDomain;
      }
    }

    // 2. Fallback to legacy customDomain on Family model if not found
    if (!family) {
      const legacyFamily = await prisma.family.findUnique({
        where: { customDomain: hostname },
      });
      if (legacyFamily) {
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
