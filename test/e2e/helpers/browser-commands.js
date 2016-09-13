'use strict'

module.exports = {
  checkoutFrame() {
    return browser.frame(browser.element('iframe.razorpay-checkout-frame').value)
  },

  css(selector, property) {
    return browser.getCssProperty(selector, property).value
  },

  exec() {
    return browser.execute.apply(browser, arguments)
  },

  execOnFrame() {
    browser.checkoutFrame()
    return browser.execute.apply(browser, arguments)
  },

  hasClass(selector, className) {
    let classes = browser.getAttribute(selector, 'class') || ''
    return classes.split(' ').indexOf(className) !== -1
  }
}
