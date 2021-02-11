const API = require('./mockApi');
const initCustomCheckout = require('./init');
// const { handleCardValidation } = require('../../actions/common');

describe('Custom Checkout - Card tests', () => {
  test('normal flow', async () => {
    const context = await initCustomCheckout({ page });

    // Open Popup Window
    await page.click('button');

    await page.evaluate(async () => {
      var data = {
        amount: 200,
        currency: 'INR',
      };
      data.method = 'card';
      data['card[number]'] = '4111111111111111';
      data['card[expiry_month]'] = '04';
      data['card[expiry_year]'] = '22';
      data['card[name]'] = 'arsh';
      data['card[cvv]'] = '123';
      // data.bank = 'SBIN';
      data.email = 'a@s.d';
      data.contact = 9999922222;
      window.rp.emit('payment.resume', data);
    });

    // await page.waitForNavigation({ waitUntil: "networkidle0" });
    await page.waitForResponse(response => response.status() === 200);

    const popup = await context.popup();
    await popup.page.click('button.success');
    await popup.callback({ razorpay_payment_id: 'pay_123465' });

    // const newPagePromise = new Promise(x =>
    //   browser.once('targetcreated', target => x(target.page()))
    // );
    // const popup = await newPagePromise;
    // debugger;
    // console.log(popup);

    // await handleCardValidation(context);

    // await page.waitForFunction(() => {
    //   // const username = document.getElementById('username').value;
    //   // const password = document.getElementById('password').value;

    //   return false;
    // });

    // check status to Success
    console.log('Verify Status for success');
    await page.waitForFunction(() => {
      const status = document.getElementById('status').innerText;
      return status.includes('success');
    });

    console.log('Verify Payment ID in response');
    await page.waitForFunction(() => {
      const response = document.getElementById('response').innerText;
      const res = JSON.parse(response);
      return typeof res.razorpay_payment_id === 'string';
    });

    // const resElement = await page.$('#response');
    // const response = await page.evaluate(el => el.textContent, resElement);
    // const res = JSON.parse(response);
    // expect(typeof res.razorpay_payment_id).toBe('string');

    // await page.evaluate(async () => {
    //   const amount = 51 * 100;
    //   var rp = new Razorpay({
    //     key: 'rzp_test_1DP5mmOlF5G5ag',
    //     amount,
    //   })
    //     .on('payment.error', function(resp) {
    //       console.log(resp);
    //     })
    //     .on('payment.success', function(resp) {
    //       console.log(resp);
    //     });
    //   const data = {
    //     amount,
    //     method: 'card',
    //     email: 'test-custom-checkout@razorpay.com',
    //     contact: 81111111111,
    //   };
    //   data['card[number]'] = '4111111111111111';
    //   data['card[expiry_month]'] = '04';
    //   data['card[expiry_year]'] = '22';
    //   data['card[name]'] = 'arsh';
    //   data['card[cvv]'] = '123';
    //   setTimeout(() => {
    //     rp.createPayment(data, { message: 'loading' });
    //   });
    // });

    // const pages = await browser.pages(); // get all open pages by the browser
    // const popup = pages[pages.length - 1];
    // console.log(popup);
    // await handleCardValidation(context);
    // await new Promise(function(resolve) {
    //   setTimeout(resolve, 10000);
    // });
  });
});
