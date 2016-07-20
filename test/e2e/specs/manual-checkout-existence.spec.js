'use strict';
let manualCheckoutURL = '/manual-checkout.html';

describe('Index Page loaded', () => {
  it('Test page should have the right title - Everything is good to go now', () => {
    browser.url(manualCheckoutURL);
    let title = browser.getTitle();
    assert.equal(title, 'Razorpay Manual Checkout');
  });
});

describe('Loads RZP Modal', () => {
  it('Clicking on the `Pay Now` button should open RZP iframe', () => {
    browser.url(manualCheckoutURL);
    browser.click('#rzp-button');
    expect(browser.$('.razorpay-container')).to.exist;
    expect(browser.$('.razorpay-backdrop')).to.exist;
    expect(browser.$('.razorpay-container .razorpay-checkout-frame')).to.exist;

    // Runs on `index.html`
    exec(() => {
      console.log(`Should be main ${document.body.getAttribute('id')}`);
    });

    // Runs on `checkout-iframe.html`
    execOnFrame(() => {
      console.log(`Should be iframe ${document.body.getAttribute('id')}`);

      expect(jQuery('#container')).to.have.length(1);
      expect(jQuery('#modal')).to.have.length(1);
      expect(jQuery('#powered-by')).to.have.length(1);
      expect(jQuery('#backdrop')).to.have.length(1);
    });
  });
});

describe('Options & prefills', () => {
  it('rzp options should load correctly', () => {
    browser.url(manualCheckoutURL);
    browser.click('#rzp-button');

    let data = exec(() => {
      return options;
    });

    execOnFrame((data) => {
      assert.equal(
        jQuery('#logo > img').attr('src'),
        data.image,
        'Image loaded correctly'
      );

      assert.equal(
        Number(jQuery('#amount').clone().children().remove().end().text().trim()),
        Number(data.amount)/100,
        'Amount is shown correctly'
      );

      assert.equal(
        jQuery('#merchant-name').text(),
        data.name,
        'Merchant name is shown correctly'
      );

      assert.equal(
        jQuery('#merchant-desc').text(),
        data.description,
        'Description is shown correctly'
      );

      assert.equal(
        jQuery('#email').val(),
        data.prefill.email,
        'Email is prefilled'
      );

      assert.isNotTrue(
        jQuery('#contact').val(),
        'Phone field is left empty, when prefill is not provided'
      );

      assert.equal(
        rgb2hex(jQuery('#header').css('background-color')),
        (data.theme.color || '').toLowerCase(),
        'Theme color is set'
      );
    }, data);
  });
});
