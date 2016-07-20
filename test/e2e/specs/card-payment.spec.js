'use strict';
let manualCheckoutURL = '/manual-checkout.html';
let phoneNumber = '9884251048';
let cardNumber = '4111 1111 1111 1111';
let cardExpiry = '11/21';
let cardCVV = '121';

before(() => {
  browser.url(manualCheckoutURL);
  browser.click('#rzp-button');
});

describe('Card Payment', () => {
  it('Switch tab when card payment tab is clicked', () => {
    browser.checkoutFrame();
    browser.setValue('#contact', phoneNumber);
    browser.click('#payment-options > [tab=card]');

    assert.equal(
      browser.getCssProperty('#form-card', 'display').value,
      'block',
      'Card form is shown'
    );

    assert.equal(
      browser.getCssProperty('#form-common', 'display').value,
      'none',
      'Common form fields is hidden'
    );

    assert.equal(
      browser.getCssProperty('#form-netbanking', 'display').value,
      'none',
      'Netbanking form is hidden'
    );

    assert.equal(
      browser.getCssProperty('#form-wallet', 'display').value,
      'none',
      'Wallet form is hidden'
    );

    assert.equal(
      browser.getCssProperty('#form-otp', 'display').value,
      'none',
      'OTP form is hidden'
    );

    assert.equal(
      browser.getAttribute('#body', 'tab'),
      'card',
      'Card screen is shown - `tab` attribute is set to `card`'
    );

    assert.equal(
      browser.getAttribute('#body', 'screen'),
      'card',
      'Card screen is shown - `screen` attribute is set to `card`'
    );

    assert.isOk(
      browser.hasClass('#body', 'sub'),
      'Card screen with pay button is shown - `sub` class added'
    );
  });

  it('PAY button is shown', () => {
    browser.pause(300);
    assert.equal(
      browser.getCssProperty('#footer', 'transform').value,
      'none',
      'Button is shown - removes the negative transform'
    );

    assert.equal(
      browser.getCssProperty('#footer', 'opacity').value,
      '1',
      'Button is visible - by removing zero opacity'
    );
  });

  it('Top bar is filled with correct title & phone', () => {
    assert.equal(
      browser.getCssProperty('#topbar', 'display').value,
      'block',
      'Topbar is shown'
    );

    assert.equal(
      browser.getText('#tab-title'),
      'Card',
      'Tab title is set to `Card`'
    );

    assert.equal(
      browser.getText('#user'),
      phoneNumber,
      'Entered phone number is set at the top bar'
    );
  });

  it('Card holder\'s name is prefilled as expected', () => {
    browser.frameParent();
    let data = browser.exec(() => {
      return options;
    }).value;

    browser.checkoutFrame();
    assert.equal(
      browser.getAttribute('#card_name', 'value'),
      data.prefill.name,
      'Card holder\'s name is prefilled'
    );
  });

  it('Card Number field validation', () => {
    browser.click('#footer');
    assert.isOk(
      browser.hasClass('#elem-card', 'invalid'),
      'Card Number is invalid - `invalid` class is added'
    );

    assert.isOk(
      browser.hasClass('#elem-card', 'focused'),
      'Empty Card Number is focused - `focused` class is added'
    );

    assert.isOk(
      browser.getCssProperty('#elem-card .help', 'opacity').value,
      'Empty card number help text is shown'
    );

    browser.setValue('#card_number', cardNumber);
    browser.pause(300);

    assert.isOk(
      browser.hasClass('#elem-card', 'filled'),
      'Card Number is filled - `filled` class is added'
    );

    assert.isNotOk(
      browser.hasClass('#elem-card', 'invalid'),
      'Card Number is valid - `invalid` class is removed'
    );

    assert.isNotOk(
      browser.getCssProperty('#elem-card .help', 'opacity').value,
      'Empty card number help text is hidden'
    );
  });

  it('Card Expiry field validation', () => {
    browser.click('#footer');
    assert.isOk(
      browser.hasClass('.elem-expiry', 'invalid'),
      'Card Expiry is invalid - `invalid` class is added'
    );

    assert.isOk(
      browser.hasClass('.elem-expiry', 'focused'),
      'Empty Card Expiry is focused - `focused` class is added'
    );

    browser.setValue('#card_expiry', cardExpiry);

    assert.isNotOk(
      browser.hasClass('#elem-card', 'invalid'),
      'Card Expiry is valid - `invalid` class is removed'
    );

    assert.isOk(
      browser.hasClass('.elem-expiry', 'filled'),
      'Card Expiry is filled - `filled` class is added'
    );
  });

  it('CVV field validation', () => {
    browser.click('#footer');
    browser.debug();
    assert.isOk(
      browser.hasClass('.elem-cvv', 'invalid'),
      'CVV is invalid - `invalid` class is added'
    );

    assert.isOk(
      browser.hasClass('.elem-cvv', 'focused'),
      'CVV is focused - `focused` class is added'
    );

    browser.setValue('#card_cvv', cardCVV);

    assert.isNotOk(
      browser.hasClass('.elem-cvv', 'invalid'),
      'CVV is valid - `invalid` class is removed'
    );

    assert.isOk(
      browser.hasClass('.elem-cvv', 'filled'),
      'CVV is filled - `filled` class is added'
    );
  });

  it('PAY via card', () => {

  });
});
