const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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

    let family = await prisma.family.findUnique({
      where: {
        customDomain: hostname,
      },
    });

    if (!family && (hostname === 'localhost' || hostname === '127.0.0.1')) {
      // Developer fallback: default to battula.in on localhost
      family = await prisma.family.findUnique({
        where: { customDomain: 'battula.in' }
      });
      // If for some reason battula.in isn't found, fallback to first
      if (!family) {
        family = await prisma.family.findFirst();
      }
    }

    if (!family) {
      console.log('Resolved Family: NOT FOUND');
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
