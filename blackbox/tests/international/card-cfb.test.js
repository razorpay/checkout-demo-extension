/**
 * This e2e is to allow CFB on international cards where DCC is applicable
 *
 * ---------
 * Steps to test DCC:
 *  - Open checkout
 *  - Choose cards payment method
 *  - Enter International card
 *  - Select DCC currency other than INR
 *  - Verify FEE api and show updated amount on UI
 *  - Verify the DCC payload in /fees api call
 *  - Verify the DCC payload in create payment api
 *
 * Steps to test MCC:
 *  - Open checkout with INR MCC currency
 *  - Choose cards payment method
 *  - Enter International card
 *  - Select DCC currency other than INR
 *  - Verify FEE api and show updated amount on UI
 *  - Verify the DCC payload should not be present in /fees api call
 *  - Verify the DCC payload should not be present in create payment api
 *
 * Steps to test MCC with DCC:
 *  - Open checkout with USD MCC currency
 *  - Choose cards payment method
 *  - Enter International card
 *  - Select DCC currency other than INR
 *  - Verify FEE api and show updated amount on UI
 *  - Verify the DCC payload should not be present in /fees api call
 *  - Verify the DCC payload should not be present in create payment api
 */

const createCheckoutForInternational = require('../../create/international');
const { selectPaymentMethod } = require('../homescreen/homeActions');
const {
  selectCurrency,
  enterCardDetails,
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

describe('Test CFB on international cards with DCC enabled', () => {
  test('Should call fees api and show updated amount on UI', async () => {
    const dcc = true;
    const feeBearer = true;
    const cardType = 'VISA';
    const dccCurrency = 'USD';
    const isAVSRequired = true;
    const merchantCurrency = 'INR';
    const internationalCard = true;

    const { context } = await createCheckoutForInternational({
      feeBearer,
      dcc,
      currency: merchantCurrency,
    });
    await selectPaymentMethod(context, 'card');

    // Cards screen
    await enterCardDetails(context, {
      cardType,
      internationalCard,
      issuer: cardType,
    });

    // DCC screen
    await respondCurrencies(context, isAVSRequired);
    await selectCurrency(context, dccCurrency);
    await submit(context);

    // AVS screen
    await fillAVSForm({ context });
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

    await expectDCCParametersInRequest(context, dccCurrency, isAVSRequired);

    await handleMockSuccessDialog(context);
  });
  test('Should call fees api and show updated amount on UI for USD MCC currency', async () => {
    const dcc = true;
    const feeBearer = true;
    const cardType = 'VISA';
    const dccCurrency = 'USD';
    const isAVSRequired = true;
    const merchantCurrency = 'USD';
    const internationalCard = true;

    const { context } = await createCheckoutForInternational({
      feeBearer,
      dcc,
      currency: merchantCurrency,
    });
    await selectPaymentMethod(context, 'card');

    // Cards screen
    await enterCardDetails(context, {
      cardType,
      internationalCard,
      issuer: cardType,
    });

    // DCC screen
    await respondCurrencies(context, isAVSRequired);
    await selectCurrency(context, dccCurrency);
    await submit(context);

    // AVS screen
    await fillAVSForm({ context });
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

    await expectDCCParametersInRequest(context, dccCurrency, isAVSRequired);

    await handleMockSuccessDialog(context);
  });
});

describe('Test CFB on international cards with DCC disabled', () => {
  test('Should call calculate fee api for international card', async () => {
    const dcc = false;
    const feeBearer = true;
    const cardType = 'VISA';
    const isAVSRequired = true;
    const merchantCurrency = 'INR';
    const internationalCard = true;

    const { context } = await createCheckoutForInternational({
      feeBearer,
      dcc,
      currency: merchantCurrency,
    });
    await selectPaymentMethod(context, 'card');

    // Cards screen
    await enterCardDetails(context, {
      cardType,
      internationalCard,
      issuer: cardType,
    });

    await respondCurrencies(context, isAVSRequired);
    await submit(context);

    // AVS screen
    await fillAVSForm({ context });
    await submit(context);

    // expect /fees api call
    const feeBearerAmount = await expectFeeBearerRequest({
      context,
      dcc,
      isAVS: isAVSRequired,
    });

    // show fee breakdown on UI
    await verifyFeeBearerAmountOnUI(context, feeBearerAmount);

    // click continue
    context.page.click('.fee-bearer .btn');
    await delay(400);

    await handleMockSuccessDialog(context);
  });
  test('Should call calculate fee api for domestic card', async () => {
    const dcc = false;
    const feeBearer = true;
    const cardType = 'VISA';
    const merchantCurrency = 'INR';
    const internationalCard = false;

    const { context } = await createCheckoutForInternational({
      feeBearer,
      dcc,
      currency: merchantCurrency,
    });
    await selectPaymentMethod(context, 'card');

    // Cards screen
    await enterCardDetails(context, {
      cardType,
      internationalCard,
      issuer: cardType,
    });

    await submit(context);

    // expect /fees api call
    const feeBearerAmount = await expectFeeBearerRequest({ context });

    // show fee breakdown on UI
    await verifyFeeBearerAmountOnUI(context, feeBearerAmount);

    // click continue
    context.page.click('.fee-bearer .btn');
    await delay(400);

    await handleMockSuccessDialog(context);
  });
});
