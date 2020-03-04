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

const nameToBePrefilled = 'Saransh';
const cardCvvToBePrefilled = '122';
const cardNumberToBePrefilled = '4242424242424242';
const cardExpiryToBePrefilled = '12/55';

describe.each(
  getTestData('Check contact and card prefills', {
    options: {
      prefill: {
        contact: '222222222',
        name: nameToBePrefilled,
        email: 'a@gmail.com',
        'card[number]': cardNumberToBePrefilled,
        'card[expiry]': cardExpiryToBePrefilled,
        'card[cvv]': cardCvvToBePrefilled,
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
    await fillUserDetails(context);

    await proceed(context);
    await assertUserDetails(context);
    await assertPaymentMethods(context);
    await selectPaymentMethod(context, 'card');
    await assertInputValue(context, '#card_name', nameToBePrefilled);
    await assertInputValue(context, '#card_cvv', cardCvvToBePrefilled);
    await assertInputValue(context, '#card_number', '4242 4242 4242 4242');
    await assertInputValue(context, '#card_expiry', '12 / 55');
  });
});

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
