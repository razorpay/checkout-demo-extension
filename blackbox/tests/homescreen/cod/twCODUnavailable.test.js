const createCODTest = require('../../../create/one-click-checkout/cod');

// COD and ThirdWatch unavailable
createCODTest({
  amount: 200 * 100,
  isCODEligible: false,
  serviceable: true,
  codFee: 50 * 100,
  saveAddress: false,
  isThirdWatchEligible: false,
});
