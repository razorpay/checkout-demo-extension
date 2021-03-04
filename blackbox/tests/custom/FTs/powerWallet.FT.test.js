const initCustomCheckout = require('blackbox/tests/custom/init.js');
const mockAPI = require('blackbox/tests/custom/mockApi.js');
const { getInnerText } = require('blackbox/util.js');
const { getPaymentPayload } = require('blackbox/tests/custom/utils.js');

let context;
const flow = 'powerwallet';

describe('FreeCharge - Custom Checkout FTs', () => {
  beforeEach(async () => {
    const { currentTestName } = expect.getState();
    let isCallbackURL = currentTestName.toLowerCase().includes('callback url');
    context = await initCustomCheckout({ page, isCallbackURL });
    const paymentData = getPaymentPayload(flow);
    await page.evaluate(async data => {
      window.rp.createPayment(data);
    }, paymentData);
  });
  afterEach(async () => {
    page.removeAllListeners('request');
  });

  test('powerwallet Freecharge - Success - Custom Checkout', async () => {
    await context.expectRequest(req => {});
    // mock create payment and trigger send OTP
    const createPaymentResponse = mockAPI.ajaxResponse(flow);
    await context.respondJSON(createPaymentResponse);

    await page.evaluate(async () => {
      window.rp.submitOTP(123456);
    });
    await context.expectRequest(req => {});
    const req = await context.getRequest();
    // verify payload of request
    expect(req.postData()).toBe('type=otp&otp=123456');
    // mock resendOTP api
    await context.respondJSON(mockAPI.submitOTP());
    await page.waitForSelector('#status');
    const data = await getInnerText(page, '#status');
    expect(data).toBe('success');
  });

  test('powerwallet Freecharge - Insufficient Fund - Custom Checkout', async () => {
    await context.expectRequest(req => {});
    // mock create payment and trigger send OTP
    const createPaymentResponse = mockAPI.ajaxResponse(flow);
    await context.respondJSON(createPaymentResponse);

    await page.evaluate(async () => {
      window.rp.submitOTP(123456);
    });
    await context.expectRequest(req => {});
    let req = await context.getRequest();
    // verify payload of request
    expect(req.postData()).toBe('type=otp&otp=123456');
    // mock resendOTP api
    await context.respondJSON(mockAPI.insufficient_funds(), 400);

    // trigger topupWallet
    await page.evaluate(async () => {
      if (window.rp) {
        window.rp.topupWallet();
      }
    });
    await context.forceTargetInitialization(browser);
    // mock popup
    const popup = await context.popup();
    const popupPage = popup.page;
    // mock topup request
    await context.expectRequest(req => {});
    req = await context.getRequest();
    expect(req.url().includes(createPaymentResponse.payment_id)).toBeTruthy();
    await context.respondJSON(mockAPI.topupAjax());

    await popupPage.waitForNavigation();
    await popupPage.click('button.success');
    await page.waitForSelector('#status');
    const data = await getInnerText(page, '#status');
    expect(data).toBe('success');
  });

  test('powerwallet Freecharge - Insufficient Fund - Redirect Callback URL - Custom Checkout', async () => {
    await context.expectRequest(req => {});
    // mock create payment and trigger send OTP
    const createPaymentResponse = mockAPI.ajaxResponse(flow);
    await context.respondJSON(createPaymentResponse);

    await page.evaluate(async () => {
      window.rp.submitOTP(123456);
    });
    await context.expectRequest(req => {});
    let req = await context.getRequest();
    // verify payload of request
    expect(req.postData()).toBe('type=otp&otp=123456');
    // mock resendOTP api
    await context.respondJSON(mockAPI.insufficient_funds(), 400);

    // trigger topupWallet
    await page.evaluate(async () => {
      if (window.rp) {
        window.rp.topupWallet();
      }
    });
    // mock topup request
    await context.expectRequest(req => {});
    req = await context.getRequest();
    expect(req.url().includes(createPaymentResponse.payment_id)).toBeTruthy();
    await context.disableInterceptor();
    await context.respondJSON(mockAPI.topupAjax());
    await page.waitForNavigation();
    await page.click('button.success');
    await page.waitForNavigation();
    await page.waitForFunction(() => {
      return (
        document.querySelector('h1').innerText ===
        'razorpay_payment_id=pay_GeiWKMc4BAbqc1'
      );
    });
  });
});
