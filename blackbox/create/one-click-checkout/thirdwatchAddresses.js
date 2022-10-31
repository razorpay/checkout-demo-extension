const makeOptionsAndPreferences = require('../options/index.js');
const {
  openCheckoutWithNewHomeScreen,
} = require('../../tests/homescreen/open');
const { getTestData } = require('../../actions');
const {
  handleCustomerStatusReq,
  handleCreateOTPReq,
  handleTypeOTP,
  handleVerifyOTPReq,
  proceedOneCC,
  mockPaymentSteps,
  handleShippingInfo,
} = require('../../actions/one-click-checkout/common');
const {
  fillUserDetails,
} = require('../../tests/homescreen/userDetailsActions');
const { delay } = require('../../util');
const {
  assertConsentModalVisible,
  submitOnConsentModal,
  handleConsentViewApiCall,
  assertConsentBannerVisible,
  navigateToAddressScreen,
  fetchThirdwatchAddresses,
  handleConsentUpdateApiCall,
  assertAddressList,
  assertConsentBannerNotVisible,
} = require('../../actions/one-click-checkout/thirdwatchAddresses.js');
const twAddresses = require('../../data/one-click-checkout/tw_addresses.json');
const addresses = require('../../data/one-click-checkout/addresses.json');

/**
 * @param {*} testFeatures
 * @param {*} testFeatures.loggedIn to generate a pre-loggedIn flow
 * @param {*} testFeatures.skipAccessOTP skip OTP to access savedAddresses
 *
 */
module.exports = function (testFeatures, methods = ['upi', 'card', 'cod']) {
  const { features, preferences, options, title } = makeOptionsAndPreferences(
    'one-click-checkout',
    testFeatures
  );
  const { loggedIn, consentBannerViews, addressConsentGiven } = features;

  describe.each(
    getTestData(title, {
      ...features,
      options,
      preferences,
      addresses,
      methods,
    })
  )('One Click Checkout Address test', ({ preferences, title, options }) => {
    test(title, async () => {
      preferences.methods.upi = true;

      const context = await openCheckoutWithNewHomeScreen({
        page,
        options,
        preferences,
      });
      await delay(500);

      if (loggedIn) {
        await handleShippingInfo(context, {
          isCODEligible: true,
          serviceable: true,
          codFee: 0,
          shippingFee: 0,
          zipcode: '560001',
        });
        await navigateToAddressScreen(context);
        if (addressConsentGiven) {
          await assertConsentBannerNotVisible(context);
          return;
        }
        await handleConsentViewApiCall(context);
        await assertConsentBannerVisible(context);

        await fetchThirdwatchAddresses(context);
        await handleConsentUpdateApiCall(context);
        await assertAddressList(context, addresses);
        await handleShippingInfo(context, {
          isCODEligible: true,
          serviceable: true,
          codFee: 0,
          shippingFee: 0,
          zipcode: '560002',
        });
      } else {
        await fillUserDetails(context);
        await proceedOneCC(context);
        await handleCustomerStatusReq(context, false, consentBannerViews);
        await assertConsentModalVisible(context);
        await submitOnConsentModal(context);

        handleConsentViewApiCall(context);
        handleCreateOTPReq(context);
        await delay(200);
        await handleTypeOTP(context);
        await delay(200);
        await proceedOneCC(context);
        await handleVerifyOTPReq(context, false, { addresses: twAddresses });
        await handleShippingInfo(context, {
          isCODEligible: true,
          serviceable: true,
          codFee: 0,
          shippingFee: 0,
          zipcode: '560002',
        });
      }
      await delay(200);
      await proceedOneCC(context);

      await mockPaymentSteps(context, options, features);
    });
  });
};
