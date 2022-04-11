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
  login,
  handleUpdateOrderReq,
  handleThirdWatchReq,
  handleFeeSummary,
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
  selectPaymentMethod,
} = require('../../tests/homescreen/homeActions.js');
const {
  selectBank,
  handleMockSuccessDialog,
} = require('../../actions/shared-actions.js');
const { passRequestNetbanking } = require('../../actions/common.js');

module.exports = function (testFeatures) {
  const { features, preferences, options, title } = makeOptionsAndPreferences(
    'one-click-checkout',
    testFeatures
  );

  const { closeModalOnBack, closeModalOnCross } = features;

  describe.each(
    getTestData(title, {
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

      await login(context);
      await assertAddressTab(context);
      await goBack(context);
      await assertSummaryTab(context);
      await handleAvailableCouponReq(context);
      await proceedOneCC(context);

      await handleUpdateOrderReq(context, options.order_id);
      await handleThirdWatchReq(context);
      await delay(200);
      await handleFeeSummary(context, features);
      await assertPaymentsTab(context);

      await selectPaymentMethod(context, 'netbanking');
      await selectBank(context, 'SBIN');
      await proceedOneCC(context);

      await passRequestNetbanking(context);
      await handleMockSuccessDialog(context);
    });
  });
};
