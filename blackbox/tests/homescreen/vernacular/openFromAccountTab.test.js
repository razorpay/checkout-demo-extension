const createVernacularTest = require('../../../create/one-click-checkout/vernacular');

// [Not Working] Open Vernacular from Account Tab and select Hindi
createVernacularTest({
  amount: 200 * 100,
  openFromAccountTab: true,
  languageToTest: 'हिंदी',
});
