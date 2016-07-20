'use strict';

const utils = require('../helpers/utils');
let manualCheckoutURL = '/manual-checkout.html';

before(() => {
  browser.url(manualCheckoutURL);
  browser.click('#rzp-button');
});

beforeEach(() => {
  browser.frameParent();
});

describe('Index Page loaded', () => {
  it('Test page should have the right title - Everything is good to go now', () => {
    let title = browser.getTitle();
    assert.equal(title, 'Razorpay Manual Checkout');
  });
});

describe('Loads RZP Modal', () => {
  it('Clicking on the `Pay Now` button should open RZP iframe', () => {
    expect(browser.$('.razorpay-container')).to.exist;
    expect(browser.$('.razorpay-backdrop')).to.exist;
    expect(browser.$('.razorpay-container .razorpay-checkout-frame')).to.exist;

    browser.checkoutFrame();
    expect(browser.$('#container')).to.exist;
    expect(browser.$('#modal')).to.exist;
    expect(browser.$('#powered-by')).to.exist;
    expect(browser.$('#backdrop')).to.exist;
  });
});

describe('Options & prefills', () => {
  it('rzp options should load correctly', () => {
    let data = browser.exec(() => {
      return options;
    }).value;

    browser.checkoutFrame();
    assert.equal(
      browser.getAttribute('#logo > img', 'src'),
      data.image,
      'Image loaded correctly'
    );

    assert.equal(
      browser.getText('#amount'),
      `₹ ${Number(data.amount)/100}`,
      'Amount is shown correctly'
    );

    assert.equal(
      browser.getText('#merchant-name'),
      data.name,
      'Merchant name is shown correctly'
    );

    assert.equal(
      browser.getText('#merchant-desc'),
      data.description,
      'Description is shown correctly'
    );

    assert.equal(
      browser.getAttribute('#email', 'value'),
      data.prefill.email,
      'Email is prefilled'
    );

    assert.isNotTrue(
      browser.getAttribute('#contact', 'value'),
      'Phone field is left empty, when prefill is not provided'
    );

    assert.equal(
      utils.rgb2hex(browser.getCssProperty('#header', 'background-color').value),
      (data.theme.color || '').toLowerCase(),
      'Theme color is set'
    );
  });
});

describe('Modal should close', () => {
  function checkFromParent() {
    browser.frameParent();
    // Uncomment below cases once the issue is fixed in dev

    // assert.equal(
    //   browser.getCssProperty('.razorpay-container', 'display').value,
    //   'none',
    //   'RZP container is removed on escape press'
    // );
    //
    // assert.equal(
    //   browser.getCssProperty('.razorpay-backdrop', 'background-color').value,
    //   '',
    //   'Backdrop is removed on escape press'
    // );
  }

  function checkFromFrame() {
    browser.checkoutFrame();
    browser.waitUntil(() => {
      return !browser.element('#container').value;
    }, 3000);
    assert.isNotOk(browser.$('#container'), 'Iframe container is removed');
  }

  beforeEach(() => {
    browser.url(manualCheckoutURL);
    browser.click('#rzp-button');
  });

  it('Close on escape press, which parent window is focused', () => {
    browser.keys('\uE00C');
    checkFromParent();
    checkFromFrame();
  });

  it('Close on escape press, which iframe is focused', () => {
    browser.checkoutFrame();
    browser.keys('\uE00C');
    checkFromParent();
    checkFromFrame();
  });

  it('Close on closs button click', () => {
    browser.checkoutFrame();
    browser.click('#modal-close');
    checkFromParent();
    checkFromFrame();
  });
});
