const makeOptionsAndPreferences = require('./options/index.js');
const { openCheckoutWithNewHomeScreen } = require('../tests/homescreen/open');
const { getTestData } = require('../actions');
const { delay, assertVisible } = require('../util.js');
const {
  submit,
  handleMockSuccessDialog,
} = require('../actions/shared-actions');
const {
  handleCardValidation,
  assertSaveCardCheckbox,
} = require('../actions/common');

module.exports = function (testFeatures) {
  const { features, preferences, options, title } = makeOptionsAndPreferences(
    'cards',
    testFeatures
  );

  describe.each(
    getTestData(title, {
      ...features,
      options,
      preferences,
    })
  )(' Test Malaysia Cards flow', ({ preferences, title, options }) => {
    test(title, async () => {
      preferences.merchant_country = 'MY';
      preferences.merchant_currency = 'MYR';
      preferences.order = {
        partial_payment: false,
        amount: 20000,
        currency: 'MYR',
        amount_paid: 0,
        amount_due: 20000,
        first_payment_min_amount: null,
      };
      preferences.experiments = {
        checkout_redesign_v1_5: true,
        banking_redesign_v15: true,
      };

      const context = await openCheckoutWithNewHomeScreen({
        page,
        options,
        preferences,
      });

      let email = 'harshil@razorpay.com';
      let contactToType = '+60132758793';
      const contactDropdown = await context.page.waitForSelector(
        '#country-code'
      );
      await contactDropdown.click();
      await delay(200);

      // pick MY dial code
      await context.page.click(`[id*=_MY_]`);
      await delay(200);

      await context.page.type('#contact', contactToType);
      await delay(200);

      await context.page.type('#email', email);
      await delay(1000);

      const footerCta = await context.page.waitForSelector('#redesign-v15-cta');
      await footerCta.click();

      // cards methods should be available
      await assertVisible('[method=card]');
      await delay(200);

      const cardsMethod = await context.page.waitForSelector('[method=card]');
      await cardsMethod.click();

      // card saving should be disabled
      assertSaveCardCheckbox(context, false);

      const cardNumber = '5453010000095323';
      await context.page.type('#card_number', cardNumber);
      await delay(1000);

      async function respondToIin(context) {
        await context.expectRequest((req) => {});

        const response = { http_status_code: 200 };
        const flows = {
          iframe: true,
        };

        response.flows = flows;

        await context.respondJSONP(response);
      }

      await context.getRequest(`/v1/payment/iin`);
      await respondToIin(context);

      await context.page.type('#card_expiry', '12/55');
      await context.page.type('#card_name', 'SakshiJain');
      await context.page.type('#card_cvv', '111');
      await delay(1000);

      await submit(context);
      await delay(1000);
      await handleCardValidation(context);
      await delay(1000);
      await handleMockSuccessDialog(context);
      await delay(1000);
    });
  });
};
