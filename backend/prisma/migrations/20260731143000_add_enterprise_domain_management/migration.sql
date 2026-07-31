-- CreateEnums
CREATE TYPE "VerificationMethod" AS ENUM ('TXT', 'CNAME');
CREATE TYPE "VerificationStatus" AS ENUM ('UNVERIFIED', 'PENDING', 'VERIFIED', 'FAILED', 'EXPIRED');
CREATE TYPE "PurchaseStatus" AS ENUM ('NOT_APPLICABLE', 'SEARCHING', 'AVAILABLE', 'UNAVAILABLE', 'PURCHASING', 'PURCHASED', 'FAILED');
CREATE TYPE "RenewalStatus" AS ENUM ('NONE', 'ACTIVE', 'MANUAL_REQUIRED', 'FAILED');
CREATE TYPE "WorkflowStep" AS ENUM ('REQUEST_SUBMITTED', 'PENDING_SETUP', 'SEARCHING_DOMAIN', 'DOMAIN_PURCHASED', 'DNS_CONFIGURATION', 'DNS_VERIFICATION', 'SSL_GENERATION', 'TENANT_MAPPING', 'WEBSITE_LIVE');
CREATE TYPE "WorkflowStepStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'SKIPPED');
CREATE TYPE "ContactType" AS ENUM ('OWNER', 'TECHNICAL', 'BILLING', 'SUPPORT');
CREATE TYPE "EventSeverity" AS ENUM ('INFO', 'WARNING', 'ERROR', 'CRITICAL');

-- AlterTable family_domains
ALTER TABLE "family_domains" 
ADD COLUMN IF NOT EXISTS "dnsProvider" TEXT,
ADD COLUMN IF NOT EXISTS "verificationMethod" "VerificationMethod" NOT NULL DEFAULT 'TXT',
ADD COLUMN IF NOT EXISTS "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'UNVERIFIED',
ADD COLUMN IF NOT EXISTS "sslIssuedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "sslExpiresAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "sslRenewalDate" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "purchaseStatus" "PurchaseStatus" NOT NULL DEFAULT 'NOT_APPLICABLE',
ADD COLUMN IF NOT EXISTS "renewalStatus" "RenewalStatus" NOT NULL DEFAULT 'NONE',
ADD COLUMN IF NOT EXISTS "registrationYears" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN IF NOT EXISTS "purchaseDate" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "migrationRequired" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "notes" TEXT,
ADD COLUMN IF NOT EXISTS "connectedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);

-- CreateTable family_admins
CREATE TABLE IF NOT EXISTS "family_admins" (
    "id" TEXT NOT NULL,
    "familyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "family_admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable domain_contacts
CREATE TABLE IF NOT EXISTS "domain_contacts" (
    "id" TEXT NOT NULL,
    "domainId" TEXT NOT NULL,
    "familyId" TEXT NOT NULL,
    "contactType" "ContactType" NOT NULL DEFAULT 'OWNER',
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "domain_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable domain_dns_records
CREATE TABLE IF NOT EXISTS "domain_dns_records" (
    "id" TEXT NOT NULL,
    "domainId" TEXT NOT NULL,
    "recordType" TEXT NOT NULL,
    "recordName" TEXT NOT NULL,
    "expectedValue" TEXT NOT NULL,
    "actualValue" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "ttl" INTEGER NOT NULL DEFAULT 300,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "domain_dns_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable domain_workflow
CREATE TABLE IF NOT EXISTS "domain_workflow" (
    "id" TEXT NOT NULL,
    "domainId" TEXT NOT NULL,
    "step" "WorkflowStep" NOT NULL,
    "status" "WorkflowStepStatus" NOT NULL DEFAULT 'PENDING',
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "completedBy" TEXT,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "domain_workflow_pkey" PRIMARY KEY ("id")
);

-- CreateTable domain_events
CREATE TABLE IF NOT EXISTS "domain_events" (
    "id" TEXT NOT NULL,
    "domainId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "severity" "EventSeverity" NOT NULL DEFAULT 'INFO',
    "message" TEXT NOT NULL,
    "metadata" JSONB,
    "triggeredBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "domain_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndexes
CREATE INDEX IF NOT EXISTS "family_admins_familyId_idx" ON "family_admins"("familyId");
CREATE INDEX IF NOT EXISTS "family_admins_userId_idx" ON "family_admins"("userId");
CREATE INDEX IF NOT EXISTS "domain_contacts_domainId_idx" ON "domain_contacts"("domainId");
CREATE INDEX IF NOT EXISTS "domain_contacts_familyId_idx" ON "domain_contacts"("familyId");
CREATE INDEX IF NOT EXISTS "domain_dns_records_domainId_idx" ON "domain_dns_records"("domainId");
CREATE INDEX IF NOT EXISTS "domain_workflow_domainId_idx" ON "domain_workflow"("domainId");
CREATE UNIQUE INDEX IF NOT EXISTS "domain_workflow_domainId_step_key" ON "domain_workflow"("domainId", "step");
CREATE INDEX IF NOT EXISTS "domain_events_domainId_idx" ON "domain_events"("domainId");
CREATE INDEX IF NOT EXISTS "domain_events_eventType_idx" ON "domain_events"("eventType");

-- AddForeignKeys
ALTER TABLE "family_admins" ADD CONSTRAINT "family_admins_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "family_admins" ADD CONSTRAINT "family_admins_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "families"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "domain_contacts" ADD CONSTRAINT "domain_contacts_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "family_domains"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "domain_contacts" ADD CONSTRAINT "domain_contacts_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "families"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "domain_dns_records" ADD CONSTRAINT "domain_dns_records_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "family_domains"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "domain_workflow" ADD CONSTRAINT "domain_workflow_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "family_domains"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "domain_events" ADD CONSTRAINT "domain_events_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "family_domains"("id") ON DELETE CASCADE ON UPDATE CASCADE;
