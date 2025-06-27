const { expect } = require('chai');
const { exchangeRateEURtoUSD, exchangeRateUSDtoGBP } = require('../../app');

describe('Currency Conversion Constants', () => {
  it('should have a valid EUR to USD exchange rate', () => {
    expect(exchangeRateEURtoUSD).to.be.a('number');
    expect(exchangeRateEURtoUSD).to.be.greaterThan(0);
  });

  it('should have a valid USD to GBP exchange rate', () => {
    expect(exchangeRateUSDtoGBP).to.be.a('number');
    expect(exchangeRateUSDtoGBP).to.be.greaterThan(0);
  });
});

// Helper functions to test the conversion logic
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

describe('Currency Conversion Functions', () => {
  describe('convertEURtoUSD', () => {
    it('should convert EUR to USD correctly', () => {
      const euroAmount = 100;
      const expectedDollars = euroAmount * exchangeRateEURtoUSD;
      expect(convertEURtoUSD(euroAmount)).to.equal(expectedDollars);
    });

    it('should throw error for negative EUR amount', () => {
      expect(() => convertEURtoUSD(-50)).to.throw('Invalid amount');
    });

    it('should throw error for non-numeric EUR amount', () => {
      expect(() => convertEURtoUSD('abc')).to.throw('Invalid amount');
    });
  });

  describe('convertUSDtoGBP', () => {
    it('should convert USD to GBP correctly', () => {
      const dollarAmount = 100;
      const expectedPounds = dollarAmount * exchangeRateUSDtoGBP;
      expect(convertUSDtoGBP(dollarAmount)).to.equal(expectedPounds);
    });

    it('should throw error for negative USD amount', () => {
      expect(() => convertUSDtoGBP(-50)).to.throw('Invalid amount');
    });

    it('should throw error for non-numeric USD amount', () => {
      expect(() => convertUSDtoGBP('abc')).to.throw('Invalid amount');
    });
  });
});
