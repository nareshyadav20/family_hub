const { z } = require('zod');

const PhoneRegex = /^\+?[1-9]\d{1,14}$/;
const DomainRegex = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;

const ContactSchema = z.object({
  name: z.string().min(1, 'Contact name is required').max(150),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(PhoneRegex, 'Invalid E.164 phone number').optional().nullable()
});

const CreateFamilySchema = z.object({
  familyName: z.string().min(2, 'Family name must be at least 2 characters').max(100),
  familyCode: z.string().max(50).optional(),
  logo: z.string().optional(),
  themeColor: z.string().optional(),
  admin: z.object({
    firstName: z.string().min(1, 'First name is required').max(50),
    lastName: z.string().min(1, 'Last name is required').max(50),
    email: z.string().email('Invalid admin email address'),
    phone: z.string().regex(PhoneRegex, 'Invalid E.164 phone format').optional().nullable(),
    password: z.string().min(8, 'Password must be at least 8 characters').max(100)
  }),
  domain: z.object({
    rootDomain: z.string().regex(DomainRegex, 'Invalid root domain format (e.g., smithfamily.com)'),
    ownershipType: z.enum(['FAMILY_OWNED', 'MANAGED_BY_FAMILYHUB']).default('FAMILY_OWNED'),
    registrar: z.string().max(100).optional().nullable(),
    dnsProvider: z.string().max(100).optional().nullable(),
    verificationMethod: z.enum(['TXT', 'CNAME']).default('TXT'),
    registrationYears: z.number().int().min(1).max(10).default(1)
  }),
  contacts: z.object({
    owner: ContactSchema,
    technical: ContactSchema.optional(),
    billing: ContactSchema.optional(),
    support: ContactSchema.optional()
  }).optional()
});

const CreateDomainSchema = z.object({
  familyId: z.string().min(1, 'Family ID is required'),
  rootDomain: z.string().regex(DomainRegex, 'Invalid domain format'),
  ownershipType: z.enum(['FAMILY_OWNED', 'MANAGED_BY_FAMILYHUB']).default('FAMILY_OWNED'),
  registrar: z.string().max(100).optional().nullable(),
  dnsProvider: z.string().max(100).optional().nullable(),
  verificationMethod: z.enum(['TXT', 'CNAME']).default('TXT'),
  registrationYears: z.number().int().min(1).max(10).default(1)
});

const SearchDomainSchema = z.object({
  domainName: z.string().min(3, 'Domain search term required')
});

const PurchaseDomainSchema = z.object({
  familyId: z.string().min(1, 'Family ID is required'),
  domainName: z.string().regex(DomainRegex, 'Invalid domain format'),
  registrationYears: z.number().int().min(1).max(10).default(1),
  contacts: z.object({
    owner: ContactSchema,
    technical: ContactSchema.optional(),
    billing: ContactSchema.optional()
  }).optional()
});

const VerifyDomainSchema = z.object({
  domainId: z.string().min(1, 'Domain ID is required')
});

const RecheckDomainSchema = z.object({
  domainId: z.string().min(1, 'Domain ID is required')
});

const ProvisionSslSchema = z.object({
  domainId: z.string().min(1, 'Domain ID is required')
});

const ActivateDomainSchema = z.object({
  domainId: z.string().min(1, 'Domain ID is required')
});

module.exports = {
  PhoneRegex,
  DomainRegex,
  CreateFamilySchema,
  CreateDomainSchema,
  SearchDomainSchema,
  PurchaseDomainSchema,
  VerifyDomainSchema,
  RecheckDomainSchema,
  ProvisionSslSchema,
  ActivateDomainSchema
};
