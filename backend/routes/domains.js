const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const dns = require('dns').promises;
const { sendInstantEmail } = require('../services/emailService');

// Middleware to protect superadmin routes
function authenticateSuperAdmin(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied' });
  try {
    const jwt = require('jsonwebtoken');
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    if (req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Super Admin access required' });
    }
    next();
  } catch (err) {
    res.status(403).json({ error: 'Invalid token' });
  }
}

router.use(authenticateSuperAdmin);

// Utility to validate domain
const isValidDomain = (domain) => {
  const domainRegex = /^(?!:\/\/)([a-zA-Z0-9-_]+\.)*[a-zA-Z0-9][a-zA-Z0-9-_]+\.[a-zA-Z]{2,11}?$/;
  return domainRegex.test(domain) && !domain.includes('localhost') && !/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(domain);
};

// SAVE DOMAIN
router.post('/save', async (req, res) => {
  const { familyId, domainName, ownership } = req.body;
  console.log('[Domain Save] req.user:', req.user);
  console.log('[Domain Save] req.body:', req.body);

  if (!familyId || !domainName || !ownership) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  const cleanDomain = domainName.replace(/^(https?:\/\/)?(www\.)?/, '').trim().toLowerCase();

  if (!isValidDomain(cleanDomain)) {
    return res.status(400).json({ success: false, message: 'Invalid domain format' });
  }

  try {
    const existing = await prisma.familyDomain.findUnique({
      where: { domainName: cleanDomain }
    });

    if (existing) {
      if (existing.familyId === familyId) {
        return res.status(400).json({ success: false, message: 'Domain already saved for this family' });
      }
      return res.status(400).json({ success: false, message: 'This domain is already mapped to another family' });
    }

    // If they have multiple domains, we don't strictly need to disconnect the old ones.
    // They can all point to the same backend.

    const dnsInstructions = ownership === 'FAMILY_OWNED' 
      ? `The family already owns this domain. Our technical team will provide DNS instructions to connect this domain to FamilyHub.` 
      : `FamilyHub technical team will purchase and configure this domain.`;

    const familyDomain = await prisma.$transaction(async (tx) => {
      const fd = await tx.familyDomain.create({
        data: {
          familyId,
          domainName: cleanDomain,
          ownership,
          domainStatus: 'PENDING_SETUP',
          dnsInstructions,
          createdBy: req.user.userId
        }
      });
      await tx.domainHistory.create({
        data: {
          familyDomainId: fd.id,
          status: 'PENDING_SETUP',
          updatedBy: req.user.userId,
          notes: 'Domain mapping created.'
        }
      });
      return fd;
    });

    res.json({ success: true, data: familyDomain });
  } catch (error) {
    console.error('Error saving domain:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET DOMAIN STATUS
router.get('/status/:familyId', async (req, res) => {
  try {
    const domains = await prisma.familyDomain.findMany({
      where: { familyId: req.params.familyId },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: domains });
  } catch (error) {
    console.error('Error fetching domain status:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// UPDATE DOMAIN STATUS (Manual Dropdown)
router.put('/update-status', async (req, res) => {
  const { domainId, status } = req.body;
  
  if (!domainId || !status) {
    return res.status(400).json({ success: false, message: 'Domain ID and Status are required' });
  }

  try {
    const familyDomain = await prisma.familyDomain.findUnique({
      where: { id: domainId }
    });

    if (!familyDomain) {
      return res.status(404).json({ success: false, message: 'Domain not found' });
    }

    let dnsVerified = familyDomain.dnsVerified;
    let sslStatus = familyDomain.sslStatus;

    if (status === 'DNS_CONFIGURED' || status === 'SSL_ENABLED' || status === 'LIVE') {
      dnsVerified = true;
    }
    if (status === 'SSL_ENABLED' || status === 'LIVE') {
      sslStatus = 'ACTIVE';
    }

    const updated = await prisma.$transaction(async (tx) => {
      const fd = await tx.familyDomain.update({
        where: { id: domainId },
        data: {
          domainStatus: status,
          dnsVerified,
          sslStatus
        }
      });
      await tx.domainHistory.create({
        data: {
          familyDomainId: fd.id,
          status: status,
          updatedBy: req.user.userId,
          notes: req.body.notes || `Domain status manually updated to ${status}.`
        }
      });
      return fd;
    });

    if (status === 'LIVE' && familyDomain.domainStatus !== 'LIVE') {
      // Notify Super Admins
      try {
         const superAdmins = await prisma.user.findMany({ where: { role: 'SUPER_ADMIN' } });
         for (const sa of superAdmins) {
            await sendInstantEmail(
              sa.email,
              `Domain Setup Completed: ${updated.domainName}`,
              `<p>The domain ${updated.domainName} has been successfully configured and is now live.</p>`
            );
         }
      } catch (err) {
         console.error('Failed to send notification email', err);
      }
    }

    res.json({ success: true, data: updated, message: 'Status updated successfully' });
  } catch (error) {
    console.error('Error updating domain status:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET DOMAIN HISTORY
router.get('/history/:familyId', async (req, res) => {
  try {
    const domains = await prisma.familyDomain.findMany({
      where: { familyId: req.params.familyId },
      include: {
        histories: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });
    res.json({ success: true, data: domains });
  } catch (error) {
    console.error('Error fetching domain history:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// DELETE DOMAIN
router.delete('/delete/:domainId', async (req, res) => {
  const { domainId } = req.params;
  try {
    await prisma.familyDomain.delete({
      where: { id: domainId }
    });
    res.json({ success: true, message: 'Domain deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;
