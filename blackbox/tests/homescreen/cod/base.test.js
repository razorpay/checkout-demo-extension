const createCODTest = require('../../../create/one-click-checkout/cod');

// COD and ThirdWatch eligible
createCODTest({
  amount: 200 * 100,
  serviceable: true,
  codFee: 50 * 100,
  isCODEligible: true,
  saveAddress: false,
  isThirdWatchEligible: true,
});
