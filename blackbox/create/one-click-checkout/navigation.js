const makeOptionsAndPreferences = require('../options/index.js');
const {
  openCheckoutWithNewHomeScreen,
} = require('../../tests/homescreen/open');
const { getTestData } = require('../../actions');
const {
  handleAvailableCouponReq,
} = require('../../actions/one-click-checkout/coupons');
const {
  goBack,
  closeModal,
  proceedOneCC,
  mockPaymentSteps,
  handleUpdateOrderReq,
} = require('../../actions/one-click-checkout/common.js');
const {
  confirmModalClose,
  assertModalClose,
  assertAddressTab,
  assertSummaryTab,
  assertPaymentsTab,
} = require('../../actions/one-click-checkout/navigation');
const { delay } = require('../../util.js');
const {
  fillUserAddress,
} = require('../../actions/one-click-checkout/address.js');

module.exports = function (testFeatures) {
  const { features, preferences, options, title } = makeOptionsAndPreferences(
    'one-click-checkout',
    testFeatures
  );

  const { closeModalOnBack, closeModalOnCross } = features;

  describe.each(
    getTestData(title, {
      ...features,
      options,
      preferences,
    })
  )('One Click Checkout Navigation test', ({ preferences, title, options }) => {
    test(title, async () => {
      const context = await openCheckoutWithNewHomeScreen({
        page,
        options,
        preferences,
      });

      await handleAvailableCouponReq(context);
      if (closeModalOnBack || closeModalOnCross) {
        if (closeModalOnBack) await goBack(context);
        else await closeModal(context);
        await confirmModalClose(context);
        await delay(600);
        await assertModalClose(context);
        return;
      }

      await assertSummaryTab(context);
      await proceedOneCC(context);

      await assertAddressTab(context);
      await fillUserAddress(context, {
        isSaveAddress: false,
        serviceable: true,
      });
      await proceedOneCC(context);
      await handleUpdateOrderReq(context, options.order_id);

      await assertPaymentsTab(context);
      await mockPaymentSteps(context, options, features, false);
    });
  });
};
