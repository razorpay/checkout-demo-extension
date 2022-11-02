const initCustomCheckout = require('blackbox/tests/custom/init.js');
const mockAPI = require('blackbox/tests/custom/mockApi.js');
const {
  getPaymentPayload,
  flowTests,
} = require('blackbox/tests/custom/utils.js');

let context;

describe.each(flowTests.slice(0, 1))('Validate Flow', (flow) => {
  describe(`${flow.name} - Custom Checkout FTs`, () => {
    beforeEach(async () => {
      context = await initCustomCheckout({
        page,
      });
      const paymentData = getPaymentPayload(flow.type, flow.override || {});
      await page.evaluate(async (data) => {
        window.rp.createPayment(data, { paused: true });
      }, paymentData);
    });
    afterEach(async () => {
      page.removeAllListeners('request');
    });
    test(`basic ${flow.name}- Success - Custom Checkout`, async () => {
      await new Promise((resolve) => {
        setTimeout(async () => {
          await page.evaluate(async () => {
            window.rp.emit('payment.resume');
          });
          resolve();
        }, 100);
      });
      /**
       * Trigger payment flow
       */
      if (!flow.skipAjax) {
        await context.expectRequest((req) => {});
        // mock create payment
        const createPaymentResponse = mockAPI.ajaxResponse(flow.type);
        await context.respondJSON(createPaymentResponse);
      }

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
  });
});
