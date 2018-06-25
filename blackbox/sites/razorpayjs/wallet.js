const { delay } = require('../../util');
const RazorpayJsTest = require('../../plans/RazorpayJsTest');

module.exports = {
  test: browser =>
    Wallet.test(browser, {
      options: {
        method: 'wallet',
        wallet: 'mobikwik'
      }
    })
};

class Wallet extends RazorpayJsTest {}
