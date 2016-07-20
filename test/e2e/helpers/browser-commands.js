module.exports = {
  checkoutFrame() {
    return browser.frame(browser.$('iframe.razorpay-checkout-frame'));
  },

  $(selector) {
    return browser.element(selector).value;
  },

  exec() {
    return browser.execute.apply(browser, arguments);
  },

  execOnFrame() {
    browser.checkoutFrame();
    return browser.execute.apply(browser, arguments);
  },

  getDirectText(selector) {
    return browser.exec((selector) => {
      return jQuery(selector).clone().children().remove().end().text().trim();
    }, selector).value;
  }
}
