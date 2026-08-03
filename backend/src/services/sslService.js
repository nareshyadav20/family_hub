const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

class SslService {
  async provisionSslCertificate(domainName) {
    const cleanDomain = domainName.replace(/^(https?:\/\/)?(www\.)?/, '').trim().toLowerCase();
    
    console.log(`[SSL Service] Provisioning Let's Encrypt SSL certificate for ${cleanDomain}...`);

    try {
      // Execute Certbot in non-interactive mode. Requires Certbot to be installed on the host machine.
      // We use webroot mode assuming nginx serves ACME challenges from /var/www/certbot
      const certbotCmd = `certbot certonly --webroot -w /var/www/certbot -d ${cleanDomain} --non-interactive --agree-tos -m admin@${cleanDomain}`;
      
      const { stdout, stderr } = await execPromise(certbotCmd);
      console.log(`[SSL Service] Certbot output for ${cleanDomain}:`, stdout);
      if (stderr) console.warn(`[SSL Service] Certbot warnings for ${cleanDomain}:`, stderr);

      const issuedAt = new Date();
      const expiresAt = new Date();
      expiresAt.setDate(issuedAt.getDate() + 90); // Let's Encrypt 90-day certificate validity

      const renewalDate = new Date();
      renewalDate.setDate(issuedAt.getDate() + 60); // Renew at 60 days

      return {
        success: true,
        domainName: cleanDomain,
        sslStatus: 'ACTIVE',
        sslIssuedAt: issuedAt,
        sslExpiresAt: expiresAt,
        sslRenewalDate: renewalDate,
        issuer: "Let's Encrypt Authority"
      };
    } catch (err) {
      console.error(`[SSL Service] Failed to provision SSL for ${cleanDomain}:`, err.message);
      // If we are in local development and certbot is not installed, fail gracefully or throw
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[SSL Service] Development mode detected. Returning mock SSL success despite certbot failure.`);
        const issuedAt = new Date();
        const expiresAt = new Date();
        expiresAt.setDate(issuedAt.getDate() + 90);
        const renewalDate = new Date();
        renewalDate.setDate(issuedAt.getDate() + 60);
        return {
          success: true,
          domainName: cleanDomain,
          sslStatus: 'ACTIVE',
          sslIssuedAt: issuedAt,
          sslExpiresAt: expiresAt,
          sslRenewalDate: renewalDate,
          issuer: "Let's Encrypt Mock (Dev)"
        };
      }
      throw new Error(`SSL Provisioning failed: ${err.message}`);
    }
  }
}

module.exports = new SslService();
