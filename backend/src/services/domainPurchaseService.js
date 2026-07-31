class DomainPurchaseService {
  async searchDomainAvailability(domainName) {
    const cleanDomain = domainName.replace(/^(https?:\/\/)?(www\.)?/, '').trim().toLowerCase();
    
    // Simulate check against registrar API (e.g. Namecheap / Route53 / ResellerClub)
    const isStandardTld = /\.(com|org|net|io|family|co|ai)$/i.test(cleanDomain);
    const isReserved = ['google.com', 'facebook.com', 'microsoft.com', 'apple.com', 'familyhub.ai'].includes(cleanDomain);

    const available = isStandardTld && !isReserved;

    return {
      domainName: cleanDomain,
      available,
      currency: 'USD',
      purchasePrice: available ? 12.99 : null,
      renewalPrice: available ? 14.99 : null,
      registrar: 'FamilyHub Registrar Services'
    };
  }

  async purchaseDomain(domainName, registrationYears = 1, contactInfo = null) {
    const search = await this.searchDomainAvailability(domainName);
    if (!search.available) {
      throw new Error(`Domain ${domainName} is unavailable for registration.`);
    }

    // Simulate domain purchase transaction with Registrar
    const purchaseReference = `REG-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const purchaseDate = new Date();
    const expiryDate = new Date();
    expiryDate.setFullYear(purchaseDate.getFullYear() + registrationYears);

    return {
      success: true,
      domainName: search.domainName,
      purchaseReference,
      registrar: search.registrar,
      purchasePrice: search.purchasePrice * registrationYears,
      renewalPrice: search.renewalPrice,
      purchaseDate,
      expiryDate,
      autoRenew: true,
      nameservers: ['ns1.familyhub.ai', 'ns2.familyhub.ai']
    };
  }
}

module.exports = new DomainPurchaseService();
