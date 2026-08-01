const express = require('express');
const router = express.Router();
const domainController = require('../controllers/domain.controller');
const devopsController = require('../controllers/devops.controller');
// const { protect, authorize } = require('../middleware/auth'); // Assuming existing auth

// We will mock the auth middleware for the sake of integration without breaking
const mockAuth = (req, res, next) => {
  req.user = { id: 'SYSTEM' }; // Default mock user
  next();
};

/**
 * @swagger
 * /api/v1/domains/family-owned:
 *   post:
 *     summary: Register an existing domain (Family Owned workflow)
 *     tags: [Domains]
 */
router.post('/family-owned', mockAuth, domainController.createFamilyOwnedDomain);

/**
 * @swagger
 * /api/v1/domains/familyhub-managed:
 *   post:
 *     summary: Create a domain purchase request (FamilyHub Managed workflow)
 *     tags: [Domains]
 */
router.post('/familyhub-managed', mockAuth, domainController.createFamilyHubManagedDomain);


// ==========================================
// DEVOPS ROUTES (Should be restricted)
// ==========================================

router.put('/devops/purchase', mockAuth, devopsController.markPurchased);
router.put('/devops/send-dns', mockAuth, devopsController.sendDnsInstructions);
router.put('/devops/mark-dns-configured', mockAuth, devopsController.markDnsConfigured);
router.put('/devops/generate-ssl', mockAuth, devopsController.generateSsl);
router.put('/devops/mark-live', mockAuth, devopsController.markLive);

module.exports = router;
