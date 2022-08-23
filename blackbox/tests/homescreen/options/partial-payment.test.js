const { getTestData } = require('../../../actions');

const { assertBasicDetailsScreen, assertTextContent } = require('../actions');

const { openCheckoutWithNewHomeScreen } = require('../open');

describe.each(
  getTestData('check partial payments object in options', {
    loggedIn: false,
    preferences: {
      order: {
        amount: 20000,
        amount_due: 20000,
        amount_paid: 0,
        currency: 'INR',
        first_payment_min_amount: 200,
        partial_payment: true,
      },
    },
    options: {
      partial_payment: {
        full_amount_label: 'Perhaps consider paying in full?',
        min_amount_label: 'Pay with a thimble',
        partial_amount_label: 'Be a Miser and Make Payment in Parts',
        partial_amount_description: 'This is an important UX element!!',
        select_partial: true,
      },
    },
    keyless: false,
  })
)('Options tests', ({ preferences, title, options }) => {
  test(title, async () => {
    const context = await openCheckoutWithNewHomeScreen({
      page,
      options,
      preferences,
    });

    await assertBasicDetailsScreen(context);
    await assertTextContent(
      context,
      '.partial-payment-block button:nth-child(1) [slot=title]',
      'Perhaps consider paying in full?'
    );
    await assertTextContent(
      context,
      '.partial-payment-block button:nth-child(2) [slot=title]',
      'Make payment in parts'
    );
    await assertTextContent(
      context,
      '.partial-payment-block .subtitle--help',
      'This is an important UX element!!'
    );
    await assertTextContent(
      context,
      '.minimum-amount-selection>label>div',
      'Pay with a thimble',
      true
    );
  });
});
