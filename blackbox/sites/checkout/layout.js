const assert = require('assert');
const { delay, el } = require('../../util');
const CheckoutTest = require('../../plans/CheckoutTest');

module.exports = {
  test: browser =>
    Layout.test(browser, {
      options: {
        key: 'm1key',
        remember_customer: false,
        prefill: {
          contact: '9999999999',
          email: 'void@razorpay.com',
          method: 'upi',
        },
      },
    }),
};

class Layout extends CheckoutTest {
  async render() {
    const { page } = this;

    // let iframe get loaded
    await delay(200);

    let $iframe = await page.$('iframe');

    $iframe = await $iframe.contentFrame();

    assert($iframe, 'Iframe is not Present');

    const $container = await $iframe.$('#container');

    assert($container, 'Container is not Present');

    const containerIsVisible = await el.isVisible($container);

    assert(containerIsVisible, 'Container is not visible on open');

    const $backdrop = await $iframe.$('#backdrop'),
      backdropIsVisble = await el.isVisible($backdrop);

    assert(backdropIsVisble, 'Backdrop is not visible');

    const $poweredBy = await $iframe.$('#powered-by'),
      poweredByIsVisible = await el.isVisible($poweredBy);

    assert(poweredByIsVisible, 'Powered By is not visible');

    const $poweredLink = await $poweredBy.$('#powered-link'),
      { width: poweredWidth } = await $poweredLink.boundingBox();

    assert(poweredWidth > 150, 'Fonts not loaded');

    const $modal = await $container.$('#modal'),
      modalIsVisible = await el.isVisible($modal);

    assert(modalIsVisible, 'Modal is not visible');

    // Header tests

    const $header = await $container.$('#header');

    const $amount = await $header.$('#amount .amount-figure'),
      amountIsVisible = await el.isVisible($amount);

    assert(amountIsVisible, 'Amount is not visible');

    const $close = await $header.$('#modal-close'),
      closeIsVisble = await el.isVisible($close);

    assert(closeIsVisble, 'Close buttin is not visible');

    // Body tests

    const $body = await $container.$('#body');
  }
}
