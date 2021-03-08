const initCustomCheckout = require('blackbox/tests/custom/init.js');
const mockAPI = require('blackbox/tests/custom/mockApi.js');
const {
  getPaymentPayload,
  flowTests,
} = require('blackbox/tests/custom/utils.js');

let context;

describe.each(flowTests)('Validate Flow', flow => {
  describe(`${flow.name} - Custom Checkout FTs`, () => {
    beforeEach(async () => {
      const { currentTestName } = expect.getState();
      let isCallbackURL = currentTestName
        .toLowerCase()
        .includes('callback url');
      context = await initCustomCheckout({
        page,
        isCallbackURL,
        flowName: flow.type,
      });
      const paymentData = getPaymentPayload(flow.type, flow.override || {});
      await page.evaluate(async data => {
        window.rp.createPayment(data);
      }, paymentData);
    });
    afterEach(async () => {
      page.removeAllListeners('request');
    });
    test(`basic ${flow.name}- Success - Custom Checkout`, async () => {
      /**
       * Trigger payment flow
       */
      if (!flow.skipAjax) {
        await context.expectRequest(req => {});
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

    test(`basic ${flow.name}- Failed - Custom Checkout`, async () => {
      /**
       * Trigger payment flow
       */

      if (!flow.skipAjax) {
        await context.expectRequest(req => {});
        // mock create payment
        const createPaymentResponse = mockAPI.ajaxResponse(flow.type);
        await context.respondJSON(createPaymentResponse);
      }
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

    test(`basic ${flow.name}- Redirect Callback URL - Success - Custom Checkout`, async () => {
      /**
       * Trigger payment flow
       */

      await context.disableInterceptor();

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

    test(`basic ${flow.name}- Redirect Callback URL - Failed - Custom Checkout`, async () => {
      /**
       * Trigger payment flow
       */

      await context.disableInterceptor();

      await page.waitForNavigation();
      await page.click('button.danger');
      await page.waitForNavigation();
      await page.waitForFunction(() => {
        return decodeURI(document.querySelector('h1').innerText).includes(
          'error[code]=BAD_REQUEST_ERROR'
        );
      });
    });
  });
});
