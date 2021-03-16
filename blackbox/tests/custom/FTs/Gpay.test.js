const initCustomCheckout = require('blackbox/tests/custom/init.js');
const mockAPI = require('blackbox/tests/custom/mockApi.js');
const {
  getPaymentPayload,
  flowTests,
} = require('blackbox/tests/custom/utils.js');

let context;
let flow = 'gpay-web';

describe(`Google Pay - Custom Checkout FTs`, () => {
  beforeEach(async () => {
    context = await initCustomCheckout({
      page,
      emulate: 'Nexus 10',
      mockPaymentRequest: true,
    });
    // const paymentData = getPaymentPayload(flow.type, flow.override || {});
    // await page.evaluate(async data => {
    //   window.rp.createPayment(data);
    // }, paymentData);
  });
  afterEach(async () => {
    page.removeAllListeners('request');
  });
  test(`basic Google Pay Web Payment - Success - Custom Checkout`, async () => {
    const checkPaymentAdapter = page.evaluate(() => {
      return new Promise((resolve, reject) => {
        window.rp
          .checkPaymentAdapter('gpay')
          .then(resolve)
          .catch(reject);
      });
    });

    let isAvailable = false;
    try {
      await checkPaymentAdapter;
      isAvailable = true;
    } catch (e) {
      isAvailable = false;
    }

    expect(isAvailable).toBeTruthy();
    const paymentData = getPaymentPayload(flow);
    await page.evaluate(async data => {
      window.rp.createPayment(data, { gpay: true });
    }, paymentData);

    await context.expectRequest(req => {});
    // mock create payment
    const createPaymentResponse = mockAPI.ajaxResponse(flow);
    await context.respondJSON(createPaymentResponse);

    await context.expectRequest(req => {});
    await context.respondJSONP(mockAPI.submitOTP());

    await page.waitForFunction(() => {
      const status = document.getElementById('status').innerText;
      return status.includes('success');
    });
  }, 70000);
});
