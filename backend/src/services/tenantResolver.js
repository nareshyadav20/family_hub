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
      include: { 
        family: {
          include: {
            members: {
              where: {
                role: {
                  in: ['SUPER_ADMIN', 'ADMIN']
                }
              },
              take: 1
            }
          }
        } 
      }
    });

    if (familyDomain) {
      // STRICT VALIDATION
      const isDomainLive = familyDomain.domainStatus === 'LIVE';
      const isVerified = familyDomain.verificationStatus === 'VERIFIED';
      const isDnsVerified = familyDomain.dnsVerified === true;
      const hasFamily = !!familyDomain.family;
      const isFamilyActive = hasFamily && familyDomain.family.status === 'Active';
      const hasSuperAdmin = hasFamily && familyDomain.family.members && familyDomain.family.members.length > 0;

      const isDev = process.env.NODE_ENV !== 'production';
      const isDomainValid = isDev ? true : (isDomainLive && isVerified && isDnsVerified);

      if (isDomainValid && hasFamily && isFamilyActive && hasSuperAdmin) {
        family = familyDomain.family;
        domainRecord = familyDomain;
      }
    }

    // 2. Fallback to legacy customDomain on Family model if not found
    if (!family) {
      const legacyFamily = await prisma.family.findUnique({
        where: { customDomain: hostname },
        include: {
          members: {
            where: { role: 'SUPER_ADMIN' },
            take: 1
          }
        }
      });
      
      if (legacyFamily && legacyFamily.status === 'Active' && legacyFamily.members && legacyFamily.members.length > 0) {
        family = legacyFamily;
        domainRecord = {
          id: 'legacy',
          domainName: legacyFamily.customDomain,
          domainStatus: 'LIVE',
          verificationStatus: 'VERIFIED',
          dnsVerified: true
        };
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
  async invalidateTenantCache(domainName) {
    if (!domainName) return;
    try {
      await redisClient.del(`tenant-domain:${domainName}`);
      console.log(`[Redis] Cleared cache for ${domainName}`);
    } catch (err) {
      console.error('[Redis] Cache invalidation failed', err);
    }
  }
}

module.exports = new TenantResolver();
