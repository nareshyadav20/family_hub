const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class DevOpsController {
  
  /**
   * PUT /api/v1/domains/devops/purchase
   */
  async markPurchased(req, res) {
    try {
      const { domainId, purchasePrice, registrar } = req.body;
      
      const domain = await prisma.familyDomain.update({
        where: { id: domainId },
        data: {
          purchaseStatus: 'PURCHASED',
          purchasePrice: parseFloat(purchasePrice),
          registrar,
          purchaseDate: new Date(),
          domainStatus: 'DNS_CONFIGURED' // typically moves to next step
        }
      });

      await prisma.domainEvent.create({
        data: {
          domainId,
          eventType: 'DOMAIN_PURCHASED',
          message: `Domain purchased successfully via ${registrar}.`,
          triggeredBy: req.user?.id || 'DEVOPS'
        }
      });

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

      return res.status(200).json({ success: true, data: domain });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  /**
   * PUT /api/v1/domains/devops/send-dns
   */
  async sendDnsInstructions(req, res) {
    try {
      const { domainId } = req.body;
      
      await prisma.domainEvent.create({
        data: {
          domainId,
          eventType: 'VERIFICATION_GENERATED',
          message: 'DNS Instructions sent to family.',
          triggeredBy: req.user?.id || 'DEVOPS'
        }
      });

      return res.status(200).json({ success: true, message: 'Instructions sent.' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  /**
   * PUT /api/v1/domains/devops/mark-dns-configured
   */
  async markDnsConfigured(req, res) {
    try {
      const { domainId } = req.body;
      
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

      return res.status(200).json({ success: true, data: domain });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  /**
   * PUT /api/v1/domains/devops/generate-ssl
   */
  async generateSsl(req, res) {
    try {
      const { domainId } = req.body;
      
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

      return res.status(200).json({ success: true, data: domain });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  /**
   * PUT /api/v1/domains/devops/mark-live
   */
  async markLive(req, res) {
    try {
      const { domainId } = req.body;
      
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

      await prisma.devOpsTicket.updateMany({
        where: { domainId, queueType: 'Deployment' },
        data: { status: 'Completed', completedAt: new Date() }
      });

      return res.status(200).json({ success: true, data: domain });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  }

}

module.exports = new DevOpsController();
