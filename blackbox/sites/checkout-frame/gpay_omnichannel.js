const CheckoutFrameTest = require('../../plans/CheckoutFrameTest');

const MERCHANT_KEYS = {
  enabled: 'm_gpay_omnichannel_enabled',
  disabled: 'm_gpay_omnichannel_disabled',
};

module.exports = {
  timeout: 10000,
  test: browser => {
    const omnichannelFromPrefillTest = OmnichannelFromPrefill.test(browser, {
      options: {
        key: MERCHANT_KEYS.enabled,
        personalization: false,
        prefill: {
          email: 'void@razorpay.com',
          contact: '8888888888',
        },
      },
    });

    return Promise.all([omnichannelFromPrefillTest]);
  },
};

const SELECTORS = {
  UPI_PAYMENT_METHOD: '.payment-option[tab=upi]',
  GPAY_GRID_ITEM: '#form-upi .svelte-ref-grid > div:nth-child(2)',
  PHONE_ELEM: '#upi-gpay-phone',
  PHONE_INPUT: '#upi-gpay-phone input[name=phone]',
  VPA_ELEM: '#upi-gpay-vpa',
};

class OmnichannelFromPrefill extends CheckoutFrameTest {
  async render() {
    const { page, message } = this;
    const { options } = message;

    // Select UPI method
    await page.click(SELECTORS.UPI_PAYMENT_METHOD);

    // Select Google Pay
    await page.waitForSelector(SELECTORS.GPAY_GRID_ITEM);
    await page.click(SELECTORS.GPAY_GRID_ITEM);

    // Phone number field is present
    await page.waitForSelector(SELECTORS.PHONE_ELEM, {
      visible: true,
    });

    // VPA field is absent
    await page.waitForSelector(SELECTORS.VPA_ELEM, {
      hidden: true,
    });

    const phoneInput = await page.$(SELECTORS.PHONE_INPUT);
    const phoneValue = await page.evaluate(
      element => element.value,
      phoneInput
    );

    if (phoneValue !== options.prefill.contact) {
      throw new Error('Contact is not prefilled');
    }
  }
}
