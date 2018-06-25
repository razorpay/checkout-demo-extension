const { delay } = require('../../util');
const RazorpayJsTest = require('../../plans/RazorpayJsTest');

module.exports = {
  test: browser =>
    Netbanking.test(browser, {
      options: {
        method: 'netbanking',
        wallet: 'HDFC'
      }
    })
};

class Netbanking extends RazorpayJsTest {}
