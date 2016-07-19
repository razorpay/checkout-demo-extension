var assert = require('assert');

describe('Index Page loaded', function() {
  it('should have the right title - the fancy generator way', function () {
    browser.url('/test/e2e/index.html');
    var title = browser.getTitle();
    assert.equal(title, 'Razorpay Checkout');
  });
});
