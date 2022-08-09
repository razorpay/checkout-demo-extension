/**
 * Functional test cases for international bank transfer named as (Local Currency Bank Transfer) on UI
 *
 * Steps To Test:
 * - Open checkout
 * - Choose international bank transfer payment method
 * - Choose USD as currency
 * - On L2 Page, should show virtual bank transfer details
 * - Copy bank details
 *
 * Negative Test Cases:
 * - intl-bank-transfer is not enabled in preference api
 * - get virtual bank transfer details api fails
 */

const createCheckoutForInternational = require('../../create/international');
const { selectPaymentMethod } = require('../homescreen/homeActions');
const { assertVirtualAccountRequest } = require('../../actions/international');

describe('Test International Bank Transfer', () => {
  test('Should show virtual bank transfer details', async () => {
    const { context, preferences } = await createCheckoutForInternational({
      testPoli: true,
      testInternationalBankTransfer: { va_usd: 1 },
    });

    expect(preferences.methods).toMatchObject({
      intl_bank_transfer: { va_usd: 1 },
    });

    await selectPaymentMethod(context, 'intl_bank_transfer');

    await context.page.click('#va_usd');

    await assertVirtualAccountRequest({ context, currency: 'USD' });

    await context.page.click('.intl-bt-detail__copy');
  });

  test('Should not show virtual bank transfer details, if intl_bank_transfer is not enabled', async () => {
    const { context, preferences } = await createCheckoutForInternational({
      testPoli: true,
    });

    expect(preferences.methods).not.toMatchObject({
      intl_bank_transfer: { va_usd: 1 },
    });

    const el = await context.page.evaluate(() =>
      document.querySelector(`button.new-method[method=intl_bank_transfer]`)
    );

    expect(el).toBe(null);
  });

  test('Should show retry button if virtual account api failed', async () => {
    const { context, preferences } = await createCheckoutForInternational({
      testPoli: true,
      testInternationalBankTransfer: { va_usd: 1 },
    });

    expect(preferences.methods).toMatchObject({
      intl_bank_transfer: { va_usd: 1 },
    });

    await selectPaymentMethod(context, 'intl_bank_transfer');

    await context.page.click('#va_usd');

    await assertVirtualAccountRequest({
      context,
      currency: 'USD',
      errorResponse: true,
    });

    const errorButton = await context.page.evaluate(() =>
      document.querySelector('.error .btn')
    );

    expect(errorButton).toBeTruthy();
  });
});
