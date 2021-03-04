const initCustomCheckout = require('blackbox/tests/custom/init.js');
const mockAPI = require('blackbox/tests/custom/mockApi.js');
const { getPaymentPayload } = require('blackbox/tests/custom/utils.js');

let context;
const flow = 'upicollect';

describe('UPI Collect - Custom Checkout FTs', () => {
  beforeEach(async () => {
    context = await initCustomCheckout({ page });
    const paymentData = getPaymentPayload(flow);
    await page.evaluate(async data => {
      window.rp.createPayment(data);
    }, paymentData);
  });
  afterEach(async () => {
    page.removeAllListeners('request');
  });

  test('UPI Collect - Success - Custom Checkout', async () => {

    await context.expectRequest(req => {});
    // mock create payment and trigger send OTP
    const createPaymentResponse = mockAPI.ajaxResponse(flow);
    await context.respondJSON(createPaymentResponse);

    // trigger 10s polling of api
    await context.expectRequest(req => {});
    // using existing success API mock of submit OTP
    await context.respondJSONP(mockAPI.submitOTP());

    // expected delay in response about 3-5s
    await page.waitForFunction(() => {
      return document.querySelector('#status').innerText === 'success';
    });
  });

  test('UPI Collect - Failed - Custom Checkout', async () => {

    await context.expectRequest(req => {});
    // mock create payment and trigger send OTP
    const createPaymentResponse = mockAPI.ajaxResponse(flow);
    await context.respondJSON(createPaymentResponse);

    /**
     * There should be 10 api call of status after error come in response as retry count = 10 in this
     * So total 11 API response handled in following loop
     */
    for (let i = 0; i < 11; i++) {
      await context.expectRequest(req => {});
      // using existing failure API mock of cancelPayment
      await context.respondJSONP(mockAPI.cancelPayment());
    }
    // expected delay in response about 5-10s
    await page.waitForFunction(() => {
      return document.querySelector('#status').innerText === 'failed';
    });
  }, 70000); // increase timeout
});
