import 'lib/polyfill/checkout';
import Razorpay, { optionValidations } from 'common/Razorpay';
import { RazorpayDefaults } from 'common/options';
import 'checkoutjs/options';
import 'checkoutjs/magic-checkout-btn';
import initRazorpayCheckout from 'checkoutjs/open';
import { Track } from 'analytics';
import 'analytics/track-errors';
import { resolveElement } from 'utils/doc';
import { submitForm } from 'common/form';

Track.props.library = 'checkoutjs';

RazorpayDefaults.handler = function (data) {
  if (_.is(this, Razorpay)) {
    const callback_url = this.get('callback_url');
    if (callback_url) {
      submitForm({
        url: callback_url,
        params: data,
        method: 'POST',
      });
    }
  }
};

RazorpayDefaults.buttontext = 'Pay Now';
RazorpayDefaults.parent = null;

optionValidations.parent = function (parent) {
  if (!resolveElement(parent)) {
    return "parent provided for embedded mode doesn't exist";
  }
};

initRazorpayCheckout();

export default Razorpay;
