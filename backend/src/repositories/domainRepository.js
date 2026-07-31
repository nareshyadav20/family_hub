const prisma = require('../../prismaClient');

class DomainRepository {
  async findDomainById(id) {
    return prisma.familyDomain.findUnique({
      where: { id },
      include: {
        family: true,
        contacts: true,
        dnsRecords: true,
        workflows: { orderBy: { createdAt: 'asc' } },
        events: { orderBy: { createdAt: 'desc' } },
        histories: { orderBy: { createdAt: 'desc' } }
      }
    });
  }

  async findDomainByName(domainName) {
    const cleanDomain = domainName.replace(/^(https?:\/\/)?(www\.)?/, '').trim().toLowerCase();
    return prisma.familyDomain.findUnique({
      where: { domainName: cleanDomain },
      include: {
        family: true,
        workflows: true
      }
    });
  }

  async findDomainsByFamilyId(familyId) {
    return prisma.familyDomain.findMany({
      where: { familyId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      include: {
        contacts: true,
        dnsRecords: true,
        workflows: { orderBy: { createdAt: 'asc' } },
        events: { orderBy: { createdAt: 'desc' }, take: 10 }
      }
    });
  }

  async createDomain(tx, domainData) {
    return tx.familyDomain.create({
      data: domainData
    });
  }

  async updateDomainStatus(tx, id, updateData) {
    return tx.familyDomain.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date()
      }
    });
  }

  async createDnsRecord(tx, dnsData) {
    return tx.domainDnsRecord.create({
      data: dnsData
    });
  }

  async updateDnsRecord(tx, id, updateData) {
    return tx.domainDnsRecord.update({
      where: { id },
      data: updateData
    });
  }

  async upsertContacts(tx, domainId, familyId, contacts) {
    if (!contacts) return [];

    const createdContacts = [];
    for (const [type, data] of Object.entries(contacts)) {
      if (data && data.name && data.email) {
        const contactType = type.toUpperCase();
        const contact = await tx.domainContact.create({
          data: {
            domainId,
            familyId,
            contactType,
            name: data.name,
            email: data.email,
            phone: data.phone || null
          }
        });
        createdContacts.push(contact);
      }
    }
    return createdContacts;
  }
}

module.exports = new DomainRepository();
