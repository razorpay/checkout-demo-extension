import 'lib/polyfill/checkout';
// TODO - explore if the modules/error-service can be leveraged here, to reduce duplication
import '../../../cfu/src/error-service';
import Razorpay, { optionValidations } from 'common/Razorpay';
import { RazorpayDefaults } from 'common/options';
import 'checkoutjs/options';
import 'checkoutjs/magic-checkout-btn';
import initRazorpayCheckout from 'checkoutjs/open';
import { Track } from 'analytics';
import 'analytics/track-errors';
import { resolveElement } from 'utils/doc';
import { submitForm } from 'common/form';
import * as _ from 'utils/_';
import { EventsV2, ContextProperties } from 'analytics-v2';
import { COMMIT_HASH } from 'common/constants';

const library = 'checkoutjs';
Track.props.library = library;
EventsV2.setContext(ContextProperties.LIBRARY, library);
EventsV2.setContext(ContextProperties.VERSION, COMMIT_HASH);

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
