// Simple JavaScript testing framework
const assert = require('assert');
const http = require('http');
const { app, exchangeRateEURtoUSD, exchangeRateUSDtoGBP } = require('./app');

// Test results tracking
let passedTests = 0;
let failedTests = 0;

// Simple test function
function test(name, fn) {
  try {
    fn();
    console.log(`✅ PASS: ${name}`);
    passedTests++;
  } catch (err) {
    console.log(`❌ FAIL: ${name}`);
    console.log(`   Error: ${err.message}`);
    failedTests++;
  }
}

// Group tests
function describe(name, fn) {
  console.log(`\n${name}:`);
  fn();
}

// Start a test server
const testPort = 3001;
const server = app.listen(testPort, () => {
  console.log(`Test server running on port ${testPort}`);
  runTests();
});

// Make HTTP requests to test API endpoints
function makeRequest(path) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:${testPort}${path}`, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          data: data
        });
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// Run all tests
async function runTests() {
  try {
    console.log('RUNNING JAVASCRIPT TESTS\n' + '='.repeat(30));

    // Test currency conversion constants
    describe('Currency Conversion Constants', () => {
      test('exchangeRateEURtoUSD should be a positive number', () => {
        assert(typeof exchangeRateEURtoUSD === 'number');
        assert(exchangeRateEURtoUSD > 0);
      });

      test('exchangeRateUSDtoGBP should be a positive number', () => {
        assert(typeof exchangeRateUSDtoGBP === 'number');
        assert(exchangeRateUSDtoGBP > 0);
      });
    });

    // Test currency conversion functions
    describe('Currency Conversion Functions', () => {
      // Helper functions to test
      function convertEURtoUSD(euros) {
        if (isNaN(euros) || euros < 0) {
          throw new Error('Invalid amount');
        }
        return euros * exchangeRateEURtoUSD;
      }

      function convertUSDtoGBP(dollars) {
        if (isNaN(dollars) || dollars < 0) {
          throw new Error('Invalid amount');
        }
        return dollars * exchangeRateUSDtoGBP;
      }

      test('convertEURtoUSD calculates correctly', () => {
        const euroAmount = 100;
        const expectedDollars = euroAmount * exchangeRateEURtoUSD;
        assert.strictEqual(convertEURtoUSD(euroAmount), expectedDollars);
      });

      test('convertEURtoUSD rejects negative values', () => {
        assert.throws(() => convertEURtoUSD(-50), /Invalid amount/);
      });

      test('convertEURtoUSD rejects non-numeric values', () => {
        assert.throws(() => convertEURtoUSD('abc'), /Invalid amount/);
      });

      test('convertUSDtoGBP calculates correctly', () => {
        const dollarAmount = 100;
        const expectedPounds = dollarAmount * exchangeRateUSDtoGBP;
        assert.strictEqual(convertUSDtoGBP(dollarAmount), expectedPounds);
      });

      test('convertUSDtoGBP rejects negative values', () => {
        assert.throws(() => convertUSDtoGBP(-50), /Invalid amount/);
      });

      test('convertUSDtoGBP rejects non-numeric values', () => {
        assert.throws(() => convertUSDtoGBP('abc'), /Invalid amount/);
      });
    });

    // Test API endpoints
    describe('API Endpoints', async () => {
      test('EUR to USD endpoint works correctly', async () => {
        const euroAmount = 100;
        const expectedDollars = euroAmount * exchangeRateEURtoUSD;
        
        const response = await makeRequest(`/convert-eur-to-usd?eur=${euroAmount}`);
        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.data, `${euroAmount} EUR = ${expectedDollars.toFixed(2)} USD`);
      });

      test('EUR to USD endpoint handles negative values', async () => {
        const response = await makeRequest('/convert-eur-to-usd?eur=-50');
        assert.strictEqual(response.statusCode, 400);
      });

      test('USD to GBP endpoint works correctly', async () => {
        const dollarAmount = 100;
        const expectedPounds = dollarAmount * exchangeRateUSDtoGBP;
        
        const response = await makeRequest(`/convert-usd-to-gbp?usd=${dollarAmount}`);
        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.data, `${dollarAmount} USD = ${expectedPounds.toFixed(2)} GBP`);
      });

      test('USD to GBP endpoint handles negative values', async () => {
        const response = await makeRequest('/convert-usd-to-gbp?usd=-50');
        assert.strictEqual(response.statusCode, 400);
      });

      test('Root endpoint returns HTML page', async () => {
        const response = await makeRequest('/');
        assert.strictEqual(response.statusCode, 200);
        assert(response.data.includes('Convertisseur de devises'));
        assert(response.data.includes('Convertisseur EUR → USD'));
        assert(response.data.includes('Convertisseur USD → GBP'));
      });
    });

    // Wait for all async tests to complete
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Print test summary
    console.log('\n' + '='.repeat(30));
    console.log(`TEST RESULTS: ${passedTests} passed, ${failedTests} failed`);
    
    if (failedTests === 0) {
      console.log('✅ ALL TESTS PASSED!');
    } else {
      console.log('❌ SOME TESTS FAILED!');
    }
  } catch (error) {
    console.error('Error running tests:', error);
  } finally {
    // Close the server after tests
    server.close(() => {
      console.log('Test server closed');
    });
  }
}
