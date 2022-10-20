const createTwAddressTest = require('../../../create/one-click-checkout/thirdwatchAddresses');

// Test case: Select address from save addresses.
createTwAddressTest({
  amount: 200 * 100,
  addressConsentGiven: true,
  consentBannerViews: 0,
  loggedIn: true,
  anon: false,
});
