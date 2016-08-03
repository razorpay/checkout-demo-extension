'use strict'

const Page = require('./page')

function getElement(selector) {
  return {
    get() {
      return browser.element(selector)
    }
  }
}

const defaultValues = {
  contact: '18002700323',
  email: 'rzp@gmail.com',
  card_number: '4111 1111 1111 1111',
  card_expiry: '11/21',
  card_cvv: '121',
  card_name: 'Razorpay'
}

function defineProperty(context, prop, selector) {
  Object.defineProperty(context, prop, {
    get() { return browser.element(selector) }
  })
}

function CheckoutForm() {
  defineProperty(this, 'contact', '#contact')
  defineProperty(this, 'email', '#email')
  defineProperty(this, 'card_number', '#card_number')
  defineProperty(this, 'card_expiry', '#card_expiry')
  defineProperty(this, 'card_cvv', '#card_cvv')
  defineProperty(this, 'card_name', '#card_name')
}

CheckoutForm.prototype = {
  fillCommonFields(data) {
    let commonFields = ['contact', 'email']
    this._fillFields(commonFields, data)
  },

  fillCardFields(data) {
    let cardFields = ['card_number', 'card_expiry', 'card_cvv', 'card_name']
    this._fillFields(cardFields, data)
  },

  _fillFields(fields, data) {
    data = data || {}
    fields.forEach((fieldName) => {
      let value = data[fieldName] || defaultValues[fieldName]
      this[fieldName].setValue(value)
      this[`filled_${fieldName}`] = value
    })
  },

  loadFrame(options) {
    options = options || {}
    browser.url(`/checkout-frame.html?${encodeURIComponent(JSON.stringify(options))}`)
  },

  open(options) {
    options = options || {}
    browser.url(`/manual-checkout.html?${encodeURIComponent(JSON.stringify(options))}`)
    browser.click('#rzp-button')
  }
}

module.exports = CheckoutForm
