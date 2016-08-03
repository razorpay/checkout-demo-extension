'use strict'

const CheckoutForm = require('../pageobjects/checkout-form')
const checkoutForm = new CheckoutForm()

before(() => {
  checkoutForm.loadFrame()
})

describe('Commonfields validation', () => {
  it('Show error, when phone number is missing', () => {
    browser.click('#payment-options > [tab=card]')
    browser.pause(300)

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

    browser.setValue('#contact', '9884251048')
    assert.isNotOk(
      browser.hasClass('#form-common .elem-contact', 'invalid'),
      'When phone no. is entered, the `invalid` class is removed'
    )

    browser.waitUntil(() => {
      return !browser.css('.elem-contact .help', 'opacity')
    })

    assert.isNotOk(
      browser.css('.elem-contact .help', 'opacity'),
      'When phone is entered, help text is removed'
    )
  })

  it('Show error, when email is missing', () => {
    browser.setValue('#email', '')
    browser.click('#payment-options > [tab=card]')
    browser.pause(300)

    assert.isOk(
      browser.hasClass('#form-common .elem-email', 'invalid'),
      'Empty email field is invalid'
    )

    assert.isOk(
      browser.hasClass('#form-common .elem-email', 'focused'),
      'Empty email field is focused on error'
    )

    assert.isOk(
      browser.css('.elem-email .help', 'opacity'),
      'Empty email help text is shown'
    )

    browser.setValue('#email', 'harshil@razorpay.com')
    assert.isNotOk(
      browser.hasClass('#form-common .elem-email', 'invalid'),
      'When email is entered, the `invalid` class is removed'
    )

    browser.waitUntil(() => {
      return !browser.css('.elem-email .help', 'opacity')
    })

    assert.isNotOk(
      browser.css('.elem-email .help', 'opacity'),
      'When email is entered, help text is removed'
    )
  })
})

describe('Card fields validation', () => {
  it('Card Number field validation', () => {
    browser.click('#payment-options > [tab=card]')
    browser.pause(300)
    browser.click('#footer')
    assert.isOk(
      browser.hasClass('#elem-card', 'invalid'),
      'Card Number is invalid - `invalid` class is added'
    )

    assert.isOk(
      browser.hasClass('#elem-card', 'focused'),
      'Empty Card Number is focused - `focused` class is added'
    )

    assert.isOk(
      browser.css('#elem-card .help', 'opacity'),
      'Empty card number help text is shown'
    )

    browser.setValue('#card_number', '4111 1111 1111 1111')
    browser.pause(300)

    assert.isOk(
      browser.hasClass('#elem-card', 'filled'),
      'Card Number is filled - `filled` class is added'
    )

    assert.isNotOk(
      browser.hasClass('#elem-card', 'invalid'),
      'Card Number is valid - `invalid` class is removed'
    )

    assert.isNotOk(
      browser.css('#elem-card .help', 'opacity'),
      'Empty card number help text is hidden'
    )
  })

  it('Card Expiry field validation', () => {
    browser.click('#footer')
    assert.isOk(
      browser.hasClass('.elem-expiry', 'invalid'),
      'Card Expiry is invalid - `invalid` class is added'
    )

    assert.isOk(
      browser.hasClass('.elem-expiry', 'focused'),
      'Empty Card Expiry is focused - `focused` class is added'
    )

    browser.setValue('#card_expiry', '11/21')

    assert.isNotOk(
      browser.hasClass('#elem-card', 'invalid'),
      'Card Expiry is valid - `invalid` class is removed'
    )

    assert.isOk(
      browser.hasClass('.elem-expiry', 'filled'),
      'Card Expiry is filled - `filled` class is added'
    )
  })

  it('CVV field validation', () => {
    browser.click('#footer')
    assert.isOk(
      browser.hasClass('.elem-cvv', 'invalid'),
      'CVV is invalid - `invalid` class is added'
    )

    browser.setValue('#card_cvv', '121')

    assert.isNotOk(
      browser.hasClass('.elem-cvv', 'invalid'),
      'CVV is valid - `invalid` class is removed'
    )

    assert.isOk(
      browser.hasClass('.elem-cvv', 'filled'),
      'CVV is filled - `filled` class is added'
    )
  })
})
