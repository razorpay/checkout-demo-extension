const initCustomCheckout = require('blackbox/tests/custom/init.js');
const { getInnerText } = require('blackbox/util.js');
const mockAPI = require('blackbox/tests/custom/mockApi.js');
const { getPaymentPayload } = require('blackbox/tests/custom/utils.js');

let context;

describe('topupWallet - Custom Checkout UT', () => {
  beforeEach(async () => {
    context = await initCustomCheckout({ page });
  });
  afterEach(async () => {
    page.removeAllListeners('request');
  });
  test('topupWallet', async () => {
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

    // trigger topupWallet
    await page.evaluate(async () => {
      if (window.rp) {
        window.rp.topupWallet();
      }
    });
    // mock topup request
    await context.expectRequest(req => {});
    const req = await context.getRequest();
    expect(req.url().includes(createPaymentResponse.payment_id)).toBeTruthy();
    await context.respondJSON(mockAPI.topupAjax());

    await popupPage.waitForNavigation();

    await page.waitForSelector('#status');
    const data = await getInnerText(page, '#status');
    expect(data).toBe('success');
  });
});
