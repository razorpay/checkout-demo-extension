const openCheckoutForTrustly = require('../../create/international/trustly');
const {
  clickPaymentMethod,
  assertInternationalPage,
  assertMultiCurrenciesAndAmount,
  isOnNVSScreen,
  fillNVSForm,
  assertNVSFormData,
  respondCountries,
  respondStates,
} = require('../../actions/international');

const {
  getHomescreenMethods,
  selectPaymentMethod,
} = require('../homescreen/homeActions');

const { submit } = require('../../actions/common');

describe('Trustly under international payment method', () => {
  test('International payment method should not be render', async () => {
    const { context } = await openCheckoutForTrustly({ disabledTrustly: true });
    const methods = await getHomescreenMethods(context);
    const rendered =
      methods.find((method) => method === 'international') !== undefined;
    expect(rendered).toStrictEqual(false);
  });
  test('International payment method should be render if trustly app enabled', async () => {
    const { context, preferences } = await openCheckoutForTrustly();
    const methods = await getHomescreenMethods(context);
    const rendered =
      methods.find((method) => method === 'international') !== undefined;
    expect(rendered).toStrictEqual(true);
    expect(preferences).toMatchObject({
      methods: {
        app: {
          trustly: 1,
        },
      },
    });
  });
  test('Trustly should be rendered under international payment method', async () => {
    const { context } = await openCheckoutForTrustly();
    await selectPaymentMethod(context, 'international');
    await assertInternationalPage(context);
  });
  test('Should show DCC UI if DCC flag is enabled', async () => {
    const { context } = await openCheckoutForTrustly({ dcc: true });
    await clickPaymentMethod(context);
    await assertMultiCurrenciesAndAmount({
      context,
      addressNameRequired: true,
    });
  });
  test('Should show DCC UI if DCC flag is disabled', async () => {
    const { context } = await openCheckoutForTrustly({ dcc: false });
    await clickPaymentMethod(context);
    await assertMultiCurrenciesAndAmount({
      context,
      addressNameRequired: true,
    });
  });
  test('Should not show billing address screen if address_name_required flag is false', async () => {
    const { context } = await openCheckoutForTrustly();
    await clickPaymentMethod(context);
    await assertMultiCurrenciesAndAmount({
      context,
      addressNameRequired: false,
    });
    await submit(context);
    const nvsScreen = await isOnNVSScreen(context);
    expect(nvsScreen).toStrictEqual(false);
  });
  test('Should show billing address screen with first and last name', async () => {
    const { context } = await openCheckoutForTrustly();
    await clickPaymentMethod(context);
    await assertMultiCurrenciesAndAmount({
      context,
      addressNameRequired: true,
    });
    await submit(context);
    const nvsScreen = await isOnNVSScreen(context);
    expect(nvsScreen).toStrictEqual(true);
  });
  test('Should validate all required fields on billing address screen', async () => {
    const { context } = await openCheckoutForTrustly();
    await clickPaymentMethod(context);
    await assertMultiCurrenciesAndAmount({
      context,
      addressNameRequired: true,
    });
    await submit(context);
    await respondCountries(context);
    let nvsScreen = await isOnNVSScreen(context);
    expect(nvsScreen).toStrictEqual(true);

    await submit(context);
    nvsScreen = await isOnNVSScreen(context);
    expect(nvsScreen).toStrictEqual(true);
    await fillNVSForm(context);
    await respondStates(context);

    await assertNVSFormData(context);
  });
});
