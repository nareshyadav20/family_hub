/**
 * Standard Interface for Domain Registrars
 * Every adapter must implement these methods.
 */
class RegistrarInterface {
  async checkAvailability(domain) {
    throw new Error('Not implemented');
  }

  async purchaseDomain(domain, period, contactDetails) {
    throw new Error('Not implemented');
  }

  async renewDomain(domain, period) {
    throw new Error('Not implemented');
  }

  async configureDNS(domain, records) {
    throw new Error('Not implemented');
  }

  async deleteDNS(domain, recordId) {
    throw new Error('Not implemented');
  }

  async getDomainInfo(domain) {
    throw new Error('Not implemented');
  }
}

module.exports = RegistrarInterface;
