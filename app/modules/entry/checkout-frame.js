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
Track.props.env = params.traffic_env || __TRAFFIC_ENV__ || '__S_TRAFFIC_ENV__'; // eslint-disable-line no-undef
RazorpayConfig.api = resolveUrl(RazorpayConfig.frameApi);

startErrorCapturing();
initIframe();
