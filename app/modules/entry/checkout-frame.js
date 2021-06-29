import Razorpay from 'common/Razorpay';
import RazorpayConfig from 'common/RazorpayConfig';
import 'checkoutjs/options';
import 'payment';
import 'analytics/track-errors';
import { Track } from 'analytics';
import 'lib/polyfill';

Track.props.library = 'checkoutjs';

if (_.getQueryParams(global.location.search).canary) {
  Track.props.env = 'canary';
}

RazorpayConfig.api = _Doc.resolveUrl(RazorpayConfig.frameApi);
