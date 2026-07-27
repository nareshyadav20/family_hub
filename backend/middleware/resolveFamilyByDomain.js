const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const resolveFamilyByDomain = async (req, res, next) => {
  try {
    const hostHeader = req.headers.host;
    if (!hostHeader) {
      return res.status(400).json({ error: 'Host header missing' });
    }

    // Normalize hostname by removing www. and any port number
    let hostname = hostHeader.replace(/^www\./, '').split(':')[0];

    const family = await prisma.family.findUnique({
      where: {
        customDomain: hostname,
      },
    });

    if (!family) {
      return res.status(404).json({ error: 'Family Not Found' });
    }

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
