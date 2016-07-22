'use strict'

const Page = require('./page');

function getElement(selector) {
  return {
    get() {
      return browser.element(selector);
    }
  }
}

const defaultValues = {
  contact: '18002700323',
  email: 'rzp@gmail.com',
  cardNumber: '4111 1111 1111 1111',
  cardExpiry: '11/21',
  cardCVV: '121',
  cardHolderName: 'Razorpay'
};

function defineProperty(context, prop, selector) {
  Object.defineProperty(context, prop, {
    get() { return browser.element(selector) }
  })
}

function CheckoutForm() {
  defineProperty(this, 'contact', '#contact');
  defineProperty(this, 'email', '#email');
}

CheckoutForm.prototype = {
  fillCommonFields(data) {
    let commonFields = ['contact', 'email'];
    this._fillFields(commonFields, data);
  },

  _fillFields(cardFields, data) {
    data = data || {};
    cardFields.forEach((fieldName) => {
      let value = data[fieldName] || defaultValues[fieldName];
      this[fieldName].setValue(value);
      this[`filled_${fieldName}`] = value;
    });
  },

  open() {
    browser.url('/manual-checkout.html')
    browser.click('#rzp-button');
  }
}

module.exports = CheckoutForm;
