const express = require('express');
const router = express.Router();
const domainController = require('../controllers/domainController');
const { validateRequest } = require('../validators/domainValidator');
const {
  CreateFamilySchema,
  CreateDomainSchema,
  SearchDomainSchema,
  PurchaseDomainSchema,
  VerifyDomainSchema,
  RecheckDomainSchema,
  ProvisionSslSchema,
  ActivateDomainSchema
} = require('../dtos/domainDto');

// Middleware to authenticate JWT or SuperAdmin if headers provided
function optionalAuth(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (token) {
    try {
      const jwt = require('jsonwebtoken');
      req.user = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      // Token error ignored for optional auth
    }
  }
  next();
}

router.use(optionalAuth);

// Family & Domain Management APIs
router.post('/families', validateRequest(CreateFamilySchema), (req, res) => domainController.createFamily(req, res));
router.post('/domains', validateRequest(CreateDomainSchema), (req, res) => domainController.createDomain(req, res));
router.get('/domains', (req, res) => domainController.getDomains(req, res));
router.get('/domains/:id', (req, res) => domainController.getDomainById(req, res));
router.get('/domains/status/:id', (req, res) => domainController.getDomainStatus(req, res));

router.post('/domains/search', validateRequest(SearchDomainSchema), (req, res) => domainController.searchDomain(req, res));
router.post('/domains/purchase', validateRequest(PurchaseDomainSchema), (req, res) => domainController.purchaseDomain(req, res));
router.post('/domains/verify', validateRequest(VerifyDomainSchema), (req, res) => domainController.verifyDomain(req, res));
router.post('/domains/recheck', validateRequest(RecheckDomainSchema), (req, res) => domainController.recheckDomain(req, res));

router.post('/domains/generate-token', (req, res) => domainController.generateToken(req, res));
router.post('/domains/generate-dns-record', (req, res) => domainController.generateDnsRecord(req, res));
router.post('/domains/provision-ssl', validateRequest(ProvisionSslSchema), (req, res) => domainController.provisionSsl(req, res));
router.post('/domains/ssl', validateRequest(ProvisionSslSchema), (req, res) => domainController.provisionSsl(req, res));
router.post('/domains/activate', validateRequest(ActivateDomainSchema), (req, res) => domainController.activateDomain(req, res));

router.get('/workflow/:id', (req, res) => domainController.getWorkflow(req, res));
router.get('/events/:id', (req, res) => domainController.getEvents(req, res));

// SuperAdmin UI Compatibility Endpoints
router.get('/history/:familyId', async (req, res) => {
  try {
    const prisma = require('../../prismaClient');
    const domains = await prisma.familyDomain.findMany({
      where: { familyId: req.params.familyId },
      include: {
        histories: { orderBy: { createdAt: 'asc' } },
        workflows: { orderBy: { createdAt: 'asc' } },
        events: { orderBy: { createdAt: 'desc' } }
      }
    });
    res.json({ success: true, data: domains });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/update-status', async (req, res) => {
  const { domainId, status } = req.body;
  try {
    const domainService = require('../services/domainService');
    const prisma = require('../../prismaClient');
    const updated = await prisma.familyDomain.update({
      where: { id: domainId },
      data: { domainStatus: status }
    });
    res.json({ success: true, data: updated, message: `Status updated to ${status}` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/delete/:domainId', async (req, res) => {
  try {
    const prisma = require('../../prismaClient');
    await prisma.familyDomain.delete({ where: { id: req.params.domainId } });
    res.json({ success: true, message: 'Domain deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
