const eventRepository = require('../repositories/eventRepository');

class EventService {
  async logEvent(txOrPrisma, appSocketIo, { domainId, familyId, eventType, severity = 'INFO', message, metadata = null, triggeredBy = 'SYSTEM_WORKER' }) {
    const event = await eventRepository.createEvent(txOrPrisma, {
      domainId,
      eventType,
      severity,
      message,
      metadata,
      triggeredBy
    });

    if (appSocketIo && familyId) {
      try {
        appSocketIo.to(`family_${familyId}`).emit('domain.event', {
          familyId,
          domainId,
          event
        });
      } catch (err) {
        console.error('WebSocket emit error:', err);
      }
    }

    return event;
  }

  async getDomainEvents(domainId) {
    return eventRepository.getEventsByDomainId(domainId);
  }
}

module.exports = new EventService();
