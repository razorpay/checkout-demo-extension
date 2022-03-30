const initCustomCheckout = require('blackbox/tests/custom/init.js');
const { getInnerText } = require('blackbox/util.js');
const mockAPI = require('blackbox/tests/custom/mockApi.js');
const { getPaymentPayload } = require('blackbox/tests/custom/utils.js');

let context;

describe('submitOTP - Custom Checkout UT', () => {
  beforeEach(async () => {
    context = await initCustomCheckout({ page });
  });
  afterEach(async () => {
    page.removeAllListeners('request');
  });
  test('submitOTP flow', async () => {
    /**
     * Trigger payment flow
     */
    await page.evaluate(async (data) => {
      window.rp.createPayment(data);
    }, getPaymentPayload('card'));
    await context.expectRequest((req) => {});
    // mock create payment
    const createPaymentResponse = mockAPI.ajaxResponse();
    await context.respondJSON(createPaymentResponse);
    // mock popup
    const popup = await context.popup();
    const popupPage = popup.page;

    await popupPage.waitForNavigation();

    // trigger submitOTP
    await page.evaluate(async (response) => {
      if (window.rp) {
        window.rp._payment.otpurl = response.submit_url;
        window.rp.submitOTP(123456);
      }
    }, createPaymentResponse);
    await context.expectRequest((req) => {});
    const req = await context.getRequest();
    // verify payload of request
    expect(req.postData()).toBe('type=otp&otp=123456');
    // mock resendOTP api
    await context.respondJSON(mockAPI.submitOTP());
    await page.waitForSelector('#status');
    const data = await getInnerText(page, '#status');
    expect(data).toBe('success');
  });
});
