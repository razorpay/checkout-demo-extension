const createVernacularTest = require('../../../create/one-click-checkout/vernacular');

// Open Vernacular from Header and select Hindi
createVernacularTest({
  amount: 200 * 100,
  openFromHeader: true,
  languageToTest: 'हिंदी',
});
