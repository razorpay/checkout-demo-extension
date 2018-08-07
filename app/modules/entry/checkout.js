import Razorpay, { optionValidations } from 'common/Razorpay';
import { RazorpayDefaults } from 'common/options';
import 'checkoutjs/options';
import initRazorpayCheckout from 'checkoutjs/open';

import Track from 'tracker';
Track.props.library = 'checkoutjs';

RazorpayDefaults.handler = function(data) {
  if (_.is(this, Razorpay)) {
    var callback_url = this.get('callback_url');
    if (callback_url) {
      _Doc.submitForm(callback_url, data, 'post');
    }
  }
};

RazorpayDefaults.buttontext = 'Pay Now';
RazorpayDefaults.parent = null;

optionValidations.parent = function(parent) {
  if (!_Doc.resolveElement(parent)) {
    return "parent provided for embedded mode doesn't exist";
  }
};

initRazorpayCheckout();

export default Razorpay;
