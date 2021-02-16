const initCustomCheckout = require('blackbox/tests/custom/init.custom.js');
const { getInnerText } = require('blackbox/util.js');
const mockAPI = require('blackbox/tests/custom/mockApi.js');

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
      window.rp
        .on('payment.error', function(resp) {
          document.getElementById('status').innerText = 'failed';
          document.getElementById('response').innerText = JSON.stringify(resp);
        })
        .on('payment.success', function(resp) {
          document.getElementById('status').innerText = 'success';
          document.getElementById('response').innerText = JSON.stringify(resp);
        });
    });
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
