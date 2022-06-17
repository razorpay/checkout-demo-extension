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
import { TRAFFIC_ENV } from 'common/constants';

setSessionConstructor(Session);

Track.props.library = 'checkoutjs';

const params = _.getQueryParams();
Track.props.env = params.traffic_env || TRAFFIC_ENV;
RazorpayConfig.api = resolveUrl(RazorpayConfig.frameApi);

startErrorCapturing();
initIframe();
