const createCODTest = require('../../../create/one-click-checkout/cod');

createCODTest({
  amount: 200 * 100,
  serviceable: true,
  codFee: 50 * 100,
  isCODEligible: true,
  saveAddress: false,
  isThirdWatchEligible: true,
  callbackUrl: true,
});
