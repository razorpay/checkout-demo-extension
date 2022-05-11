const createCODTest = require('../../../create/one-click-checkout/cod');

// COD unavailable and ThirdWatch eligible
createCODTest({
  amount: 200 * 100,
  isCODEligible: false,
  serviceable: true,
  codFee: 50 * 100,
  saveAddress: false,
  isThirdWatchEligible: true,
});
