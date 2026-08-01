const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const domainValidationService = require('./domainValidation.service');

class DomainReservationService {
  /**
   * Reserves a domain for 30 minutes for a specific admin.
   */
  async reserveDomain(rawDomain, adminId) {
    const domain = domainValidationService.normalizeDomain(rawDomain);
    
    // Validate first
    const validation = await domainValidationService.validateDomainAvailable(domain);
    if (!validation.valid) {
      throw new Error(validation.reason);
    }

    // Clean up expired reservations
    await this.cleanupExpiredReservations();

    const reservedUntil = new Date();
    reservedUntil.setMinutes(reservedUntil.getMinutes() + 30); // 30 mins lock

    try {
      const reservation = await prisma.domainReservation.create({
        data: {
          domain,
          reservedBy: adminId,
          reservedUntil,
          status: 'ACTIVE'
        }
      });
      return reservation;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new Error('Domain was just reserved by another process.');
      }
      throw error;
    }
  }

  /**
   * Clears reservations that have expired.
   */
  async cleanupExpiredReservations() {
    await prisma.domainReservation.deleteMany({
      where: {
        reservedUntil: { lt: new Date() }
      }
    });
  }

  /**
   * Completes a reservation and removes it.
   */
  async fulfillReservation(domain) {
    await prisma.domainReservation.deleteMany({
      where: { domain }
    });
  }
}

module.exports = new DomainReservationService();
