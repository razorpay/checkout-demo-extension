'use strict'

const CheckoutForm = require('../pageobjects/checkout-form')
const checkoutForm = new CheckoutForm()

let manualCheckoutURL = '/manual-checkout.html'
let currentTabId
let data

before(() => {
  checkoutForm.loadFrame()
  currentTabId = browser.getCurrentTabId()
  data = browser.exec(() => {
    return options
  }).value
})

describe('Card Payment', () => {
  describe('Fill Card details', () => {
    it('Switch tab when card payment tab is clicked', () => {
      checkoutForm.fillCommonFields()
      browser.click('#payment-options > [tab=card]')

      assert.equal(
        browser.css('#form-card', 'display'),
        'block',
        'Card form is shown'
      )

      assert.equal(
        browser.css('#form-common', 'display'),
        'none',
        'Common form fields is hidden'
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

      assert.equal(
        browser.getAttribute('#body', 'tab'),
        'card',
        'Card screen is shown - `tab` attribute is set to `card`'
      )

      assert.equal(
        browser.getAttribute('#body', 'screen'),
        'card',
        'Card screen is shown - `screen` attribute is set to `card`'
      )

      assert.isOk(
        browser.hasClass('#body', 'sub'),
        'Card screen with pay button is shown - `sub` class added'
      )
    })

    it('PAY button is shown', () => {
      browser.pause(300)
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

    it('Top bar is filled with correct title & phone', () => {
      assert.equal(
        browser.css('#topbar', 'display'),
        'block',
        'Topbar is shown'
      )

      assert.equal(
        browser.getText('#tab-title'),
        'Card',
        'Tab title is set to `Card`'
      )

      assert.equal(
        browser.getText('#user'),
        checkoutForm.filled_contact,
        'Entered phone number is set at the top bar'
      )
    })

    it('Card holder\'s name is prefilled as expected', () => {
      assert.equal(
        browser.getAttribute('#card_name', 'value'),
        data.prefill.name,
        'Card holder\'s name is prefilled'
      )
    })
  })

  describe('PAY via card', () => {
    before(() => {
      checkoutForm.fillCardFields()
    })
    require('./partials/direct-pay')()
  })
})
