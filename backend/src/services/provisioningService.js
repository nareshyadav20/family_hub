const dns = require('dns').promises;
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const prisma = require('../../prismaClient');

// The IP address of this server that domains should point to.
const SERVER_IP = process.env.SERVER_PUBLIC_IP || '13.204.75.91'; 
const LOG_FILE_PATH = '/var/log/domain-provisioning.log';

// Helper for DB and File logging
async function dbLog(domainId, step, status, message) {
  try {
    // 1. Database Logging
    await prisma.provisioningLog.create({
      data: { domainId, step, status, message: message || '' }
    });

    // 2. File Logging
    const timestamp = new Date().toISOString();
    const logLine = `[${timestamp}] [DomainId: ${domainId}] [${step}] [${status}] - ${message}\n`;
    try {
      fs.appendFileSync(LOG_FILE_PATH, logLine);
    } catch (fsErr) {
      // Fail silently for local windows dev if path doesn't exist, but log to console
      console.warn(`[File Log] Could not write to ${LOG_FILE_PATH}: ${fsErr.message}`);
    }
  } catch (err) {
    console.error(`[ProvisioningService] Failed to write ProvisioningLog:`, err.message);
  }
}

/**
 * Validates domain string format
 */
function isValidDomainFormat(domain) {
  const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i;
  return domainRegex.test(domain);
}

/**
 * Verifies DNS records for the domain.
 * Supports A, AAAA, and CNAME.
 */
async function verifyDNS(domain) {
  try {
    // 1. Try A record
    try {
      const aRecords = await dns.resolve4(domain);
      if (aRecords.includes(SERVER_IP)) return true;
    } catch (e) { /* ignore */ }

    // 2. Try AAAA record (if server has IPv6)
    const SERVER_IPV6 = process.env.SERVER_IPV6;
    if (SERVER_IPV6) {
      try {
        const aaaaRecords = await dns.resolve6(domain);
        if (aaaaRecords.includes(SERVER_IPV6)) return true;
      } catch (e) { /* ignore */ }
    }

    // 3. Try CNAME record
    try {
      const cnameRecords = await dns.resolveCname(domain);
      // Usually CNAME points to main domain (e.g. careertransform.in) which resolves to SERVER_IP
      if (cnameRecords.length > 0) {
        // Resolve the CNAME target
        const targetA = await dns.resolve4(cnameRecords[0]);
        if (targetA.includes(SERVER_IP)) return true;
      }
    } catch (e) { /* ignore */ }

    return false;
  } catch (error) {
    throw new Error(`DNS verification failed: ${error.message}`);
  }
}

/**
 * Process a single domain provisioning workflow.
 */
async function processDomain(domainData) {
  const { id, domainName } = domainData;

  // 0. Regex Validation
  await dbLog(id, 'VALIDATION', 'PENDING', `Validating domain format for ${domainName}`);
  if (!isValidDomainFormat(domainName)) {
    await prisma.familyDomain.update({
      where: { id },
      data: {
        provisioningStatus: 'FAILED',
        errorCode: 'INVALID_DOMAIN_FORMAT',
        errorMessage: `Domain name format is invalid: ${domainName}`
      }
    });
    await dbLog(id, 'VALIDATION', 'FAILED', `Invalid domain format`);
    throw new Error('INVALID_DOMAIN_FORMAT');
  }
  await dbLog(id, 'VALIDATION', 'SUCCESS', `Domain format is valid`);

  // 1. DNS Verification
  await dbLog(id, 'DNS_CHECK', 'PENDING', `Verifying DNS for ${domainName}`);
  const dnsValid = await verifyDNS(domainName);
  
  if (!dnsValid) {
    await prisma.familyDomain.update({
      where: { id },
      data: {
        provisioningStatus: 'DNS_PENDING',
        errorCode: 'DNS_NOT_CONFIGURED',
        errorMessage: `DNS for ${domainName} does not point to ${SERVER_IP}`
      }
    });
    await dbLog(id, 'DNS_CHECK', 'FAILED', `Expected IP ${SERVER_IP} not found in A/CNAME records.`);
    throw new Error('DNS_NOT_CONFIGURED');
  }
  await dbLog(id, 'DNS_CHECK', 'SUCCESS', `DNS points to correct IP`);

  // 2. Execute Provisioning Script
  await dbLog(id, 'BASH_SCRIPT', 'PENDING', 'Starting provision-domain.sh');

  return new Promise((resolve, reject) => {
    // Determine script path (using the one in our local structure)
    const scriptPath = path.resolve(__dirname, '../../../scripts/provision-domain.sh');
    
    // Spawn the script with the domain name as an argument
    const provisionProcess = spawn('bash', [scriptPath, domainName]);

    let stdoutData = '';
    let stderrData = '';

    provisionProcess.stdout.on('data', (data) => {
      stdoutData += data.toString();
    });

    provisionProcess.stderr.on('data', (data) => {
      stderrData += data.toString();
    });

    provisionProcess.on('close', async (code) => {
      console.log(`[ProvisioningService] Script exited with code ${code}`);
      
      const fullLog = `STDOUT:\n${stdoutData}\nSTDERR:\n${stderrData}`;
      
      if (code === 0) {
        // Success
        await prisma.familyDomain.update({
          where: { id },
          data: {
            provisioningStatus: 'ACTIVE',
            provisionCompletedAt: new Date(),
            errorCode: null,
            errorMessage: null
          }
        });
        await dbLog(id, 'BASH_SCRIPT', 'SUCCESS', 'Provisioning completed successfully');
        resolve(true);
      } else {
        // Handle failure codes
        let errorStatus = 'FAILED';
        let errorCodeStr = 'UNKNOWN_ERROR';
        
        switch (code) {
          case 10: errorCodeStr = 'INVALID_DOMAIN'; break;
          case 11: errorCodeStr = 'DNS_NOT_CONFIGURED'; break;
          case 12: errorCodeStr = 'DNS_LOOKUP_FAILED'; break;
          case 13: errorCodeStr = 'TEMPLATE_FAILED'; break;
          case 14: errorCodeStr = 'ENABLE_SITE_FAILED'; break;
          case 15: errorCodeStr = 'NGINX_TEST_FAILED'; break;
          case 16: errorCodeStr = 'SSL_CERT_FAILED'; break;
          case 17: errorCodeStr = 'NGINX_RELOAD_FAILED'; break;
          case 18: 
            errorCodeStr = 'ROLLBACK_FAILED'; 
            errorStatus = 'ROLLBACK_FAILED';
            break;
          default: errorCodeStr = `EXIT_CODE_${code}`; break;
        }

        await prisma.familyDomain.update({
          where: { id },
          data: {
            provisioningStatus: errorStatus,
            provisionCompletedAt: new Date(),
            errorCode: errorCodeStr,
            errorMessage: `Script failed with code ${code}. Check logs.`
          }
        });
        
        await dbLog(id, 'BASH_SCRIPT', 'FAILED', fullLog.substring(0, 4000)); // Store truncated logs
        reject(new Error(errorCodeStr));
      }
    });
  });
}

module.exports = {
  processDomain,
  verifyDNS
};
