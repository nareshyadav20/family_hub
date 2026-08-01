const prisma = require('./prismaClient');

async function createDummy() {
  try {
    // Check if dummy family exists
    let family = await prisma.family.findUnique({ where: { id: "clp_dummy_fam_123" } });
    if (!family) {
      family = await prisma.family.create({
        data: {
          id: "clp_dummy_fam_123",
          name: "Dummy Family",
          customDomain: "dummy.com",
          plan: "Free",
          status: "Active",
          createdBy: "SYSTEM"
        }
      });
      console.log("Created dummy family");
    }

    // Check if dummy domain exists
    let domain = await prisma.familyDomain.findUnique({ where: { id: "clp_dummy_123" } });
    if (!domain) {
      domain = await prisma.familyDomain.create({
        data: {
          id: "clp_dummy_123",
          familyId: family.id,
          domainName: "dummy.com",
          ownership: "FAMILY_OWNED",
          verificationStatus: "PENDING",
          domainStatus: "PENDING_SETUP",
          sslStatus: "PENDING",
          createdBy: "SYSTEM"
        }
      });
      console.log("Created dummy domain clp_dummy_123");
    } else {
      console.log("Dummy domain already exists");
    }
  } catch (err) {
    console.error("Error creating dummy records:", err);
  } finally {
    await prisma.$disconnect();
  }
}

createDummy();
