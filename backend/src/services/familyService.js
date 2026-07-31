const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const prisma = require('../../prismaClient');
const familyRepository = require('../repositories/familyRepository');
const domainRepository = require('../repositories/domainRepository');
const workflowService = require('./workflowService');
const eventService = require('./eventService');
const { sendFamilyAdminEmail } = require('../../services/emailService');

class FamilyService {
  generateVerificationToken() {
    return `fh_${crypto.randomBytes(8).toString('hex')}`;
  }

  async createFamilyWorkflow(req, dtoData) {
    const { familyName, familyCode, admin, domain, contacts } = dtoData;
    const cleanDomain = domain.rootDomain.replace(/^(https?:\/\/)?(www\.)?/, '').trim().toLowerCase();

    // 1. Validation checks
    const existingEmail = await familyRepository.findUserByEmail(admin.email);
    if (existingEmail) {
      throw new Error('Admin email already exists');
    }

    if (admin.phone) {
      const existingPhone = await familyRepository.findUserByPhone(admin.phone);
      if (existingPhone) {
        throw new Error('Admin phone number already exists');
      }
    }

    const existingDomain = await domainRepository.findDomainByName(cleanDomain);
    if (existingDomain) {
      throw new Error(`Domain ${cleanDomain} is already registered to family ${existingDomain.family?.name || existingDomain.familyId}`);
    }

    const code = familyCode || 'FAM' + Math.floor(1000 + Math.random() * 9000);
    const hashedPassword = await bcrypt.hash(admin.password, 10);
    const verificationToken = this.generateVerificationToken();
    const isFamilyOwned = domain.ownershipType === 'FAMILY_OWNED';

    const result = await prisma.$transaction(async (tx) => {
      // Step 1 & 2: Create Family & Admin
      const { family, admin: adminUser } = await familyRepository.createFamilyWithAdmin(tx, {
        familyData: {
          name: familyName,
          familyCode: code,
          customDomain: cleanDomain,
          plan: 'Free',
          status: 'Pending',
          createdBy: 'SUPER_ADMIN'
        },
        adminData: {
          firstName: admin.firstName,
          lastName: admin.lastName,
          email: admin.email,
          phone: admin.phone || null,
          password: hashedPassword,
          role: 'ADMIN',
          isTemporaryPassword: true,
          mustChangePassword: true,
          status: 'ACTIVE'
        }
      });

      // Step 3 & 4: Create Domain & Token
      const createdDomain = await domainRepository.createDomain(tx, {
        familyId: family.id,
        domainName: cleanDomain,
        ownership: isFamilyOwned ? 'FAMILY_OWNED' : 'MANAGED_BY_FAMILYHUB',
        registrar: domain.registrar || (isFamilyOwned ? 'Customer Registrar' : 'FamilyHub Registrar Services'),
        dnsProvider: domain.dnsProvider || null,
        verificationToken,
        verificationMethod: domain.verificationMethod || 'TXT',
        verificationStatus: isFamilyOwned ? 'PENDING' : 'VERIFIED',
        domainStatus: 'PENDING_SETUP',
        purchaseStatus: isFamilyOwned ? 'NOT_APPLICABLE' : 'SEARCHING',
        registrationYears: domain.registrationYears || 1,
        dnsInstructions: isFamilyOwned 
          ? `Create a TXT record for '_familyhub-challenge.${cleanDomain}' with value '${verificationToken}', or a CNAME pointing to 'verify.familyhub.ai'.`
          : `FamilyHub will purchase and configure DNS for ${cleanDomain}.`,
        createdBy: adminUser.id
      });

      // Step 5: Generate DNS Record Specifications
      const txtRecord = await domainRepository.createDnsRecord(tx, {
        domainId: createdDomain.id,
        recordType: 'TXT',
        recordName: `_familyhub-challenge.${cleanDomain}`,
        expectedValue: verificationToken,
        ttl: 300
      });

      const cnameRecord = await domainRepository.createDnsRecord(tx, {
        domainId: createdDomain.id,
        recordType: 'CNAME',
        recordName: cleanDomain,
        expectedValue: 'verify.familyhub.ai',
        ttl: 300
      });

      // Contacts
      if (contacts) {
        await domainRepository.upsertContacts(tx, createdDomain.id, family.id, contacts);
      } else {
        await domainRepository.upsertContacts(tx, createdDomain.id, family.id, {
          owner: { name: `${admin.firstName} ${admin.lastName}`.trim(), email: admin.email, phone: admin.phone }
        });
      }

      // Step 6: Initialize Workflow
      await workflowService.initWorkflow(tx, createdDomain.id, isFamilyOwned);

      // Step 7: Log Domain Audit Events
      const io = req.app ? req.app.get('socketio') : null;
      await eventService.logEvent(tx, io, {
        domainId: createdDomain.id,
        familyId: family.id,
        eventType: 'FAMILY_CREATED',
        message: `Family ${familyName} created with code ${code}`,
        triggeredBy: adminUser.id
      });

      await eventService.logEvent(tx, io, {
        domainId: createdDomain.id,
        familyId: family.id,
        eventType: 'ADMIN_CREATED',
        message: `Admin ${admin.email} created for family ${familyName}`,
        triggeredBy: adminUser.id
      });

      await eventService.logEvent(tx, io, {
        domainId: createdDomain.id,
        familyId: family.id,
        eventType: 'DOMAIN_CREATED',
        message: `Custom domain ${cleanDomain} registered in system (${createdDomain.ownership})`,
        triggeredBy: adminUser.id
      });

      return { family, adminUser, domain: createdDomain, dnsRecords: [txtRecord, cnameRecord] };
    }, { maxWait: 10000, timeout: 20000 });

    // Send Welcome Email Async
    try {
      await sendFamilyAdminEmail(
        `${admin.firstName} ${admin.lastName}`.trim(),
        admin.email,
        familyName,
        result.family.familyCode,
        admin.password,
        false,
        cleanDomain
      );
    } catch (emailErr) {
      console.error('[Family Service] Email notification warning:', emailErr);
    }

    // Step 8: Return formatted response
    return result;
  }
}

module.exports = new FamilyService();
