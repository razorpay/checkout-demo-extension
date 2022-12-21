import { formatAmountWithSymbol, updateCurrencies } from 'common/currency';

const additionalCurrencies = {
  // This is an additional currency that can be added during runtime.
  // updateCurrencies method should add this in the hardcoded currencies list.
  RZP: {
    code: '5',
    denomination: 1000,
    min_value: 1000,
    min_auth_value: 100,
    symbol: 'RZP',
    name: 'Razorpay Currency',
  },
};

describe('common/currency', () => {
  test('Formats amount with symbol correctly', function () {
    expect(formatAmountWithSymbol(12345, 'USD')).toBe('$ 123.45');
  });

  test('Formats amount with symbol correctly for MYR', function () {
    expect(formatAmountWithSymbol(10000000, 'MYR')).toBe('RM 1,00,000.00');
  });

  test('Updates additional currencies and formats amount correctly', function () {
    updateCurrencies(additionalCurrencies);

    expect(formatAmountWithSymbol(12345, 'RZP')).toBe('RZP 12.345');
  });
});
