const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const domainController = require('../controllers/domain.controller');
const devopsController = require('../controllers/devops.controller');
// const { protect, authorize } = require('../middleware/auth'); // Assuming existing auth

// Real JWT Auth Middleware for Super Admin
const protectSuperAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'Unauthorized: No token provided' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ success: false, message: 'Forbidden: Super Admin only' });
    }
    req.user = decoded;
    next();
  } catch (e) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Invalid token' });
  }
};

/**
 * @swagger
 * /api/v1/domains/family-owned:
 *   post:
 *     summary: Register an existing domain (Family Owned workflow)
 *     tags: [Domains]
 */
router.post('/family-owned', protectSuperAdmin, domainController.createFamilyOwnedDomain);

/**
 * @swagger
 * /api/v1/domains/familyhub-managed:
 *   post:
 *     summary: Create a domain purchase request (FamilyHub Managed workflow)
 *     tags: [Domains]
 */
router.post('/familyhub-managed', protectSuperAdmin, domainController.createFamilyHubManagedDomain);


// ==========================================
// DEVOPS ROUTES (Should be restricted)
// ==========================================

router.put('/devops/purchase', protectSuperAdmin, devopsController.markPurchased);
router.put('/devops/send-dns', protectSuperAdmin, devopsController.sendDnsInstructions);
router.put('/devops/gen-verify-email', protectSuperAdmin, devopsController.generateVerifyEmail);
router.put('/devops/mark-dns-configured', protectSuperAdmin, devopsController.markDnsConfigured);
router.put('/devops/generate-ssl', protectSuperAdmin, devopsController.generateSsl);
router.put('/devops/mark-live', protectSuperAdmin, devopsController.markLive);

module.exports = router;
