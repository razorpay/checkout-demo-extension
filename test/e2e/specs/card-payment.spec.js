'use strict';

let manualCheckoutURL = '/manual-checkout.html';
let phoneNumber = '18002700323';
let cardNumber = '4111 1111 1111 1111';
let cardExpiry = '11/21';
let cardCVV = '121';
let currentTabId;
let data;

before(() => {
  browser.url(manualCheckoutURL);
  browser.click('#rzp-button');
  currentTabId = browser.getCurrentTabId();
  browser.frameParent();
  data = browser.exec(() => {
    return options;
  }).value;
});

describe('Card Payment', () => {
  describe('Fill Card details', () => {
    it('Switch tab when card payment tab is clicked', () => {
      browser.checkoutFrame();
      browser.setValue('#contact', phoneNumber);
      browser.click('#payment-options > [tab=card]');

      assert.equal(
        browser.css('#form-card', 'display'),
        'block',
        'Card form is shown'
      );

      assert.equal(
        browser.css('#form-common', 'display'),
        'none',
        'Common form fields is hidden'
      );

      assert.equal(
        browser.css('#form-netbanking', 'display'),
        'none',
        'Netbanking form is hidden'
      );

      assert.equal(
        browser.css('#form-wallet', 'display'),
        'none',
        'Wallet form is hidden'
      );

      assert.equal(
        browser.css('#form-otp', 'display'),
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
        browser.css('#footer', 'transform'),
        'none',
        'Button is shown - removes the negative transform'
      );

      assert.equal(
        browser.css('#footer', 'opacity'),
        '1',
        'Button is visible - by removing zero opacity'
      );
    });

    it('Top bar is filled with correct title & phone', () => {
      assert.equal(
        browser.css('#topbar', 'display'),
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
        browser.css('#elem-card .help', 'opacity'),
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
        browser.css('#elem-card .help', 'opacity'),
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
      assert.isOk(
        browser.hasClass('.elem-cvv', 'invalid'),
        'CVV is invalid - `invalid` class is added'
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
  });

  describe('PAY via card', () => {
    it('Open popup', () => {
      browser.click('#footer');
      browser.waitUntil(() => {
        return (browser.getTabIds() || []).length === 2;
      }, 1000);

      let allTabs = browser.getTabIds();
      assert.equal(allTabs.length, 2, 'Popup is opened');
    });

    it('Shows loading indicator in the modal', () => {
      assert.equal(
        browser.css('#modal-inner #error-message', 'display'),
        'block',
        'Loading is shown inside the modal'
      );

      assert.equal(
        browser.css('#modal-inner #overlay', 'display'),
        'block',
        'Loading overlay is shown inside the modal'
      );

      assert.equal(
        browser.getText('#fd-t'),
        'Your payment is being processed',
        'Loading text is shown'
      );

      // assert.equal(
      //   browser.css('#modal-inner #error-message #spin', 'display'),
      //   'block',
      //   'Loading spinner is shown'
      // );
    });

    it('Check the info displayed in the popup', () => {
      let allTabs = browser.getTabIds();
      allTabs.splice(allTabs.indexOf(currentTabId), 1);
      let popup = allTabs[0];
      browser.switchTab(popup);

      assert.equal(
        browser.getAttribute('#top > img', 'src'),
        data.image,
        'Image loaded in the popup'
      );

      assert.equal(
        browser.getText('#top > span'),
        `₹${Number(data.amount)/100}`,
        'Amount is shown in the popup'
      );
    });

    it('Popup is closed & handler function is called', () => {
      browser.waitUntil(() => {
        return (browser.getTabIds() || []).length === 1;
      });

      assert.equal(browser.getTabIds().length, 1, 'Popup is closed');

      browser.switchTab(currentTabId);

      browser.waitUntil(() => {
        return !!browser.alertText();
      });

      let response = JSON.parse(browser.alertText());
      assert.isOk(
        response.razorpay_payment_id,
        'Handler function is passed with `razorpay_payment_id`'
      );
    });
  });
});
