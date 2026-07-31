const prisma = require('../../prismaClient');

class FamilyRepository {
  async findFamilyById(id) {
    return prisma.family.findUnique({
      where: { id },
      include: {
        members: { where: { role: 'ADMIN' } },
        domains: true
      }
    });
  }

  async findFamilyByCode(familyCode) {
    return prisma.family.findUnique({
      where: { familyCode }
    });
  }

  async findUserByEmail(email) {
    return prisma.user.findUnique({
      where: { email }
    });
  }

  async findUserByPhone(phone) {
    if (!phone) return null;
    return prisma.user.findFirst({
      where: { phone }
    });
  }

  async createFamilyWithAdmin(tx, { familyData, adminData }) {
    const family = await tx.family.create({
      data: familyData
    });

    const admin = await tx.user.create({
      data: {
        ...adminData,
        familyId: family.id
      }
    });

    // Create relation in family_admins table if available
    await tx.familyAdmin.create({
      data: {
        familyId: family.id,
        userId: admin.id
      }
    });

    return { family, admin };
  }
}

module.exports = new FamilyRepository();
