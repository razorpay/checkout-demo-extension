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

    // browser.frame(browser.$('iframe.razorpay-checkout-frame'));
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

describe('prefills & data attrs', () => {
  it('`script` data-attributes should load correctly', () => {
    browser.url(automaticCheckoutURL);
    browser.click('.razorpay-payment-button');

    let data = exec(() => {
      return jQuery('form#checkout-form > script').data();
    });

    exec((data) => {
      assert.equal(
        jQuery('.razorpay-payment-button').val(),
        data.buttontext,
        'Button text is set correctly'
      );
    }, data);


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
        data['prefill.email'],
        'Email is prefilled'
      );

      assert.isNotTrue(
        jQuery('#contact').val(),
        'Phone field is left empty, when prefill is not provided'
      );

      assert.equal(
        rgb2hex(jQuery('#header').css('background-color')),
        (data['theme.color'] || '').toLowerCase(),
        'Theme color is set'
      );
    }, data);
  });
});
