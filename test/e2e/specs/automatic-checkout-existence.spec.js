'use strict';

let automaticCheckoutURL = '/automatic-checkout.html';

describe('Index Page loaded', () => {
  it('Test page should have the right title - Everything is good to go now', () => {
    browser.url(automaticCheckoutURL);
    let title = browser.getTitle();
    assert.equal(title, 'Razorpay Automatic Checkout');
  });
});

describe('Loads RZP Modal', () => {
  it('Should append `razorpay-payment-button` inside the form', () => {
    browser.url(automaticCheckoutURL);
    expect(browser.$('form#checkout-form > .razorpay-payment-button')).to.exist;
  });

  it('Clicking on `razorpay-payment-button` button should open RZP iframe', () => {
    browser.url(automaticCheckoutURL);
    browser.click('.razorpay-payment-button');
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
      expect($$('#container')).to.have.length(1);
      expect($$('#modal')).to.have.length(1);
      expect($$('#powered-by')).to.have.length(1);
      expect($$('#backdrop')).to.have.length(1);
    });
  });
});
