'use strict'

const CheckoutForm = require('../pageobjects/checkout-form')
const checkoutForm = new CheckoutForm()

before(() => {
  checkoutForm.loadFrame()
})

describe('Validate email & phone fields', () => {
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
