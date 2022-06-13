import 'lib/polyfill/checkoutframe';
import 'utils/modal';
import { setSessionConstructor } from 'sessionmanager';
import { initIframe } from 'checkoutframe/iframe';
import Session from 'session';
import 'common/Razorpay';
import RazorpayConfig from 'common/RazorpayConfig';
import 'checkoutjs/options';
import 'payment';
import 'analytics/track-errors';
import { Track } from 'analytics';
import { resolveUrl } from 'utils/doc';
import { startErrorCapturing } from 'error-service';

setSessionConstructor(Session);

Track.props.library = 'checkoutjs';

const params = _.getQueryParams();
const trafficEnv = params.traffic_env || String('__TRAFFIC_ENV__'); // eslint-disable-line no-undef

if (trafficEnv) {
  Track.props.env = trafficEnv;
}
RazorpayConfig.api = resolveUrl(RazorpayConfig.frameApi);

startErrorCapturing();
initIframe();
