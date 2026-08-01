const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const redis = require('redis'); // Mock redis or actual depending on setup

// Mock redis client for now
const cache = {
  store: {},
  async get(key) { return this.store[key]; },
  async setex(key, ttl, value) { this.store[key] = value; }
};

/**
 * Middleware to resolve tenant (Family) by the incoming Request Host Header.
 * This is used for all public API endpoints (Gallery, Members, Feed, etc.)
 */
const tenantResolver = async (req, res, next) => {
  try {
    const rawHost = req.headers.host || '';
    
    // 1. Normalize Host
    let host = rawHost.toLowerCase().trim();
    host = host.split(':')[0]; // Remove port
    host = host.replace(/^www\\./, ''); // Remove www

    if (!host) {
      return res.status(400).json({ success: false, message: 'Missing Host header' });
    }

    // 2. Check Redis Cache
    const cachedData = await cache.get(`host:${host}`);
    if (cachedData) {
      const parsed = JSON.parse(cachedData);
      req.familyId = parsed.familyId;
      req.tenantBrand = parsed.brand;
      return next();
    }

    // 3. Fallback to Database
    const familyDomain = await prisma.familyDomain.findUnique({
      where: { domainName: host },
      include: { family: true }
    });

    if (!familyDomain || familyDomain.domainStatus !== 'LIVE') {
      return res.status(404).json({ success: false, message: 'Tenant not found or inactive.' });
    }

    const family = familyDomain.family;
    const tenantData = {
      familyId: family.id,
      brand: {
        logo: family.logo,
        themeColor: family.themeColor,
        primaryColor: family.primaryColor,
        secondaryColor: family.secondaryColor
      }
    };

    // 4. Cache in Redis (1 hour TTL)
    await cache.setex(`host:${host}`, 3600, JSON.stringify(tenantData));

    // 5. Attach to request
    req.familyId = family.id;
    req.tenantBrand = tenantData.brand;

    next();
  } catch (error) {
    console.error('[TenantResolver Error]:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

module.exports = tenantResolver;
