import Razorpay, { RazorpayConfig } from 'common/Razorpay';
import 'checkoutjs/options';
import 'payment';
import Track from 'tracker';
import 'lib/polyfill';

Track.props.library = 'checkoutjs';

if (_.getQueryParams(global.location.search).canary) {
  Track.props.env = 'canary';
}

RazorpayConfig.api = _Doc.resolveUrl(RazorpayConfig.frameApi);
