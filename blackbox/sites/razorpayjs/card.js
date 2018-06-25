const { delay } = require('../../util');
const RazorpayJsTest = require('../../plans/RazorpayJsTest');

module.exports = {
  test: browser =>
    Card.test(browser, {
      options: {
        method: 'card',
        'card[number]': '4111111111111111',
        'card[name]': 'test',
        'card[expiry_month]': '12',
        'card[expiry_year]': '32',
        'card[expiry_cvv]': '000'
      }
    })
};

class Card extends RazorpayJsTest {}
