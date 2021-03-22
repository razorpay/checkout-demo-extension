const initCustomCheckout = require('blackbox/tests/custom/init.js');
const mockAPI = require('blackbox/tests/custom/mockApi.js');
const { getPaymentPayload } = require('blackbox/tests/custom/utils.js');

let context;

describe('focus - Custom Checkout UT', () => {
  beforeEach(async () => {
    context = await initCustomCheckout({ page });
  });
  afterEach(async () => {
    page.removeAllListeners('request');
  });
  test('focus', async () => {
    /**
     * Trigger payment flow
     */
    await page.evaluate(async (data) => {
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

    // trigger focus
    const visibleState = await page.evaluate(async () => {
      if (window.rp) {
        return new Promise(resolve => {
          // setting up listener
          window.rp._payment.popup.window.addEventListener('focus', function() {
            resolve(true);
          });
          setTimeout(() => {
            window.rp.focus();
          }, 500);
        });
      }
    });

    expect(visibleState).toBeTruthy();
  });
});
