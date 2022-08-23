const makeOptionsAndPreferences = require('../options/index.js');
const {
  openCheckoutWithNewHomeScreen,
} = require('../../tests/homescreen/open');
const { getTestData } = require('../../actions');
const { delay, assertVisible, assertHidden } = require('../../util.js');
const { scrollToEnd } = require('../../actions/one-click-checkout/common.js');
const {
  openMerchantPolicyTab,
} = require('../../actions/one-click-checkout/account-tab');

module.exports = function (testFeatures) {
  const { features, preferences, options, title } = makeOptionsAndPreferences(
    'one-click-checkout',
    testFeatures
  );

  describe.each(
    getTestData(title, {
      ...features,
      options,
      preferences,
    })
  )('Checkout Merchant Policy test', ({ preferences, title, options }) => {
    test(title, async () => {
      const context = await openCheckoutWithNewHomeScreen({
        page,
        options,
        preferences,
      });
      const screenEle = await context.page.waitForSelector('.screen-comp');
      await scrollToEnd(context, screenEle);
      await delay(1700);
      await scrollToEnd(context, screenEle);
      await delay(1000);
      if (preferences.merchant_policy) {
        await openMerchantPolicyTab(context);
        await delay(1000);
        await assertVisible('.merchant-iframe');
      } else {
        await delay(1000);
        await assertHidden('[data-test-id="merchant-policy-tab-btn"]');
      }
    });
  });
};
