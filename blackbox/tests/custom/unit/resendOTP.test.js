const initCustomCheckout = require('blackbox/tests/custom/init.js');
const { getInnerText } = require('blackbox/util.js');
const mockAPI = require('blackbox/tests/custom/mockApi.js');
const { getPaymentPayload } = require('blackbox/tests/custom/utils.js');

let context;

describe('resendOTP - Custom Checkout UT', () => {
  beforeEach(async () => {
    context = await initCustomCheckout({ page });
  });
  afterEach(async () => {
    page.removeAllListeners('request');
  });
  test('resendOTP flow', async () => {
    /**
     * Trigger payment flow
     */
    await page.evaluate(async data => {
      window.rp.createPayment(data);
    }, getPaymentPayload('card'));
    await context.expectRequest(req => {});
    // mock create payment
    const createPaymentResponse = mockAPI.ajaxResponse();
    await context.respondJSON(createPaymentResponse);
    // mock popup
    const popup = await context.popup();
    const popupPage = popup.page;

    await popupPage.waitForNavigation();

    // trigger resendOTP
    await page.evaluate(async () => {
      if (window.rp) {
        window.rp.resendOTP();
      }
    });
    await context.expectRequest(req => {});
    const req = await context.getRequest();
    expect(
      req
        .url()
        .includes(
          `payments/${createPaymentResponse.payment_id}/otp_resend?key_id=rzp_test_1DP5mmOlF5G5ag`
        )
    ).toBeTruthy();

    // mock resendOTP api
    await context.respondJSON(mockAPI.otpResend());

    await popupPage.waitForSelector('#resend-action');
    const data = await getInnerText(popupPage, '#resend-action');
    expect(data).toBe('Resend OTP');
  });
});
