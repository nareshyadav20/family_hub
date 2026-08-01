const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class DomainValidationService {
  /**
   * Cleans and normalizes a domain string.
   * Removes protocol, www., ports, and trailing slashes.
   */
  normalizeDomain(rawDomain) {
    if (!rawDomain) return '';
    let domain = rawDomain.toLowerCase().trim();
    
    // Remove protocol
    domain = domain.replace(/^(https?:\/\/)?/, '');
    
    // Remove www.
    domain = domain.replace(/^www\./, '');
    
    // Remove port and path
    domain = domain.split('/')[0].split(':')[0];
    
    return domain;
  }

  /**
   * Validates if the domain is correctly formatted.
   */
  isValidFormat(domain) {
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\\.[a-zA-Z]{2,}$/;
    // Also allow wildcard domains for subdomains e.g., *.smithfamily.com
    const wildcardRegex = /^\\*\\.[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\\.[a-zA-Z]{2,}$/;
    return domainRegex.test(domain) || wildcardRegex.test(domain);
  }

  /**
   * Validates against reserved platform domains.
   */
  isPlatformDomain(domain) {
    const platformDomains = ['familyhub.ai', 'familyhub.com', 'familyhub.org'];
    const platformSubdomains = ['admin', 'api', 'portal', 'app', 'www', 'mail', 'cdn'];
    
    if (platformDomains.includes(domain)) return true;
    
    for (const pd of platformDomains) {
      if (domain.endsWith(`.${pd}`)) {
        const subdomain = domain.replace(`.${pd}`, '');
        if (platformSubdomains.includes(subdomain) || platformSubdomains.includes('*')) {
          return true;
        }
      }
    }
    
    return false;
  }

  /**
   * Main validation function.
   * Checks format, platform restrictions, existing databases and active reservations.
   */
  async validateDomainAvailable(rawDomain) {
    const domain = this.normalizeDomain(rawDomain);
    
    if (!this.isValidFormat(domain)) {
      return { valid: false, reason: 'Invalid domain format.' };
    }

    if (this.isPlatformDomain(domain)) {
      return { valid: false, reason: 'Reserved platform domain.' };
    }

    // Check if domain exists in FamilyDomain
    const existing = await prisma.familyDomain.findUnique({
      where: { domainName: domain }
    });

    if (existing) {
      return { valid: false, reason: 'Domain is already registered to a family.' };
    }

    // Check if domain is reserved
    const reservation = await prisma.domainReservation.findUnique({
      where: { domain }
    });

    if (reservation) {
      if (reservation.reservedUntil > new Date() && reservation.status === 'ACTIVE') {
        return { valid: false, reason: 'Domain is currently reserved by another admin.' };
      }
    }

    return { valid: true, domain };
  }
}

module.exports = new DomainValidationService();
