import Razorpay, { RazorpayConfig } from 'common/Razorpay';
import 'checkoutjs/options';
import 'payment';
import Track from 'tracker';
import 'lib/polyfill';

Track.props.library = 'checkoutjs';

if (Boolean(_.query2obj(global.location.search.replace('?', '')).canary)) {
  Track.props.env = 'canary';
}

RazorpayConfig.api = _Doc.resolveUrl(RazorpayConfig.frameApi);
