import 'lib/polyfill/checkoutframe';
import Razorpay from 'common/Razorpay';
import RazorpayConfig from 'common/RazorpayConfig';
import 'checkoutjs/options';
import 'payment';
import 'analytics/track-errors';
import { Track } from 'analytics';

Track.props.library = 'checkoutjs';

const trafficEnv = String('__TRAFFIC_ENV__'); // eslint-disable-line no-undef
if (trafficEnv) {
  Track.props.env = trafficEnv;
}
RazorpayConfig.api = _Doc.resolveUrl(RazorpayConfig.frameApi);
