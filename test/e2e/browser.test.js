const { expect } = require('chai');
const puppeteer = require('puppeteer');
const { app, exchangeRateEURtoUSD, exchangeRateUSDtoGBP } = require('../../app');

describe('Currency Converter E2E Tests', function() {
  // Increase timeout for E2E tests
  this.timeout(10000);
  
  let browser;
  let page;
  let server;
  const testPort = 3002;
  const baseUrl = `http://localhost:${testPort}`;
  
  // Set up test environment before tests
  before(async function() {
    // Start the server
    server = app.listen(testPort, () => {
      console.log(`E2E test server running on port ${testPort}`);
    });
    
    // Launch browser
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    // Create new page
    page = await browser.newPage();
  });
  
  // Clean up after tests
  after(async function() {
    // Close browser
    if (browser) {
      await browser.close();
    }
    
    // Close server
    if (server) {
      server.close(() => {
        console.log('E2E test server closed');
      });
    }
  });
  
  describe('Currency Converter UI', function() {
    it('should load the currency converter page', async function() {
      await page.goto(baseUrl, { waitUntil: 'networkidle0' });
      
      const title = await page.title();
      expect(title).to.equal('Convertisseur de devises');
      
      // Check if both converters are present
      const eurConverterExists = await page.evaluate(() => {
        return document.querySelector('h1')?.innerText.includes('EUR → USD');
      });
      
      const usdConverterExists = await page.evaluate(() => {
        return document.querySelectorAll('h1')[1]?.innerText.includes('USD → GBP');
      });
      
      expect(eurConverterExists).to.be.true;
      expect(usdConverterExists).to.be.true;
    });
    
    it('should convert EUR to USD correctly', async function() {
      await page.goto(baseUrl, { waitUntil: 'networkidle0' });
      
      // Input EUR amount
      const euroAmount = 100;
      await page.evaluate((amount) => {
        document.getElementById('eurAmount').value = amount;
      }, euroAmount);
      
      // Click convert button
      await page.click('button[onclick^="convertEURtoUSD"]');
      
      // Wait for result
      await page.waitForFunction(() => {
        return document.getElementById('resultEUR').innerText !== '';
      });
      
      // Check result
      const expectedDollars = euroAmount * exchangeRateEURtoUSD;
      const resultText = await page.evaluate(() => {
        return document.getElementById('resultEUR').innerText;
      });
      
      expect(resultText).to.equal(`${euroAmount} EUR = ${expectedDollars.toFixed(2)} USD`);
    });
    
    it('should convert USD to GBP correctly', async function() {
      await page.goto(baseUrl, { waitUntil: 'networkidle0' });
      
      // Input USD amount
      const dollarAmount = 100;
      await page.evaluate((amount) => {
        document.getElementById('usdAmount').value = amount;
      }, dollarAmount);
      
      // Click convert button
      await page.click('button[onclick^="convertUSDtoGBP"]');
      
      // Wait for result
      await page.waitForFunction(() => {
        return document.getElementById('resultUSD').innerText !== '';
      });
      
      // Check result
      const expectedPounds = dollarAmount * exchangeRateUSDtoGBP;
      const resultText = await page.evaluate(() => {
        return document.getElementById('resultUSD').innerText;
      });
      
      expect(resultText).to.equal(`${dollarAmount} USD = ${expectedPounds.toFixed(2)} GBP`);
    });
    
    it('should show error for negative EUR amount', async function() {
      await page.goto(baseUrl, { waitUntil: 'networkidle0' });
      
      // Input negative EUR amount
      await page.evaluate(() => {
        document.getElementById('eurAmount').value = -50;
      });
      
      // Click convert button
      await page.click('button[onclick^="convertEURtoUSD"]');
      
      // Wait for result
      await page.waitForFunction(() => {
        return document.getElementById('resultEUR').innerText !== '';
      });
      
      // Check error message
      const resultText = await page.evaluate(() => {
        return document.getElementById('resultEUR').innerText;
      });
      
      expect(resultText).to.include('Erreur');
    });
    
    it('should show error for negative USD amount', async function() {
      await page.goto(baseUrl, { waitUntil: 'networkidle0' });
      
      // Input negative USD amount
      await page.evaluate(() => {
        document.getElementById('usdAmount').value = -50;
      });
      
      // Click convert button
      await page.click('button[onclick^="convertUSDtoGBP"]');
      
      // Wait for result
      await page.waitForFunction(() => {
        return document.getElementById('resultUSD').innerText !== '';
      });
      
      // Check error message
      const resultText = await page.evaluate(() => {
        return document.getElementById('resultUSD').innerText;
      });
      
      expect(resultText).to.include('Erreur');
    });
  });
});
