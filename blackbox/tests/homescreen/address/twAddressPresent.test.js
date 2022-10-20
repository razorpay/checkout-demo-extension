const createTwAddressTest = require('../../../create/one-click-checkout/thirdwatchAddresses');

// Test case: Select address from save addresses.
createTwAddressTest({
  amount: 200 * 100,
  consentBannerViews: 1,
});
