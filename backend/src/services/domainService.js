const crypto = require('crypto');
const prisma = require('../../prismaClient');
const domainRepository = require('../repositories/domainRepository');
const dnsVerificationService = require('./dnsVerificationService');
const domainPurchaseService = require('./domainPurchaseService');
const sslService = require('./sslService');
const nginxService = require('./nginxService');
const workflowService = require('./workflowService');
const eventService = require('./eventService');
const { sendInstantEmail } = require('../../services/emailService');
const redisClient = require('../../redisClient');

class DomainService {
  generateVerificationToken() {
    return `fh_${crypto.randomBytes(8).toString('hex')}`;
  }

  async getDomainDetails(domainId) {
    const domain = await domainRepository.findDomainById(domainId);
    if (!domain) throw new Error('Domain not found');
    return domain;
  }

  async getDomainsByFamily(familyId) {
    return domainRepository.findDomainsByFamilyId(familyId);
  }

  async generateToken(domainId, req) {
    const domain = await domainRepository.findDomainById(domainId);
    if (!domain) throw new Error('Domain not found');

    const newToken = this.generateVerificationToken();
    const io = req.app ? req.app.get('socketio') : null;

    const updated = await prisma.$transaction(async (tx) => {
      const d = await domainRepository.updateDomainStatus(tx, domainId, {
        verificationToken: newToken,
        verificationStatus: 'PENDING',
        dnsInstructions: `Create a TXT record for '_familyhub-challenge.${domain.domainName}' with value '${newToken}', or a CNAME pointing to 'verify.familyhub.ai'.`
      });

      await eventService.logEvent(tx, io, {
        domainId,
        familyId: domain.familyId,
        eventType: 'VERIFICATION_GENERATED',
        message: `New verification token generated: ${newToken}`,
        triggeredBy: req.user ? req.user.userId : 'SYSTEM_USER'
      });

      return d;
    });

    return updated;
  }

  async generateDnsRecord(domainId, verificationMethod = 'TXT') {
    const domain = await domainRepository.findDomainById(domainId);
    if (!domain) throw new Error('Domain not found');

    const token = domain.verificationToken || this.generateVerificationToken();
    const recordName = verificationMethod === 'CNAME' ? domain.domainName : `_familyhub-challenge.${domain.domainName}`;
    const expectedValue = verificationMethod === 'CNAME' ? 'verify.familyhub.ai' : token;

    return {
      domainId: domain.id,
      domainName: domain.domainName,
      verificationMethod,
      recordType: verificationMethod,
      recordName,
      expectedValue,
      ttl: 300
    };
  }

  async verifyDomain(domainId, req) {
    const domain = await domainRepository.findDomainById(domainId);
    if (!domain) throw new Error('Domain not found');

    const io = req.app ? req.app.get('socketio') : null;
    const token = domain.verificationToken || 'fh_default';

    await eventService.logEvent(prisma, io, {
      domainId,
      familyId: domain.familyId,
      eventType: 'VERIFICATION_STARTED',
      message: `Starting DNS verification check for ${domain.domainName}`,
      triggeredBy: req.user ? req.user.userId : 'SYSTEM_WORKER'
    });

    const check = await dnsVerificationService.verifyDomainDns(domain.domainName, token, domain.verificationMethod);

    if (check.verified) {
      await prisma.$transaction(async (tx) => {
        await domainRepository.updateDomainStatus(tx, domainId, {
          dnsVerified: true,
          verificationStatus: 'VERIFIED',
          domainStatus: 'DNS_CONFIGURED',
          verifiedAt: new Date()
        });

        await workflowService.advanceStep(tx, io, {
          domainId,
          familyId: domain.familyId,
          step: 'DNS_VERIFICATION',
          status: 'COMPLETED',
          remarks: `DNS verified successfully via ${check.recordType} record lookup`
        });

        await eventService.logEvent(tx, io, {
          domainId,
          familyId: domain.familyId,
          eventType: 'VERIFICATION_SUCCESS',
          message: `DNS ownership verified for ${domain.domainName}`,
          triggeredBy: req.user ? req.user.userId : 'SYSTEM_WORKER'
        });
      });

      // Automatically trigger SSL provisioning
      return this.provisionSsl(domainId, req);
    } else {
      await eventService.logEvent(prisma, io, {
        domainId,
        familyId: domain.familyId,
        eventType: 'VERIFICATION_FAILED',
        severity: 'WARNING',
        message: `DNS check pending propagation for ${domain.domainName}. Reason: ${check.error || 'Record not matched'}`,
        triggeredBy: req.user ? req.user.userId : 'SYSTEM_WORKER'
      });

      return {
        verified: false,
        domainStatus: domain.domainStatus,
        message: 'DNS records not yet verified. Please ensure TXT or CNAME record is configured correctly and allow time for DNS propagation.'
      };
    }
  }

  async provisionSsl(domainId, req) {
    const domain = await domainRepository.findDomainById(domainId);
    if (!domain) throw new Error('Domain not found');

    const io = req.app ? req.app.get('socketio') : null;

    try {
      await workflowService.advanceStep(prisma, io, {
        domainId,
        familyId: domain.familyId,
        step: 'SSL_GENERATION',
        status: 'IN_PROGRESS',
        remarks: 'Generating Let\'s Encrypt SSL certificate'
      });

      const sslResult = await sslService.provisionSslCertificate(domain.domainName);

      const updated = await prisma.$transaction(async (tx) => {
        const d = await domainRepository.updateDomainStatus(tx, domainId, {
          sslStatus: 'ACTIVE',
          sslIssuedAt: sslResult.sslIssuedAt,
          sslExpiresAt: sslResult.sslExpiresAt,
          sslRenewalDate: sslResult.sslRenewalDate,
          domainStatus: 'SSL_ENABLED'
        });

        await workflowService.advanceStep(tx, io, {
          domainId,
          familyId: domain.familyId,
          step: 'SSL_GENERATION',
          status: 'COMPLETED',
          remarks: 'SSL certificate issued successfully'
        });

        await eventService.logEvent(tx, io, {
          domainId,
          familyId: domain.familyId,
          eventType: 'SSL_GENERATED',
          message: `SSL certificate issued by ${sslResult.issuer}. Expires: ${sslResult.sslExpiresAt.toISOString()}`,
          triggeredBy: req.user ? req.user.userId : 'SYSTEM_WORKER'
        });

        return d;
      });

      // Automatically trigger Website Activation
      return this.activateWebsite(domainId, req);
    } catch (err) {
      await eventService.logEvent(prisma, io, {
        domainId,
        familyId: domain.familyId,
        eventType: 'SSL_FAILED',
        severity: 'ERROR',
        message: `SSL provisioning failed for ${domain.domainName}: ${err.message}`,
        triggeredBy: req.user ? req.user.userId : 'SYSTEM_WORKER'
      });
      throw err;
    }
  }

  async activateWebsite(domainId, req) {
    const domain = await domainRepository.findDomainById(domainId);
    if (!domain) throw new Error('Domain not found');

    const io = req.app ? req.app.get('socketio') : null;

    await workflowService.advanceStep(prisma, io, {
      domainId,
      familyId: domain.familyId,
      step: 'TENANT_MAPPING',
      status: 'IN_PROGRESS',
      remarks: 'Updating reverse proxy routing table'
    });

    const nginxResult = await nginxService.applyTenantMapping(domain.domainName, domain.familyId);

    const updated = await prisma.$transaction(async (tx) => {
      const d = await domainRepository.updateDomainStatus(tx, domainId, {
        domainStatus: 'LIVE',
        connectedAt: new Date()
      });

      await tx.family.update({
        where: { id: domain.familyId },
        data: { status: 'Active' }
      });

      await workflowService.advanceStep(tx, io, {
        domainId,
        familyId: domain.familyId,
        step: 'TENANT_MAPPING',
        status: 'COMPLETED',
        remarks: 'Tenant mapping applied to reverse proxy'
      });

      await workflowService.advanceStep(tx, io, {
        domainId,
        familyId: domain.familyId,
        step: 'WEBSITE_LIVE',
        status: 'COMPLETED',
        remarks: `Website is live at https://${domain.domainName}`
      });

      await eventService.logEvent(tx, io, {
        domainId,
        familyId: domain.familyId,
        eventType: 'WEBSITE_ACTIVATED',
        message: `Website is now LIVE at https://${domain.domainName}`,
        triggeredBy: req.user ? req.user.userId : 'SYSTEM_WORKER'
      });

      return d;
    });

    // Invalidate Redis Cache
    try {
      await redisClient.del(`tenant:${domain.domainName}`);
      console.log(`[Domain Service] Cleared Redis cache for tenant:${domain.domainName}`);
    } catch (err) {
      console.error(`[Domain Service] Failed to clear Redis cache for tenant:${domain.domainName}`, err);
    }

    // Notify Super Admins
    try {
      const superAdmins = await prisma.user.findMany({ where: { role: 'SUPER_ADMIN' } });
      for (const sa of superAdmins) {
        await sendInstantEmail(
          sa.email,
          `FamilyHub Website Live: ${domain.domainName}`,
          `<p>Domain <strong>${domain.domainName}</strong> has completed full onboarding and is now LIVE!</p>`
        );
      }
    } catch (err) {
      console.error('Failed sending activation alert email:', err);
    }

    return {
      success: true,
      domain: updated,
      message: `Domain ${domain.domainName} is now live!`
    };
  }

  async purchaseDomainWorkflow(req, { familyId, domainName, registrationYears, contacts }) {
    const cleanDomain = domainName.replace(/^(https?:\/\/)?(www\.)?/, '').trim().toLowerCase();
    const io = req.app ? req.app.get('socketio') : null;

    const existingDomain = await domainRepository.findDomainByName(cleanDomain);
    if (existingDomain) throw new Error(`Domain ${cleanDomain} is already registered`);

    const purchase = await domainPurchaseService.purchaseDomain(cleanDomain, registrationYears, contacts);

    const domain = await prisma.$transaction(async (tx) => {
      const createdDomain = await domainRepository.createDomain(tx, {
        familyId,
        domainName: cleanDomain,
        ownership: 'MANAGED_BY_FAMILYHUB',
        registrar: purchase.registrar,
        purchasePrice: purchase.purchasePrice,
        renewalPrice: purchase.renewalPrice,
        expiryDate: purchase.expiryDate,
        purchaseDate: purchase.purchaseDate,
        purchaseStatus: 'PURCHASED',
        renewalStatus: 'ACTIVE',
        registrationYears,
        autoRenew: true,
        verificationStatus: 'VERIFIED',
        dnsVerified: true,
        domainStatus: 'PURCHASED',
        createdBy: req.user ? req.user.userId : 'SUPER_ADMIN'
      });

      await workflowService.initWorkflow(tx, createdDomain.id, false);

      await workflowService.advanceStep(tx, io, {
        domainId: createdDomain.id,
        familyId,
        step: 'SEARCHING_DOMAIN',
        status: 'COMPLETED',
        remarks: 'Domain is available'
      });

      await workflowService.advanceStep(tx, io, {
        domainId: createdDomain.id,
        familyId,
        step: 'DOMAIN_PURCHASED',
        status: 'COMPLETED',
        remarks: `Purchased domain for ${registrationYears} year(s). Ref: ${purchase.purchaseReference}`
      });

      await eventService.logEvent(tx, io, {
        domainId: createdDomain.id,
        familyId,
        eventType: 'DOMAIN_PURCHASED',
        message: `Purchased domain ${cleanDomain} via ${purchase.registrar}`,
        triggeredBy: req.user ? req.user.userId : 'SUPER_ADMIN'
      });

      return createdDomain;
    });

    // Auto trigger SSL & Website Activation
    await this.provisionSsl(domain.id, req);

    return domainRepository.findDomainById(domain.id);
  }
}

module.exports = new DomainService();
