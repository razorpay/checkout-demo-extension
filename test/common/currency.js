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

test('common/currency', (t) => {
  test('Formats amount with symbol correctly', function (t) {
    t.equal(formatAmountWithSymbol(12345, 'USD'), '$ 123.45');
    t.end();
  });

  test('Updates additional currencies and formats amount correctly', function (t) {
    updateCurrencies(additionalCurrencies);

    t.equal(formatAmountWithSymbol(12345, 'RZP'), 'RZP 12.345');
    t.end();
  });

  t.end();
});
