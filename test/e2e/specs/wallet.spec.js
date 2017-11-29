'use strict';

const utils = require('../helpers/utils');
const CheckoutForm = require('../pageobjects/checkout-form');
const checkoutForm = new CheckoutForm();

let data;

before(() => {
  checkoutForm.loadFrame();
  data = browser.exec(() => {
    return options;
  }).value;
});

function assertOTP() {
  browser.waitUntil(
    () => {
      return (
        browser.getText('#otp-prompt') ===
        `Sending OTP to ${checkoutForm.filled_contact}`
      );
    },
    10000,
    '',
    1000
  );

  assert.equal(
    browser.getText('#otp-prompt'),
    `Sending OTP to ${checkoutForm.filled_contact}`,
    '`Sending OTP` text is shown'
  );

  assert.equal(
    browser.css('#form-wallet', 'display'),
    'none',
    'Wallet form is hidden'
  );

  browser.waitUntil(
    () => {
      return (
        browser.getText('#otp-prompt') ===
        `An OTP has been sent on\n${checkoutForm.filled_contact}`
      );
    },
    10000,
    '',
    1000
  );

  assert.equal(
    browser.getText('#otp-prompt'),
    `An OTP has been sent on\n${checkoutForm.filled_contact}`,
    'The text is updated after a delay once otp request is send'
  );

  assert.equal(
    browser.css('#otp-elem', 'display'),
    'block',
    'OTP input box is shown'
  );
}

describe('Wallet Payment', () => {
  describe('Fill common fields & click on wallet', () => {
    it('Switch tab when wallet tab is clicked', () => {
      checkoutForm.fillCommonFields();
      browser.click('#payment-options > [tab=wallet]');

      assert.equal(
        browser.css('#form-card', 'display'),
        'none',
        'Card form is hidden'
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
        'block',
        'Wallet form is hidden'
      );

      assert.equal(
        browser.css('#form-otp', 'display'),
        'none',
        'OTP form is hidden'
      );

      assert.equal(
        browser.getAttribute('#body', 'tab'),
        'wallet',
        'Wallet screen is shown - `tab` attribute is set to `wallet`'
      );

      assert.equal(
        browser.getAttribute('#body', 'screen'),
        'wallet',
        'Wallet screen is shown - `screen` attribute is set to `wallet`'
      );

      assert.isOk(
        browser.hasClass('#body', 'sub'),
        'Wallet screen with pay button is shown - `sub` class added'
      );
    });

    it('PAY button is shown', () => {
      browser.waitUntil(() => {
        return browser.css('#footer', 'transform') === 'none';
      });

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
        'Wallet',
        'Tab title is set to `Wallet`'
      );

      assert.equal(
        browser.getText('#user'),
        checkoutForm.filled_contact,
        'Entered phone number is set at the top bar'
      );
    });
  });

  describe('Wallets should be shown based on the passed option', () => {
    it('All wallets are loaded initially', () => {
      assert.equal(
        browser.elements('#wallets .wallet').value.length,
        3,
        'All Wallets loaded'
      );
    });
  });

  describe('Select a wallet', () => {
    it('Selecting a particular wallet gets highlighted', () => {
      browser.click('label[for="wallet-radio-mobikwik"]');

      assert.equal(
        utils.rgb2hex(
          browser.css('#wallet-radio-mobikwik+label', 'background-color')
        ),
        '#fcfcfc',
        'Label for selected wallet is styled'
      );
    });
  });

  describe('Wallet OTP', () => {
    it('Prompt for OTP', () => {
      browser.click('#footer');
      assert.equal(
        browser.css('#form-otp', 'display'),
        'block',
        'OTP form is shown'
      );
      assertOTP();
    });

    it('OTP Resend', () => {
      browser.click('#otp-resend');
      assertOTP();
    });
  });

  describe('PAY via wallet', () => {
    describe('User account with sufficient balance', () => {
      it('Fill OTP & submit', () => {
        browser.setValue('#otp', '112211');
        browser.click('#footer');

        assert.equal(
          browser.getText('#otp-prompt'),
          'Verifying OTP',
          '`Verifying OTP` text is shown'
        );
      });
    });
  });
});
