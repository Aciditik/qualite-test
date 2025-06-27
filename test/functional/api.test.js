const { expect } = require('chai');
const http = require('http');
const { app, exchangeRateEURtoUSD, exchangeRateUSDtoGBP } = require('../../app');

describe('Currency Conversion API', function() {
  let server;
  const testPort = 3001;
  
  // Set up test server before tests
  before(function(done) {
    server = app.listen(testPort, () => {
      console.log(`Test server running on port ${testPort}`);
      done();
    });
  });
  
  // Close test server after tests
  after(function(done) {
    server.close(() => {
      console.log('Test server closed');
      done();
    });
  });
  
  // Helper function to make HTTP requests
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
  
  describe('EUR to USD Conversion Endpoint', function() {
    it('should convert EUR to USD correctly', async function() {
      const euroAmount = 100;
      const expectedDollars = euroAmount * exchangeRateEURtoUSD;
      
      const response = await makeRequest(`/convert-eur-to-usd?eur=${euroAmount}`);
      expect(response.statusCode).to.equal(200);
      expect(response.data).to.equal(`${euroAmount} EUR = ${expectedDollars.toFixed(2)} USD`);
    });
    
    it('should return 400 for negative EUR amount', async function() {
      const response = await makeRequest('/convert-eur-to-usd?eur=-50');
      expect(response.statusCode).to.equal(400);
      expect(response.data).to.include('Montant invalide');
    });
    
    it('should return 400 for non-numeric EUR amount', async function() {
      const response = await makeRequest('/convert-eur-to-usd?eur=abc');
      expect(response.statusCode).to.equal(400);
      expect(response.data).to.include('Montant invalide');
    });
  });
  
  describe('USD to GBP Conversion Endpoint', function() {
    it('should convert USD to GBP correctly', async function() {
      const dollarAmount = 100;
      const expectedPounds = dollarAmount * exchangeRateUSDtoGBP;
      
      const response = await makeRequest(`/convert-usd-to-gbp?usd=${dollarAmount}`);
      expect(response.statusCode).to.equal(200);
      expect(response.data).to.equal(`${dollarAmount} USD = ${expectedPounds.toFixed(2)} GBP`);
    });
    
    it('should return 400 for negative USD amount', async function() {
      const response = await makeRequest('/convert-usd-to-gbp?usd=-50');
      expect(response.statusCode).to.equal(400);
      expect(response.data).to.include('Montant invalide');
    });
    
    it('should return 400 for non-numeric USD amount', async function() {
      const response = await makeRequest('/convert-usd-to-gbp?usd=abc');
      expect(response.statusCode).to.equal(400);
      expect(response.data).to.include('Montant invalide');
    });
  });
  
  describe('Root Endpoint', function() {
    it('should return HTML with currency converters', async function() {
      const response = await makeRequest('/');
      expect(response.statusCode).to.equal(200);
      expect(response.data).to.include('Convertisseur de devises');
      expect(response.data).to.include('Convertisseur EUR → USD');
      expect(response.data).to.include('Convertisseur USD → GBP');
    });
  });
});
