const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createAuditLog(req, action, oldStatus, newStatus, domainId) {
  const details = JSON.stringify({
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    domainId,
    oldStatus,
    newStatus
  });

  await prisma.auditLog.create({
    data: {
      user: req.user?.id || 'DEVOPS',
      action,
      module: 'DEVOPS_DOMAIN',
      details
    }
  });
}

class DevOpsController {
  
  /**
   * PUT /api/v1/domains/devops/purchase
   */
  async markPurchased(req, res) {
    try {
      const { domainId, purchasePrice, registrar } = req.body;
      
      console.log(`[DevOps] markPurchased request received for domainId: ${domainId}`);

      if (!domainId) {
        return res.status(400).json({ success: false, message: 'domainId is required' });
      }

      const existingDomain = await prisma.familyDomain.findUnique({ where: { id: domainId } });
      if (!existingDomain) {
        return res.status(404).json({ success: false, message: 'Domain not found' });
      }

      if (existingDomain.domainStatus !== 'PENDING_SETUP') {
        return res.status(400).json({ success: false, message: `Invalid state transition. Domain is currently ${existingDomain.domainStatus}` });
      }

      const domain = await prisma.familyDomain.update({
        where: { id: domainId },
        data: {
          purchaseStatus: 'PURCHASED',
          purchasePrice: purchasePrice ? parseFloat(purchasePrice) : null,
          registrar,
          purchaseDate: new Date(),
          domainStatus: 'DNS_CONFIGURED' // typically moves to next step
        }
      });

      await prisma.domainEvent.create({
        data: {
          domainId,
          eventType: 'DOMAIN_PURCHASED',
          message: `Domain purchased successfully via ${registrar || 'DevOps'}.`,
          triggeredBy: req.user?.id || 'DEVOPS'
        }
      });

      await createAuditLog(req, 'MARK_PURCHASED', existingDomain.domainStatus, domain.domainStatus, domainId);

      // Update DevOps Ticket
      await prisma.devOpsTicket.updateMany({
        where: { domainId, queueType: 'Purchase' },
        data: { status: 'Completed', completedAt: new Date() }
      });
      
      // Create next ticket for DNS
      await prisma.devOpsTicket.create({
        data: {
          domainId,
          queueType: 'DNS',
          status: 'Pending',
          priority: 'High'
        }
      });

      console.log(`[DevOps] Successfully marked domainId ${domainId} as purchased.`);
      return res.status(200).json({ success: true, data: domain });
    } catch (error) {
      console.error(`[DevOps] Error in markPurchased:`, error);
      return res.status(500).json({ 
        success: false, 
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
      });
    }
  }

  /**
   * PUT /api/v1/domains/devops/send-dns
   */
  async sendDnsInstructions(req, res) {
    try {
      const { domainId } = req.body;
      
      console.log(`[DevOps] sendDnsInstructions request received for domainId: ${domainId}`);

      if (!domainId) {
        return res.status(400).json({ success: false, message: 'domainId is required' });
      }

      const existingDomain = await prisma.familyDomain.findUnique({ where: { id: domainId } });
      if (!existingDomain) {
        return res.status(404).json({ success: false, message: 'Domain not found' });
      }

      if (existingDomain.domainStatus !== 'PENDING_SETUP') {
        return res.status(400).json({ success: false, message: `Invalid state transition. Domain is currently ${existingDomain.domainStatus}` });
      }

      await prisma.domainEvent.create({
        data: {
          domainId,
          eventType: 'VERIFICATION_GENERATED',
          message: 'DNS Instructions sent to family.',
          triggeredBy: req.user?.id || 'DEVOPS'
        }
      });

      await createAuditLog(req, 'SEND_DNS_INSTRUCTIONS', existingDomain.domainStatus, existingDomain.domainStatus, domainId);

      console.log(`[DevOps] Successfully sent DNS instructions for domainId ${domainId}.`);
      return res.status(200).json({ success: true, message: 'Instructions sent.' });
    } catch (error) {
      console.error(`[DevOps] Error in sendDnsInstructions:`, error);
      return res.status(500).json({ 
        success: false, 
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
      });
    }
  }

  /**
   * PUT /api/v1/domains/devops/gen-verify-email
   */
  async generateVerifyEmail(req, res) {
    try {
      const { domainId } = req.body;
      
      console.log(`[DevOps] generateVerifyEmail request received for domainId: ${domainId}`);

      if (!domainId) {
        return res.status(400).json({ success: false, message: 'domainId is required' });
      }

      const existingDomain = await prisma.familyDomain.findUnique({ where: { id: domainId } });
      if (!existingDomain) {
        return res.status(404).json({ success: false, message: 'Domain not found' });
      }

      await prisma.domainEvent.create({
        data: {
          domainId,
          eventType: 'VERIFICATION_GENERATED',
          message: 'Domain verification email generated.',
          triggeredBy: req.user?.id || 'DEVOPS'
        }
      });

      await createAuditLog(req, 'GENERATE_VERIFY_EMAIL', existingDomain.domainStatus, existingDomain.domainStatus, domainId);

      console.log(`[DevOps] Successfully generated verify email for domainId ${domainId}.`);
      return res.status(200).json({ success: true, message: 'Verification email generated.' });
    } catch (error) {
      console.error(`[DevOps] Error in generateVerifyEmail:`, error);
      return res.status(500).json({ 
        success: false, 
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
      });
    }
  }

  /**
   * PUT /api/v1/domains/devops/mark-dns-configured
   */
  async markDnsConfigured(req, res) {
    try {
      const { domainId } = req.body;
      
      console.log(`[DevOps] markDnsConfigured request received for domainId: ${domainId}`);

      if (!domainId) {
        return res.status(400).json({ success: false, message: 'domainId is required' });
      }

      const existingDomain = await prisma.familyDomain.findUnique({ where: { id: domainId } });
      if (!existingDomain) {
        return res.status(404).json({ success: false, message: 'Domain not found' });
      }

      if (existingDomain.domainStatus !== 'PENDING_SETUP' && existingDomain.domainStatus !== 'DNS_INSTRUCTIONS_SENT') {
        return res.status(400).json({ success: false, message: `Invalid state transition. Domain is currently ${existingDomain.domainStatus}` });
      }

      const domain = await prisma.familyDomain.update({
        where: { id: domainId },
        data: { domainStatus: 'DNS_CONFIGURED' }
      });

      await prisma.domainEvent.create({
        data: {
          domainId,
          eventType: 'INFO',
          message: 'DNS manually marked as configured.',
          triggeredBy: req.user?.id || 'DEVOPS'
        }
      });

      await createAuditLog(req, 'MARK_DNS_CONFIGURED', existingDomain.domainStatus, domain.domainStatus, domainId);

      // Close DNS ticket
      await prisma.devOpsTicket.updateMany({
        where: { domainId, queueType: 'DNS' },
        data: { status: 'Completed', completedAt: new Date() }
      });

      // Open SSL ticket
      await prisma.devOpsTicket.create({
        data: {
          domainId,
          queueType: 'SSL',
          status: 'Pending'
        }
      });

      console.log(`[DevOps] Successfully marked domainId ${domainId} as DNS configured.`);
      return res.status(200).json({ success: true, data: domain });
    } catch (error) {
      console.error(`[DevOps] Error in markDnsConfigured:`, error);
      return res.status(500).json({ 
        success: false, 
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
      });
    }
  }

  /**
   * PUT /api/v1/domains/devops/generate-ssl
   */
  async generateSsl(req, res) {
    try {
      const { domainId } = req.body;
      
      console.log(`[DevOps] generateSsl request received for domainId: ${domainId}`);

      if (!domainId) {
        return res.status(400).json({ success: false, message: 'domainId is required' });
      }

      const existingDomain = await prisma.familyDomain.findUnique({ where: { id: domainId } });
      if (!existingDomain) {
        return res.status(404).json({ success: false, message: 'Domain not found' });
      }

      if (existingDomain.domainStatus !== 'DNS_CONFIGURED') {
        return res.status(400).json({ success: false, message: `Invalid state transition. Domain is currently ${existingDomain.domainStatus}` });
      }

      const domain = await prisma.familyDomain.update({
        where: { id: domainId },
        data: { 
          sslStatus: 'ACTIVE',
          sslIssuedAt: new Date(),
          domainStatus: 'SSL_ENABLED'
        }
      });

      await prisma.domainEvent.create({
        data: {
          domainId,
          eventType: 'SSL_GENERATED',
          message: 'SSL Certificate generated successfully.',
          triggeredBy: req.user?.id || 'DEVOPS'
        }
      });

      await createAuditLog(req, 'GENERATE_SSL', existingDomain.domainStatus, domain.domainStatus, domainId);

      await prisma.devOpsTicket.updateMany({
        where: { domainId, queueType: 'SSL' },
        data: { status: 'Completed', completedAt: new Date() }
      });
      
      // Open Deployment ticket
      await prisma.devOpsTicket.create({
        data: {
          domainId,
          queueType: 'Deployment',
          status: 'Pending'
        }
      });

      console.log(`[DevOps] Successfully generated SSL for domainId ${domainId}.`);
      return res.status(200).json({ success: true, data: domain });
    } catch (error) {
      console.error(`[DevOps] Error in generateSsl:`, error);
      return res.status(500).json({ 
        success: false, 
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
      });
    }
  }

  /**
   * PUT /api/v1/domains/devops/mark-live
   */
  async markLive(req, res) {
    try {
      const { domainId } = req.body;
      
      console.log(`[DevOps] markLive request received for domainId: ${domainId}`);

      if (!domainId) {
        return res.status(400).json({ success: false, message: 'domainId is required' });
      }

      const existingDomain = await prisma.familyDomain.findUnique({ where: { id: domainId } });
      if (!existingDomain) {
        return res.status(404).json({ success: false, message: 'Domain not found' });
      }

      if (existingDomain.domainStatus !== 'SSL_ENABLED') {
        return res.status(400).json({ success: false, message: `Invalid state transition. Domain is currently ${existingDomain.domainStatus}` });
      }

      const domain = await prisma.familyDomain.update({
        where: { id: domainId },
        data: { 
          domainStatus: 'LIVE',
          deploymentStatus: 'Live',
          connectedAt: new Date()
        }
      });

      await prisma.domainEvent.create({
        data: {
          domainId,
          eventType: 'WEBSITE_ACTIVATED',
          message: 'Website is now LIVE.',
          severity: 'INFO',
          triggeredBy: req.user?.id || 'DEVOPS'
        }
      });

      await createAuditLog(req, 'MARK_LIVE', existingDomain.domainStatus, domain.domainStatus, domainId);

      await prisma.devOpsTicket.updateMany({
        where: { domainId, queueType: 'Deployment' },
        data: { status: 'Completed', completedAt: new Date() }
      });

      console.log(`[DevOps] Successfully marked domainId ${domainId} as live.`);
      return res.status(200).json({ success: true, data: domain });
    } catch (error) {
      console.error(`[DevOps] Error in markLive:`, error);
      return res.status(500).json({ 
        success: false, 
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
      });
    }
  }

}

module.exports = new DevOpsController();
