const { getTestData } = require('../../../actions');
const { openCheckoutWithNewHomeScreen } = require('../open');

describe.each(
  getTestData('Check for currency in options', {
    options: {
      amount: 305,
      currency: 'RUB',
      personalization: true,
      remember_customer: true,
    },
    keyless: false,
    preferences: {},
  })
)('Options tests', ({ preferences, title, options }) => {
  test(title, async () => {
    const context = await openCheckoutWithNewHomeScreen({
      page,
      options,
      preferences,
    });
    const amountSpan = await context.page.waitForSelector(
      '#amount .original-amount'
    );
    const amountText = await context.page.evaluate(
      amountSpan => amountSpan.textContent,
      amountSpan
    );
    expect(amountText).toContain(`₽`);
  });
});

describe.each(
  getTestData('Check default currency in options', {
    options: {
      amount: 305,
      personalization: true,
      remember_customer: true,
    },
    preferences: {},
    keyless: false,
  })
)('Options tests', ({ preferences, title, options }) => {
  test(title, async () => {
    const context = await openCheckoutWithNewHomeScreen({
      page,
      options,
      preferences,
    });
    const amountSpan = await context.page.waitForSelector(
      '#amount .original-amount'
    );
    const amountText = await context.page.evaluate(
      amountSpan => amountSpan.textContent,
      amountSpan
    );
    expect(amountText).toContain(`₹`);
  });
});
