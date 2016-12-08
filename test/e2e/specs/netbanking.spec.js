'use strict'

const utils = require('../helpers/utils')
const CheckoutForm = require('../pageobjects/checkout-form')
const checkoutForm = new CheckoutForm()

before(() => {
  checkoutForm.loadFrame()
})

describe('Net Banking', () => {
  describe('Fill Commonfields & switch to net banking', () => {
    it('Verify tab switching', () => {
      checkoutForm.fillCommonFields()
      browser.click('#payment-options > [tab=netbanking]')

      assert.equal(
        browser.css('#form-card', 'display'),
        'none',
        'Card form is hidden'
      )

      assert.equal(
        browser.css('#form-common', 'display'),
        'none',
        'Common form fields is hidden'
      )

      assert.equal(
        browser.css('#form-netbanking', 'display'),
        'block',
        'Netbanking form is shown'
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
        'netbanking',
        'Netbanking screen is shown - `tab` attribute is set to `netbanking`'
      )

      assert.equal(
        browser.getAttribute('#body', 'screen'),
        'netbanking',
        'Netbanking screen is shown - `screen` attribute is set to `netbanking`'
      )

      assert.isOk(
        browser.hasClass('#body', 'sub'),
        'Card screen with pay button is shown - `sub` class added'
      )
    })

    it('PAY button is shown', () => {
      browser.waitUntil(() => {
        return browser.css('#footer', 'transform') === 'none'
      })

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
        'Netbanking',
        'Tab title is set to `Card`'
      )

      assert.equal(
        browser.getText('#user'),
        checkoutForm.filled_contact,
        'Entered phone number is set at the top bar'
      )
    })

    it('Loads popular banks tiles', () => {
      assert.equal(
        browser.elements('#netb-banks .netb-bank').value.length,
        6,
        '6 popular banks are shown'
      )

      assert.isAtLeast(
        browser.elements('#bank-select > option').value.length,
        10,
        'Other banks loaded'
      )

      assert.equal(
        browser.getText('#bank-select option:checked'),
        'Select a different Bank',
        'By default, `Select a different Bank` options is selected in the selectbox'
      )
    })

    it('Selecting popular bank should select the correct option in selectbox', () => {
      browser.click('label[for="bank-radio-HDFC"]')
      assert.equal(
        browser.getValue('#bank-select'),
        browser.getValue('#bank-radio-HDFC'),
        'Selected correct value in the selected box'
      )

      browser.click('label[for="bank-radio-UTIB"]')
      assert.equal(
        browser.getValue('#bank-select'),
        browser.getValue('#bank-radio-UTIB'),
        'Selected correct value in the selected box'
      )
    })

    it('Should select correct bank tile, when bank is selected from the select box', () => {
      browser.selectByValue('#bank-select', 'YESB')
      assert.isOk(browser.getAttribute('#bank-radio-YESB', 'checked'), 'Yes bank radio button is checked')

      assert.equal(
        utils.rgb2hex(browser.css('#bank-radio-YESB+label', 'background-color')),
        '#f0f0f0',
        'Label for selected bank tile is styled'
      )
    })

    it('Should not select any bank tile, when popular bank is not chosen', () => {
      browser.selectByValue('#bank-select', 'VIJB')
      assert.isNotOk($('input[type=radio]:checked'), 'None of the popular bank is selected')
    })
  })

  describe('PAY via netbanking', () => {
    require('./partials/direct-pay')()
  })
})
