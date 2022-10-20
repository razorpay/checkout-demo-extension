const createCODTest = require('../../../create/one-click-checkout/cod');

// case: Magic Intelligence/TW Feature Disabled
createCODTest({
  amount: 200 * 100,
  serviceable: true,
  isCODEligible: true,
  saveAddress: false,
  twDisabled: true,
});

createCODTest({
  amount: 200 * 100,
  serviceable: true,
  isCODEligible: false,
  saveAddress: false,
  twDisabled: true,
});
