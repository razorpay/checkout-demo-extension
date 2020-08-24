//moved this to a seperate file because it was causing intermittent failures in a single file

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
        contact: '+912222222222',
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
