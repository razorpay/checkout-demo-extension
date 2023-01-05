const createCODTest = require('../../../create/one-click-checkout/cod');

// Restrict COD on Gift Card
createCODTest({
  amount: 200 * 100,
  serviceable: true,
  codFee: 50 * 100,
  isCODEligible: true,
  saveAddress: false,
  isThirdWatchEligible: true,
  singleGC: true,
  restrictCOD: true,
});
