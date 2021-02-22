const initCustomCheckout = require('blackbox/tests/custom/init.js');
const mockAPI = require('blackbox/tests/custom/mockApi.js');
const { getPaymentPayload } = require('blackbox/tests/custom/utils.js');

let context;

describe('Card Payment - Custom Checkout FTs', () => {
  beforeEach(async () => {
    const { currentTestName } = expect.getState();
    let isCallbackURL = currentTestName.toLowerCase().includes('callback url');
    context = await initCustomCheckout({ page, isCallbackURL });
  });
  afterEach(async () => {
    page.removeAllListeners('request');
  });
  test('basic Card Flow - Success - Custom Checkout', async () => {
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

    // await popupPage.waitForFunction(() => false);
    await popupPage.click('button.success');
    await page.waitForSelector('#status');
    await page.waitForFunction(() => {
      const status = document.getElementById('status').innerText;
      return status.includes('success');
    });
    await page.waitForFunction(() => {
      const response = document.getElementById('response').innerText;
      const res = JSON.parse(response);
      return (
        typeof res.razorpay_payment_id === 'string' &&
        res.razorpay_payment_id.length > 0
      );
    });
  });

  test('basic Card Flow - Failed - Custom Checkout', async () => {
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

    // await popupPage.waitForFunction(() => false);
    await popupPage.click('button.danger');
    // handle cancel request
    context.expectRequest(req => {});
    context.respondJSON(mockAPI.cancelPayment());

    await page.waitForSelector('#status');
    await page.waitForFunction(() => {
      const status = document.getElementById('status').innerText;
      return status.includes('failed');
    });
    await page.waitForFunction(() => {
      const response = document.getElementById('response').innerText;
      const res = JSON.parse(response);
      return typeof res.error === 'object';
    });
  });

  test('basic Card Flow - Redirect Callback URL - Success - Custom Checkout', async () => {
    /**
     * Trigger payment flow
     */

    await context.disableInterceptor();

    await page.evaluate(async data => {
      window.rp.createPayment(data);
    }, getPaymentPayload('card'));
    await page.waitForNavigation();
    await page.click('button.success');
    await page.waitForNavigation();
    const status = await page.evaluate(() => {
      return (
        document.querySelector('h1').innerText ===
        'razorpay_payment_id=pay_GeiWKMc4BAbqc1'
      );
    });
    expect(status).toBeTruthy();
  });

  test('basic Card Flow - Redirect Callback URL - Failed - Custom Checkout', async () => {
    /**
     * Trigger payment flow
     */

    await context.disableInterceptor();

    await page.evaluate(async data => {
      window.rp.createPayment(data);
    }, getPaymentPayload('card'));
    await page.waitForNavigation();
    await page.click('button.danger');
    await page.waitForNavigation();
    const status = await page.evaluate(() => {
      return decodeURI(document.querySelector('h1').innerText).includes(
        'error[code]=BAD_REQUEST_ERROR'
      );
    });
    expect(status).toBeTruthy();
  });
});
