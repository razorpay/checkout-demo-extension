'use strict'

const utils = require('../helpers/utils')
let automaticCheckoutURL = '/automatic-checkout.html'

before(() => {
  browser.url(automaticCheckoutURL)
  browser.click('.razorpay-payment-button')
})

beforeEach(() => {
  browser.frameParent()
})

describe('Index Page loaded', () => {
  it('Test page should have the right title - Everything is good to go now', () => {
    let title = browser.getTitle()
    assert.equal(title, 'Razorpay Automatic Checkout')
  })
})

describe('Loads RZP Modal', () => {
  it('Should append `razorpay-payment-button` inside the form', () => {
    expect(browser.$('form#checkout-form > .razorpay-payment-button')).to.exist
  })

  it('Clicking on `razorpay-payment-button` button should open RZP iframe', () => {
    expect(browser.$('.razorpay-container')).to.exist
    expect(browser.$('.razorpay-backdrop')).to.exist
    expect(browser.$('.razorpay-container .razorpay-checkout-frame')).to.exist

    browser.checkoutFrame()
    expect(browser.$('#container')).to.exist
    expect(browser.$('#modal')).to.exist
    expect(browser.$('#powered-by')).to.exist
    expect(browser.$('#backdrop')).to.exist
  })
})

describe('prefills & data attrs', () => {
  it('`script` data-attributes should load correctly', () => {
    let data = browser.execute(() => {
      return document.querySelector('form#checkout-form > script').dataset
    }).value

    assert.equal(
      browser.getAttribute('.razorpay-payment-button', 'value'),
      data.buttontext,
      'Button text is set correctly'
    )

    browser.checkoutFrame()
    assert.equal(
      browser.getAttribute('#logo > img', 'src'),
      data.image,
      'Image loaded correctly'
    )

    assert.equal(
      browser.getText('#amount'),
      `₹ ${Number(data.amount)/100}`,
      'Amount is shown correctly'
    )

    assert.equal(
      browser.getText('#merchant-name'),
      data.name,
      'Merchant name is shown correctly'
    )

    assert.equal(
      browser.getText('#merchant-desc'),
      data.description,
      'Description is shown correctly'
    )

    assert.equal(
      browser.getAttribute('#email', 'value'),
      data['prefill.email'],
      'Email is prefilled'
    )

    assert.isNotTrue(
      browser.getAttribute('#contact', 'value'),
      'Phone field is left empty, when prefill is not provided'
    )

    assert.equal(
      utils.rgb2hex(browser.css('#header', 'background-color')),
      (data['theme.color'] || '').toLowerCase(),
      'Theme color is set'
    )
  })
})
