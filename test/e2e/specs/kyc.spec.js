'use strict'

const CheckoutForm = require('../pageobjects/checkout-form')
const checkoutForm = new CheckoutForm()
let order = {
  account_number: 'XXXX56',
  bank: 'ANDB'
}
let preferences

before(() => {
  checkoutForm.loadFrame({
    preferences: {
      order
    }
  })
  preferences = browser.exec(() => {
    return window.preferences
  }).value
})

describe('Know Your Customer. Shows account details of the customer in the upfront', () => {
  describe('Make sure the home screen is shown correctly', () => {
    it('Home screen should be shown', () => {
      assert.isNotOk(
        browser.getAttribute('#body', 'tab'),
        'Home tab is shown'
      )

      assert.isNotOk(
        browser.getAttribute('#body', 'screen'),
        'Home tab is shown'
      )

      assert.equal(
        browser.css('#form-common', 'display'),
        'block',
        'Common/first form fields is shown'
      )

      assert.equal(
        browser.css('#form-card', 'display'),
        'none',
        'Card form is hidden'
      )

      assert.equal(
        browser.css('#form-netbanking', 'display'),
        'none',
        'Netbanking form is hidden'
      )

      assert.equal(
        browser.css('#form-wallet', 'display'),
        'none',
        'Wallet form is hidden'
      )

      assert.equal(
        browser.css('#form-otp', 'display'),
        'none',
        'OTP form is hidden'
      )
    })

    it('PAY button should be shown', () => {
      assert.isOk(
        browser.hasClass('#body', 'sub'),
        'Home screen with pay button is shown - `sub` class added'
      )

      assert.equal(
        browser.css('#footer', 'transform'),
        'none',
        'Button is shown - removes the negative transform'
      )

      assert.equal(
        browser.css('#footer', 'opacity'),
        '1',
        'Button is visible - by removing zero opacity'
      )
    })

    it('Payment options should be hidden', () => {
      assert.equal(
        browser.element('#payment-options').element('..').getCssProperty('display').value,
        'none',
        'Payment options\'s parent container is hidden'
      )
    })

    it('Account details should be shown on home screen', () => {
      assert.isOk(
        browser.element('#form-common > .pad > .customer-bank-details'),
        'Customer account details is shown'
      )

      assert.equal(
        browser.getText('.customer-bank-details > .bank-name'),
        preferences.methods.netbanking[order.bank],
        'Bank name is shown'
      )

      assert.equal(
        browser.getText('.customer-bank-details .account-details div:last-child'),
        order.account_number,
        'Account number is displayed'
      )
    })
  })

  describe('Check error states', () => {
    it('Show error when common fields are not filled', () => {
      browser.click('#footer');

      assert.isOk(
        browser.hasClass('#form-common .elem-contact', 'invalid'),
        'Empty phone field is invalid'
      )

      assert.isOk(
        browser.hasClass('#form-common .elem-contact', 'focused'),
        'Empty phone field is focused on error'
      )

      assert.isOk(
        browser.css('.elem-contact .help', 'opacity'),
        'Empty phone help text is shown'
      )
      checkoutForm.fillCommonFields();
    })
  })

  describe('PAY', () => {
    require('./partials/direct-pay')()
  })
})
