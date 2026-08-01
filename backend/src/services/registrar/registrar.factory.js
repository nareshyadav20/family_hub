const GoDaddyAdapter = require('./godaddy.adapter');
// const CloudflareAdapter = require('./cloudflare.adapter');
// const NamecheapAdapter = require('./namecheap.adapter');
// const Route53Adapter = require('./route53.adapter');
// const HostingerAdapter = require('./hostinger.adapter');

class RegistrarFactory {
  static getAdapter(providerName) {
    switch (providerName?.toLowerCase()) {
      case 'godaddy':
        return new GoDaddyAdapter();
      // case 'cloudflare':
      //   return new CloudflareAdapter();
      // case 'namecheap':
      //   return new NamecheapAdapter();
      // case 'route53':
      //   return new Route53Adapter();
      // case 'hostinger':
      //   return new HostingerAdapter();
      default:
        // Defaulting to GoDaddy for now
        return new GoDaddyAdapter();
    }
  }
}

module.exports = RegistrarFactory;
