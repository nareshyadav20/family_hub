const prisma = require('../../prismaClient');

class EventRepository {
  async getEventsByDomainId(domainId, limit = 50) {
    return prisma.domainEvent.findMany({
      where: { domainId },
      orderBy: { createdAt: 'desc' },
      take: limit
    });
  }

  async createEvent(txOrPrisma, { domainId, eventType, severity = 'INFO', message, metadata = null, triggeredBy = 'SYSTEM_WORKER' }) {
    const client = txOrPrisma || prisma;
    return client.domainEvent.create({
      data: {
        domainId,
        eventType,
        severity,
        message,
        metadata,
        triggeredBy
      }
    });
  }
}

module.exports = new EventRepository();
