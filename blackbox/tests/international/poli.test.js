const createCheckoutForInternational = require('../../create/international');
const {
  clickPaymentMethod,
  assertInternationalPage,
  assertMultiCurrenciesAndAmount,
  isOnNVSScreen,
  assertNVSFormDataInRequest,
  clickProvider,
} = require('../../actions/international');

const {
  getHomescreenMethods,
  selectPaymentMethod,
} = require('../homescreen/homeActions');

const { submit, fillAVSForm } = require('../../actions/common');

describe('Poli under international payment method', () => {
  test('International payment method should not be render', async () => {
    const { context } = await createCheckoutForInternational({
      testPoli: false,
    });
    const methods = await getHomescreenMethods(context);
    const rendered =
      methods.find((method) => method === 'international') !== undefined;
    expect(rendered).toStrictEqual(false);
  });
  test('International payment method should be render if poli app enabled', async () => {
    const { context, preferences } = await createCheckoutForInternational({
      testPoli: true,
    });
    const methods = await getHomescreenMethods(context);
    const rendered =
      methods.find((method) => method === 'international') !== undefined;
    expect(rendered).toStrictEqual(true);
    expect(preferences).toMatchObject({
      methods: {
        app: {
          poli: 1,
        },
      },
    });
  });
  test('Poli should be rendered under international payment method', async () => {
    const { context } = await createCheckoutForInternational({
      testPoli: true,
    });
    await selectPaymentMethod(context, 'international');
    await assertInternationalPage(context, 'div#international-radio-poli');
  });
  test('Should show DCC UI if DCC flag is enabled', async () => {
    const { context } = await createCheckoutForInternational({
      dcc: true,
      testPoli: true,
    });
    await clickPaymentMethod(context);
    await assertMultiCurrenciesAndAmount({
      context,
      addressNameRequired: true,
    });
  });
  test('Should show DCC UI if DCC flag is disabled', async () => {
    const { context } = await createCheckoutForInternational({
      dcc: false,
      testPoli: true,
    });
    await clickPaymentMethod(context);
    await assertMultiCurrenciesAndAmount({
      context,
      addressNameRequired: true,
    });
  });
  test('Should not show billing address screen if address_name_required flag is false', async () => {
    const { context } = await createCheckoutForInternational({
      testPoli: true,
    });
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
    const { context } = await createCheckoutForInternational({
      testPoli: true,
    });
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
    const { context } = await createCheckoutForInternational({
      testPoli: true,
      testTrustly: true,
    });
    await clickPaymentMethod(context);
    await clickProvider(context, 'poli');
    await assertMultiCurrenciesAndAmount({
      context,
      addressNameRequired: true,
    });

    await submit(context);
    const nvsScreen = await isOnNVSScreen(context);
    expect(nvsScreen).toStrictEqual(true);
    await fillAVSForm({ context, isNameRequired: true, countryCode: 'AU' });

    await submit(context);
    await assertNVSFormDataInRequest(context, 'GBP', 'AU');
  });
});
