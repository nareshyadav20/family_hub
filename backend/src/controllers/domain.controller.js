const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const domainValidationService = require('../services/domainValidation.service');
const domainReservationService = require('../services/domainReservation.service');
const RegistrarFactory = require('../services/registrar/registrar.factory');

class DomainController {
  
  /**
   * POST /api/v1/domains/family-owned
   */
  async createFamilyOwnedDomain(req, res) {
    try {
      const {
        familyId,
        domain,
        registrar,
        registrantName,
        registrantEmail,
        technicalContact,
        technicalEmail,
        technicalPhone,
        hostingProvider,
        dnsAccess,
        migrationRequired,
        notes
      } = req.body;

      // 1. Validate domain
      const validation = await domainValidationService.validateDomainAvailable(domain);
      if (!validation.valid) {
        return res.status(409).json({ success: false, message: validation.reason });
      }

      const normalizedDomain = validation.domain;

      // 2. Transaction to create Domain, Activity, Ticket
      const result = await prisma.$transaction(async (tx) => {
        // Create Domain
        const familyDomain = await tx.familyDomain.create({
          data: {
            familyId,
            domainName: normalizedDomain,
            ownership: 'FAMILY_OWNED',
            registrar,
            dnsProvider: hostingProvider,
            domainStatus: 'PENDING_SETUP',
            dnsVerified: false,
            sslStatus: 'PENDING',
            migrationRequired: migrationRequired === 'true' || migrationRequired === true,
            notes,
            createdBy: req.user?.id || 'SYSTEM'
          }
        });

        // Add Contact
        if (registrantName && registrantEmail) {
          await tx.domainContact.create({
            data: {
              domainId: familyDomain.id,
              familyId,
              contactType: 'OWNER',
              name: registrantName,
              email: registrantEmail,
            }
          });
        }
        if (technicalContact && technicalEmail) {
          await tx.domainContact.create({
            data: {
              domainId: familyDomain.id,
              familyId,
              contactType: 'TECHNICAL',
              name: technicalContact,
              email: technicalEmail,
              phone: technicalPhone
            }
          });
        }

        // Domain Activity
        await tx.domainEvent.create({
          data: {
            domainId: familyDomain.id,
            eventType: 'DOMAIN_CREATED',
            message: 'Family-owned domain submitted for verification.',
            triggeredBy: req.user?.id || 'SYSTEM'
          }
        });

        // DevOps Ticket
        await tx.devOpsTicket.create({
          data: {
            domainId: familyDomain.id,
            queueType: 'DNS',
            status: 'Pending',
            priority: 'Medium'
          }
        });

        return familyDomain;
      });

      // Clear reservation if any
      await domainReservationService.fulfillReservation(normalizedDomain);

      return res.status(201).json({
        success: true,
        message: 'Family-owned domain submitted successfully.',
        data: result
      });
      
    } catch (error) {
      console.error('[DomainController] createFamilyOwnedDomain error:', error);
      return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  }

  /**
   * POST /api/v1/domains/familyhub-managed
   */
  async createFamilyHubManagedDomain(req, res) {
    try {
      const {
        familyId,
        preferredDomain,
        alternativeDomain1,
        alternativeDomain2,
        registrationPeriod,
        autoRenew,
        billingEmail,
        billingPhone,
        notes
      } = req.body;

      // 1. Validate domain
      const validation = await domainValidationService.validateDomainAvailable(preferredDomain);
      if (!validation.valid) {
        return res.status(409).json({ success: false, message: validation.reason });
      }

      const normalizedDomain = validation.domain;

      // 2. Transaction
      const result = await prisma.$transaction(async (tx) => {
        const familyDomain = await tx.familyDomain.create({
          data: {
            familyId,
            domainName: normalizedDomain,
            ownership: 'MANAGED_BY_FAMILYHUB',
            purchaseStatus: 'WAITING',
            domainStatus: 'PENDING_SETUP',
            dnsVerified: false,
            sslStatus: 'PENDING',
            autoRenew: autoRenew === 'true' || autoRenew === true,
            registrationYears: parseInt(registrationPeriod) || 1,
            notes,
            createdBy: req.user?.id || 'SYSTEM'
          }
        });

        if (billingEmail) {
          await tx.domainContact.create({
            data: {
              domainId: familyDomain.id,
              familyId,
              contactType: 'BILLING',
              name: 'FamilyHub Billing',
              email: billingEmail,
              phone: billingPhone
            }
          });
        }

        // Domain Activity
        await tx.domainEvent.create({
          data: {
            domainId: familyDomain.id,
            eventType: 'DOMAIN_CREATED',
            message: 'Domain purchase request created.',
            triggeredBy: req.user?.id || 'SYSTEM'
          }
        });

        // DevOps Ticket
        await tx.devOpsTicket.create({
          data: {
            domainId: familyDomain.id,
            queueType: 'Purchase',
            status: 'Pending',
            priority: 'High'
          }
        });

        return familyDomain;
      });

      // Clear reservation if any
      await domainReservationService.fulfillReservation(normalizedDomain);

      return res.status(201).json({
        success: true,
        message: 'Domain purchase request submitted successfully.',
        data: result
      });
      
    } catch (error) {
      console.error('[DomainController] createFamilyHubManagedDomain error:', error);
      return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  }

}

module.exports = new DomainController();
