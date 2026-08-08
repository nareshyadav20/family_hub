const familyService = require('../services/familyService');
const domainService = require('../services/domainService');
const domainPurchaseService = require('../services/domainPurchaseService');
const workflowService = require('../services/workflowService');
const eventService = require('../services/eventService');

class DomainController {
  // POST /families
  async createFamily(req, res) {
    try {
      const data = req.validatedData || req.body;
      const result = await familyService.createFamilyWorkflow(req, data);
      return res.status(201).json({
        success: true,
        familyId: result.family?.id,
        domainId: result.domain?.id,
        family: result.family,
        domain: result.domain,
        message: 'Family and Custom Domain onboarding created successfully',
        data: result,
        errors: null
      });
    } catch (err) {
      console.error('[DomainController] createFamily error:', err);
      require('fs').writeFileSync('domain_error.txt', JSON.stringify({ message: err.message, stack: err.stack }));
      const isConflict = err.message?.includes('already exists') || err.message?.includes('already registered');
      const statusCode = isConflict ? 409 : 400;
      return res.status(statusCode).json({
        success: false,
        message: err.message || 'Failed to create family workflow',
        data: null,
        errors: [err.message]
      });
    }
  }

  // POST /domains
  async createDomain(req, res) {
    try {
      const { familyId, rootDomain, ownershipType, registrar, dnsProvider, verificationMethod } = req.validatedData || req.body;
      const result = await familyService.createFamilyWorkflow(req, {
        familyName: 'Default Family',
        admin: { firstName: 'Admin', lastName: 'User', email: `admin-${Date.now()}@domain.com`, password: 'Password123!' },
        domain: { rootDomain, ownershipType, registrar, dnsProvider, verificationMethod }
      });
      return res.status(201).json({
        success: true,
        status: "QUEUED",
        code: "PROVISIONING_QUEUED",
        message: "Provisioning started.",
        data: result.domain
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        status: "FAILED",
        code: "CREATION_FAILED",
        message: err.message,
        data: null
      });
    }
  }

  // GET /domains
  async getDomains(req, res) {
    try {
      const familyId = req.query.familyId;
      if (familyId) {
        const domains = await domainService.getDomainsByFamily(familyId);
        return res.json({ success: true, message: 'Domains fetched', data: domains, errors: null });
      }
      return res.status(400).json({ success: false, message: 'familyId query parameter required', data: null, errors: ['Missing familyId'] });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message, data: null, errors: [err.message] });
    }
  }

  // GET /domains/:id
  async getDomainById(req, res) {
    try {
      const domain = await domainService.getDomainDetails(req.params.id);
      return res.json({ success: true, message: 'Domain details retrieved', data: domain, errors: null });
    } catch (err) {
      return res.status(404).json({ success: false, message: err.message, data: null, errors: [err.message] });
    }
  }

  // GET /domains/status/:id
  async getDomainStatus(req, res) {
    try {
      const domain = await domainService.getDomainDetails(req.params.id);
      return res.json({
        success: true,
        message: 'Domain status retrieved',
        data: {
          id: domain.id,
          domainName: domain.domainName,
          domainStatus: domain.domainStatus,
          verificationStatus: domain.verificationStatus,
          sslStatus: domain.sslStatus,
          dnsVerified: domain.dnsVerified,
          connectedAt: domain.connectedAt
        },
        errors: null
      });
    } catch (err) {
      return res.status(404).json({ success: false, message: err.message, data: null, errors: [err.message] });
    }
  }

  // POST /domains/search
  async searchDomain(req, res) {
    try {
      const { domainName } = req.validatedData || req.body;
      const result = await domainPurchaseService.searchDomainAvailability(domainName);
      return res.json({ success: true, message: 'Search result retrieved', data: result, errors: null });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message, data: null, errors: [err.message] });
    }
  }

  // POST /domains/purchase
  async purchaseDomain(req, res) {
    try {
      const result = await domainService.purchaseDomainWorkflow(req, req.validatedData || req.body);
      return res.status(201).json({ success: true, message: 'Domain purchased and configured', data: result, errors: null });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message, data: null, errors: [err.message] });
    }
  }

  // POST /domains/verify
  async verifyDomain(req, res) {
    try {
      const { domainId } = req.validatedData || req.body;
      const result = await domainService.verifyDomain(domainId, req);
      return res.json({ success: true, message: 'DNS Verification process executed', data: result, errors: null });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message, data: null, errors: [err.message] });
    }
  }

  // POST /domains/recheck
  async recheckDomain(req, res) {
    return this.verifyDomain(req, res);
  }

  // POST /domains/generate-token
  async generateToken(req, res) {
    try {
      const { domainId } = req.body;
      const result = await domainService.generateToken(domainId, req);
      return res.json({ success: true, message: 'Verification token generated', data: result, errors: null });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message, data: null, errors: [err.message] });
    }
  }

  // POST /domains/generate-dns-record
  async generateDnsRecord(req, res) {
    try {
      const { domainId, verificationMethod } = req.body;
      const result = await domainService.generateDnsRecord(domainId, verificationMethod);
      return res.json({ success: true, message: 'DNS Record spec generated', data: result, errors: null });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message, data: null, errors: [err.message] });
    }
  }

  // POST /domains/provision-ssl
  async provisionSsl(req, res) {
    try {
      const { domainId } = req.validatedData || req.body;
      const result = await domainService.provisionSsl(domainId, req);
      return res.json({ success: true, message: 'SSL provisioning triggered', data: result, errors: null });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message, data: null, errors: [err.message] });
    }
  }

  // POST /domains/activate
  async activateDomain(req, res) {
    try {
      const { domainId } = req.validatedData || req.body;
      const result = await domainService.activateWebsite(domainId, req);
      return res.json({ success: true, message: 'Website activated', data: result, errors: null });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message, data: null, errors: [err.message] });
    }
  }

  // GET /workflow/:id
  async getWorkflow(req, res) {
    try {
      const workflow = await workflowService.getWorkflow(req.params.id);
      return res.json({ success: true, message: 'Workflow history retrieved', data: workflow, errors: null });
    } catch (err) {
      return res.status(404).json({ success: false, message: err.message, data: null, errors: [err.message] });
    }
  }

  // GET /events/:id
  async getEvents(req, res) {
    try {
      const events = await eventService.getDomainEvents(req.params.id);
      return res.json({ success: true, message: 'Domain events retrieved', data: events, errors: null });
    } catch (err) {
      return res.status(404).json({ success: false, message: err.message, data: null, errors: [err.message] });
    }
  }
}

module.exports = new DomainController();
