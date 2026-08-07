const tenantResolver = require('../src/services/tenantResolver');

const resolveTenant = async (req, res, next) => {
  try {
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

    const tenant = await tenantResolver.resolve(hostname);

    const MAIN_DOMAINS = [
      "careertransform.in",
      "www.careertransform.in",
      "superadmin.careertransform.in",
      "api.careertransform.in",
      "localhost",
      "127.0.0.1",
      "familyhub.com",
      "brevolt.in",
      "www.brevolt.in",
      "13.204.75.91"
    ];

    if (!tenant) {
      const isMainDomain = MAIN_DOMAINS.includes(hostname) || hostname.includes('localhost:');
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
      return res.status(404).json({ success: false, message: 'Family Not Found' });
    }

    req.tenant = tenant;
    req.tenantId = tenant.id;
    req.domain = tenant.domainRecord;

    // Backward compatibility
    req.family = tenant;
    req.familyId = tenant.id;
    req.familyName = tenant.name;

    next();
  } catch (error) {
    console.error('Error in resolveTenant middleware:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = resolveTenant;
