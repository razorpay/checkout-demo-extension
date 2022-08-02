/**
 * This e2e is to allow CFB on Instant Bank Transfer Trustly & Poli where DCC is applicable
 */

const createCheckoutForInternational = require('../../create/international');
const { selectPaymentMethod } = require('../homescreen/homeActions');
const {
  selectCurrency,
  respondCurrencies,
  expectDCCParametersInRequest,
} = require('../../actions/card-actions');
const { submit, fillAVSForm } = require('../../actions/common');
const {
  verifyFeeBearerAmountOnUI,
  expectFeeBearerRequest,
} = require('../../actions/feebearer-actions');
const { handleMockSuccessDialog } = require('../../actions/shared-actions');
const { delay } = require('../../util');
const { assertNVSFormDataInRequest } = require('../../actions/international');

describe('Test CFB on Trustly', () => {
  test('Should call fees api and show updated amount on UI', async () => {
    const dcc = true;
    const testTrustly = true;
    const feeBearer = true;
    const dccCurrency = 'USD';
    const isAVSRequired = true;
    const merchantCurrency = 'INR';

    const { context } = await createCheckoutForInternational({
      feeBearer,
      dcc,
      currency: merchantCurrency,
      testTrustly,
    });
    await selectPaymentMethod(context, 'international');

    // DCC screen
    await respondCurrencies(context, isAVSRequired);
    await selectCurrency(context, dccCurrency);
    await submit(context);

    // N_AVS screen
    await fillAVSForm({ context, isNameRequired: true });
    await submit(context);

    // expect /fees api call
    const feeBearerAmount = await expectFeeBearerRequest({
      context,
      dcc,
      isAVS: isAVSRequired,
    });

    // show fee breakdown on UI
    await verifyFeeBearerAmountOnUI(context, feeBearerAmount, '$');

    // click continue
    context.page.click('.fee-bearer .btn');
    await delay(400);

    await assertNVSFormDataInRequest(context, dccCurrency);

    await handleMockSuccessDialog(context);
  });
});

describe('Test CFB on Poli', () => {
  test('Should call fees api and show updated amount on UI', async () => {
    const dcc = true;
    const testPoli = true;
    const feeBearer = true;
    const dccCurrency = 'USD';
    const isAVSRequired = true;
    const merchantCurrency = 'INR';

    const { context } = await createCheckoutForInternational({
      feeBearer,
      dcc,
      currency: merchantCurrency,
      testPoli,
    });
    await selectPaymentMethod(context, 'international');

    // DCC screen
    await respondCurrencies(context, isAVSRequired);
    await selectCurrency(context, dccCurrency);
    await submit(context);

    // N_AVS screen
    await fillAVSForm({ context, isNameRequired: true, countryCode: 'AU' });
    await submit(context);

    // expect /fees api call
    const feeBearerAmount = await expectFeeBearerRequest({
      context,
      dcc,
      isAVS: isAVSRequired,
    });

    // show fee breakdown on UI
    await verifyFeeBearerAmountOnUI(context, feeBearerAmount, '$');

    // click continue
    context.page.click('.fee-bearer .btn');
    await delay(400);

    await assertNVSFormDataInRequest(context, dccCurrency, 'AU');

    await handleMockSuccessDialog(context);
  });
});
