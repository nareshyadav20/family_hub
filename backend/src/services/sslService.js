const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

class SslService {
  async provisionSslCertificate(domainName) {
    const cleanDomain = domainName.replace(/^(https?:\/\/)?(www\.)?/, '').trim().toLowerCase();
    const adminEmail = process.env.ADMIN_EMAIL || `admin@${cleanDomain}`;
    const isLinux = process.platform === 'linux';
    
    console.log(`[SSL Service] Provisioning Let's Encrypt SSL certificate for ${cleanDomain}...`);
    console.log(`[Startup] Certbot Executable: certbot`);
    console.log(`[Startup] Webroot Path: /var/www/certbot`);
    console.log(`[Startup] Production Mode: ${process.env.NODE_ENV === 'production'}`);

    try {
      if (isLinux) {
        // Ensure webroot exists
        await execPromise('sudo mkdir -p /var/www/certbot');
        await execPromise('sudo chown www-data:www-data /var/www/certbot || true');
        await execPromise('sudo chmod 755 /var/www/certbot');
        console.log(`[SSL Service] Created /var/www/certbot`);
      } else {
        console.warn(`[SSL Service] Skipped webroot creation because OS is not Linux`);
      }

      // Execute Certbot in non-interactive mode. Requires Certbot to be installed on the host machine.
      const certbotCmd = isLinux 
        ? `sudo certbot certonly --webroot -w /var/www/certbot -d ${cleanDomain} --non-interactive --agree-tos -m ${adminEmail}`
        : `echo "Skipping Certbot on non-Linux OS"`;
      
      const { stdout, stderr } = await execPromise(certbotCmd);
      console.log(`[SSL Service] Certbot output for ${cleanDomain}:`, stdout);
      if (stderr) console.warn(`[SSL Service] Certbot warnings for ${cleanDomain}:`, stderr);

      if (!isLinux) {
        throw new Error("Certbot cannot be run on non-Linux OS");
      }

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
      // Strictly fail without mocks in production per requirements
      throw new Error(`SSL Provisioning failed: ${err.message}`);
    }
  }
}

module.exports = new SslService();
