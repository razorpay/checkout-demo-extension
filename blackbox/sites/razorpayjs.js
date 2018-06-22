const { delay, loadRazorpayJs } = require('../util');

module.exports = async page =>
  new Promise(async (resolve, reject) => {
    await loadRazorpayJs(page);

    await page.evaluate(`Razorpay.configure({
      contact: '9999999999',
      email: 'void@razorpay.com',
      key: 'm1key',
      amount: 100
    });`);

    var allOptions = [
      {
        name: 'Netbanking Payment with pause',
        paused: true,
        options: {
          method: 'netbanking',
          bank: 'HDFC'
        }
      },
      {
        name: 'Wallet Payment with pause',
        paused: true,
        options: {
          method: 'wallet',
          wallet: 'mobikwik'
        }
      },
      {
        name: 'Card Payment with pause',
        paused: true,
        options: {
          method: 'card',
          'card[number]': '4111111111111111',
          'card[name]': 'test',
          'card[expiry_month]': '12',
          'card[expiry_year]': '32',
          'card[expiry_cvv]': '000'
        }
      },
      {
        name: 'Card payment',
        options: {
          method: 'card',
          'card[number]': '4111111111111111',
          'card[name]': 'test',
          'card[expiry_month]': '12',
          'card[expiry_year]': '32',
          'card[expiry_cvv]': '000'
        }
      },
      {
        name: 'Wallet Payment',
        options: {
          method: 'wallet',
          wallet: 'mobikwik'
        }
      },
      {
        name: 'Netbanking Payment',
        options: {
          method: 'netbanking',
          bank: 'HDFC'
        }
      }
    ];

    await page.exposeFunction('completeHandler', (data, params) => {
      var success = false;
      var data = typeof data === 'object' ? data : JSON.parse(data);

      if (data.razorpay_payment_id) {
        success = true;
      }

      console.log(
        `razorpayjs: ${params.testName} ${success ? 'passed' : 'failed'}`
      );

      if (success) {
        params.isLast && resolve();
      } else {
        reject();
      }
    });

    for (let i = 0, len = allOptions.length; i < len; i++) {
      let testName = allOptions[i].name;
      let options = allOptions[i].options;
      let paused = allOptions[i].paused;
      let pausedCancel = allOptions[i].paused_cancel;
      let pausedParams = { paused: true, message: 'Confirming order..' };

      await page.evaluate(`document.body.onclick = function(){
        var razorpay = new Razorpay({});
        console.log(${JSON.stringify(options)});
        var params = {
          testName: "${testName}",
          isLast: ${i === len - 1}
        };
        var completeFn = data => completeHandler(data, params);
        razorpay.createPayment(${JSON.stringify(options)}
        ${paused ? ', ' + JSON.stringify(pausedParams) : ''})
          .on('payment.success', completeFn)
          .on('payment.error', completeFn);

        ${paused ? 'razorpay.emit("payment.resume")' : ''};
      }`);
      await page.evaluate('document.body.click()');
    }
  });
