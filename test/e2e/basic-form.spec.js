describe('Index Page loaded', function() {
  it('Test page should have the right title - Everything is good to go now', function () {
    browser.url('/');
    var title = browser.getTitle();
    assert.equal(title, 'Razorpay Checkout');
  });
});

describe('Loads RZP Modal', function() {
  it('Clicking on the `Pay Now` button should open RZP iframe', function() {
    browser.url('/');
    browser.click('#rzp-button');
    expect(browser.$('.razorpay-container')).to.exist;
    expect(browser.$('.razorpay-backdrop')).to.exist;
    expect(browser.$('.razorpay-container .razorpay-checkout-frame')).to.exist;

    // Runs on `index.html`
    exec(() => {
      console.log(`Should be main ${document.body.getAttribute('id')}`);
    });

    browser.frame(browser.$('iframe.razorpay-checkout-frame'));
    // Runs on `checkout-iframe.html`
    exec(() => {
      console.log(`Should be iframe ${document.body.getAttribute('id')}`);
    });
  });
});
