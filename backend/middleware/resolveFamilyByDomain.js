const prisma = require('../prismaClient');
const redisClient = require('../redisClient');

const resolveFamilyByDomain = async (req, res, next) => {
  try {
    // Determine hostname from explicitly passed query param (for local testing), Origin, Referer, or Host (in that order)
    let hostname = '';
    const explicitDomain = req.query.domain;
    const origin = req.headers.origin;
    const referer = req.headers.referer;

    if (explicitDomain) {
      hostname = explicitDomain;
    } else if (origin) {
      hostname = new URL(origin).hostname;
    } else if (referer) {
      hostname = new URL(referer).hostname;
    } else if (req.headers.host) {
      hostname = req.headers.host.split(':')[0];
    } else {
      return res.status(400).json({ error: 'Cannot determine hostname' });
    }

    // Normalize hostname by removing www.
    hostname = hostname.replace(/^www\./, '');

    console.log('\n[MULTI-TENANT DEBUG]');
    console.log('Incoming Origin:', origin);
    console.log('Incoming Referer:', referer);
    console.log('Incoming Host:', req.headers.host);
    console.log('Resolved Hostname:', hostname);

    let family = null;
    let cachedFamilyId = null;

    try {
      cachedFamilyId = await redisClient.get(`tenant:${hostname}`);
    } catch (e) {
      console.warn('[Redis] Cache read failed', e);
    }

    if (cachedFamilyId) {
       family = await prisma.family.findUnique({ where: { id: cachedFamilyId } });
       if (family && family.status !== 'Active') {
         family = null; // Don't serve pending/inactive families from cache
       }
    }

    if (!family) {
      family = await prisma.family.findUnique({
        where: {
          customDomain: hostname,
        },
      });
      
      if (family && family.status !== 'Active') {
        family = null; // Enforce Active status for customDomain mapping
      }

      if (!family) {
         const familyDomain = await prisma.familyDomain.findUnique({
           where: { domainName: hostname },
           include: { family: true }
         });
         if (familyDomain && familyDomain.domainStatus === 'LIVE') {
            family = familyDomain.family;
         }
      }

      if (family && family.status === 'Active') {
         try {
           await redisClient.set(`tenant:${hostname}`, family.id, {
              EX: 3600 // cache for 1 hour
           });
         } catch(e) {
            console.warn('[Redis] Cache write failed', e);
         }
      } else if (family) {
        // If it was found via FamilyDomain but the family itself isn't active
        if (family.status !== 'Active') {
          family = null;
        }
      }
    }


    if (!family) {
      console.log('Resolved Family: NOT FOUND');
      const isMainDomain = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === 'familyhub.com' || hostname.includes('localhost:');
      if (isMainDomain) {
        return res.status(200).json({
          success: true,
          family: null,
          feed: [],
          statistics: null,
          gallery: [],
          events: [],
          announcements: [],
          videos: [],
          livestreams: [],
          members: []
        });
      }
      return res.status(404).json({ error: 'Family Not Found' });
    }

    console.log('Resolved Family:', family.name);
    console.log('Resolved FamilyId:', family.id);
    console.log('----------------------\n');

    // Attach family info to request
    req.family = family;
    req.familyId = family.id;
    req.familyName = family.name;

    next();
  } catch (error) {
    console.error('Error in resolveFamilyByDomain middleware:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = resolveFamilyByDomain;
