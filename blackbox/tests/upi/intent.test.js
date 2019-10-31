const { openSdkCheckout } = require('../../actions/checkout-sdk');
const { makePreferences } = require('../../actions/preferences');
const {
  assertHomePage,
  fillUserDetails,
  assertPaymentMethods,
  selectPaymentMethod,
  selectWallet,
  assertWalletPage,
  submit,
  typeOTPandSubmit,
  handleOtpVerification,
  handleValidationRequest,
  retryWalletTransaction,
} = require('../../actions/common');

describe('Basic upi payment', () => {
  test('Perform upi intent transaction', async () => {
    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 200,
      personalization: false,
    };
    const preferences = makePreferences();
    preferences.methods.upi = true;
    const context = await openSdkCheckout({
      page,
      options,
      preferences,
      apps: [{ package_name: 'in.org.npci.upiapp', app_name: 'BHIM' }],
    });
    await assertHomePage(context, true, true);
    await fillUserDetails(context, true);
    await assertPaymentMethods(context);
    await selectPaymentMethod(context, 'upi');
    await page.click('.option');
    await submit(context);

    const reqorg = await context.expectRequest();
    expect(reqorg.url).toEqual(
      'https://api.razorpay.com/v1/payments/create/ajax'
    );
    expect(reqorg.method).toEqual('POST');
    await context.respondJSON({
      data: {
        intent_url:
          'upi://pay?pa=upi@razopay&pn=RBLBank&tr=4kHrR0CI9jEazLO&tn=razorpay&am=1&cu=INR&mc=5411',
      },
      payment_id: 'pay_DaFKujjV6Ajr7W',
      request: {
        method: 'GET',
        url:
          'https://api.razorpay.com/v1/payments/pay_DaFKujjV6Ajr7W/status?key_id=rzp_test_1DP5mmOlF5G5ag',
      },
      type: 'intent',
    });
    await delay(100);
    await page.evaluate(() =>
      upiIntentResponse({ response: { txnId: '123' } })
    );
    await delay(100);

    const successResult = { razorpay_payment_id: 'pay_DaFKujjV6Ajr7W' };
    const req = await context.expectRequest();
    await context.respondPlain(
      `${req.params.callback}(${JSON.stringify(successResult)})`
    );
    const result = await context.getResult();
    expect(result).toMatchObject(successResult);
  });
});
