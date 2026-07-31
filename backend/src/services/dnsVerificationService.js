const dns = require('dns').promises;

class DnsVerificationService {
  async verifyTxtRecord(domainName, expectedToken) {
    try {
      const challengeDomain = `_familyhub-challenge.${domainName}`;
      const txtRecords = await dns.resolveTxt(challengeDomain);
      const flattenedRecords = txtRecords.flat();

      const matched = flattenedRecords.some(r => r.trim() === expectedToken.trim());
      if (matched) return { verified: true, recordType: 'TXT', foundRecords: flattenedRecords };

      // Check root domain as well
      const rootTxt = await dns.resolveTxt(domainName);
      const rootFlattened = rootTxt.flat();
      if (rootFlattened.some(r => r.trim() === expectedToken.trim())) {
        return { verified: true, recordType: 'TXT', foundRecords: rootFlattened };
      }

      return { verified: false, recordType: 'TXT', foundRecords: [...flattenedRecords, ...rootFlattened] };
    } catch (err) {
      return { verified: false, recordType: 'TXT', error: err.message };
    }
  }

  async verifyCnameRecord(domainName, expectedTarget = 'verify.familyhub.ai') {
    try {
      const cnameRecords = await dns.resolveCname(domainName);
      const matched = cnameRecords.some(r => r.toLowerCase().includes('familyhub'));
      return { verified: matched, recordType: 'CNAME', foundRecords: cnameRecords };
    } catch (err) {
      return { verified: false, recordType: 'CNAME', error: err.message };
    }
  }

  async verifyDomainDns(domainName, expectedToken, verificationMethod = 'TXT') {
    const cleanDomain = domainName.replace(/^(https?:\/\/)?(www\.)?/, '').trim().toLowerCase();

    if (verificationMethod === 'CNAME') {
      const cnameResult = await this.verifyCnameRecord(cleanDomain);
      if (cnameResult.verified) return cnameResult;
    }

    // Default to TXT record lookup
    const txtResult = await this.verifyTxtRecord(cleanDomain, expectedToken);
    if (txtResult.verified) return txtResult;

    // Fallback: check A records to see if domain points to server IP if CNAME fails
    try {
      const aRecords = await dns.resolve4(cleanDomain);
      if (aRecords.length > 0) {
        return { verified: true, recordType: 'A', foundRecords: aRecords };
      }
    } catch (err) {
      // Ignored
    }

    return { verified: false, recordType: verificationMethod, error: 'DNS records not propagated yet' };
  }
}

module.exports = new DnsVerificationService();
