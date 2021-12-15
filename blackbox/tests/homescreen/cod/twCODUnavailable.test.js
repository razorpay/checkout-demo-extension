const createCODTest = require('../../../create/one-click-checkout/cod');

createCODTest({
  amount: 200 * 100,
  isCODEligible: false,
  serviceable: true,
  codFee: 50 * 100,
  isSaveAddress: false,
  isThirdWatchEligible: false,
});
