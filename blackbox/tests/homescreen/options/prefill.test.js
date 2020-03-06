const { getTestData } = require('../../../actions');
const { openCheckoutWithNewHomeScreen } = require('../open');

const {
  assertBasicDetailsScreen,
  fillUserDetails,
  proceed,
  assertUserDetails,
  assertPaymentMethods,
  getAttribute,
  selectPaymentMethod,
  assertInputValue,
} = require('../actions');

const bankToPreselect = 'SBIN';

describe.each(
  getTestData('Check amount and netbanking prefill', {
    options: {
      amount: 200202,
      prefill: {
        bank: bankToPreselect,
      },
    },
    keyless: false,
    preferences: {},
  })
)('Prefill tests', ({ preferences, title, options }) => {
  test(title, async () => {
    const context = await openCheckoutWithNewHomeScreen({
      page,
      options,
      preferences,
    });
    await assertBasicDetailsScreen(context);
    const amountSpan = await context.page.waitForSelector(
      '#amount .original-amount'
    );
    const amountText = await context.page.evaluate(
      amountSpan => amountSpan.textContent,
      amountSpan
    );
    expect(amountText).toContain(`2,002.02`);
    await fillUserDetails(context);

    await proceed(context);
    await assertInputValue(context, '#bank-select', bankToPreselect);
  });
});

describe.each(
  getTestData('Check amount and wallet prefill', {
    options: {
      amount: 200202,
      prefill: {
        wallet: 'phonepe',
      },
    },
    keyless: false,
    preferences: {},
  })
)('Prefill tests', ({ preferences, title, options }) => {
  test(title, async () => {
    const context = await openCheckoutWithNewHomeScreen({
      page,
      options,
      preferences,
    });
    await assertBasicDetailsScreen(context);
    const amountSpan = await context.page.waitForSelector(
      '#amount .original-amount'
    );
    const amountText = await context.page.evaluate(
      amountSpan => amountSpan.textContent,
      amountSpan
    );
    expect(amountText).toContain(`2,002.02`);
    await fillUserDetails(context);

    await proceed(context);
    await selectPaymentMethod(context, 'wallet');

    const selectedWallet = await context.page.waitForSelector(
      '#wallet-radio-phonepe'
    );
    const status = await context.page.evaluate(
      amountSpan => amountSpan.checked,
      selectedWallet
    );
    expect(status).toBe(true);
  });
});
