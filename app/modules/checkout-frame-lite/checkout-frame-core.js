import '../../checkout.styl';
/** any error on mount and before preference complete track under main checkout (CX) project */
import 'sentry/init';
import 'utils/modal';
import { setSessionConstructor } from 'sessionmanager';
import { initIframe } from 'checkoutframe/iframe';
import Session from 'session';
import 'common/Razorpay';
import RazorpayConfig from 'common/RazorpayConfig';
import 'checkoutjs/options';
import 'payment';
import { Track } from 'analytics';
import { resolveUrl } from 'utils/doc';
import { COMMIT_HASH, TRAFFIC_ENV } from 'common/constants';
import * as _ from 'utils/_';
import { startSentryMonitoring } from 'sentry/http';
import { EventsV2, ContextProperties } from 'analytics-v2';
import { startAnalyticsSyncing } from 'checkoutframe/analytics';

export default function init() {
  setSessionConstructor(Session);

  const library = 'checkoutjs';
  Track.props.library = library;
  EventsV2.setContext(ContextProperties.LIBRARY, library);
  EventsV2.setContext(ContextProperties.VERSION, COMMIT_HASH);

  const params = _.getQueryParams();
  const env = params.traffic_env || TRAFFIC_ENV;
  Track.props.env = env;
  EventsV2.setContext(ContextProperties.ENV, env);

  RazorpayConfig.api = resolveUrl(RazorpayConfig.frameApi);

  startSentryMonitoring();
  initIframe();
  startAnalyticsSyncing();
}
