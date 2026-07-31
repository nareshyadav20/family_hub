const assert = require('assert');
const dnsVerificationService = require('../src/services/dnsVerificationService');
const domainPurchaseService = require('../src/services/domainPurchaseService');
const { CreateFamilySchema } = require('../src/dtos/domainDto');

async function runTests() {
  console.log('🧪 [Unit Tests] Running Domain Management Unit Tests...');

  // Test 1: Zod RFC domain validation
  const validData = {
    familyName: 'Smith Family',
    admin: {
      firstName: 'John',
      lastName: 'Smith',
      email: 'john@smithfamily.com',
      password: 'Password123!'
    },
    domain: {
      rootDomain: 'smithfamily.com',
      ownershipType: 'FAMILY_OWNED'
    }
  };

  const parsed = CreateFamilySchema.safeParse(validData);
  assert.strictEqual(parsed.success, true, 'Valid family data should pass Zod schema parsing');

  const invalidDomainData = {
    ...validData,
    domain: { rootDomain: 'invalid_domain_format' }
  };
  const invalidParsed = CreateFamilySchema.safeParse(invalidDomainData);
  assert.strictEqual(invalidParsed.success, false, 'Invalid domain format should fail Zod schema parsing');

  console.log('✓ Zod DTO Domain Validation Test Passed');

  // Test 2: Domain Search Availability
  const searchResult = await domainPurchaseService.searchDomainAvailability('smithfamilytest123.com');
  assert.strictEqual(searchResult.available, true);
  assert.strictEqual(searchResult.purchasePrice, 12.99);

  console.log('✓ Domain Search Availability Test Passed');
  console.log('✅ ALL DOMAIN MANAGEMENT UNIT TESTS PASSED!');
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
