/**
 * Will be used later in flow testing
 */
// const API = require('./mockApi');
// const initCustomCheckout = require('./init.custom');
// // const { handleCardValidation } = require('../../actions/common');

// describe('Custom Checkout - Card tests', () => {
//   test('normal flow', async () => {
//     const context = await initCustomCheckout({ page });

//     // Open Popup Window
//     await page.click('button');

//     await page.evaluate(async () => {
//       var data = {
//         amount: 200,
//         currency: 'INR',
//       };
//       data.method = 'card';
//       data['card[number]'] = '4111111111111111';
//       data['card[expiry_month]'] = '04';
//       data['card[expiry_year]'] = '22';
//       data['card[name]'] = 'arsh';
//       data['card[cvv]'] = '123';
//       // data.bank = 'SBIN';
//       data.email = 'a@s.d';
//       data.contact = 9999922222;
//       window.rp.emit('payment.resume', data);
//     });

//     // await page.waitForNavigation({ waitUntil: "networkidle0" });
//     await page.waitForResponse(response => response.status() === 200);

//     const popup = await context.popup();
//     await popup.page.click('button.success');
//     await popup.callback({ razorpay_payment_id: 'pay_123465' });


//     // check status to Success
//     console.log('Verify Status for success');
//     await page.waitForFunction(() => {
//       const status = document.getElementById('status').innerText;
//       return status.includes('success');
//     });

//     console.log('Verify Payment ID in response');
//     await page.waitForFunction(() => {
//       const response = document.getElementById('response').innerText;
//       const res = JSON.parse(response);
//       return typeof res.razorpay_payment_id === 'string';
//     });

    
//   });
// });
