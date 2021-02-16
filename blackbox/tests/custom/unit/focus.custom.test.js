const initCustomCheckout = require('blackbox/tests/custom/init.custom.js');
const mockAPI = require('blackbox/tests/custom/mockApi.js');

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
    await page.evaluate(async () => {
      window.rp = new Razorpay({
        key: 'rzp_test_1DP5mmOlF5G5ag',
      });
      var data = {
        amount: 100,
        currency: 'INR',
      };
      data.method = 'card';
      data['card[number]'] = '4111111111111111';
      data['card[expiry_month]'] = '04';
      data['card[expiry_year]'] = '22';
      data['card[name]'] = 'arsh';
      data['card[cvv]'] = '123';
      data.email = 'a@s.com';
      data.contact = 9999922222;
      window.rp.createPayment(data);
    });
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
