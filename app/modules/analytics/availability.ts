import { getOption, getPreferences } from 'razorpay';
import { hasProp } from 'utils/object';
import fetch from 'utils/fetch';
import { syncAvailability } from 'common/meta';
import Interface from 'common/interface';
import { TRAFFIC_ENV } from 'common/constants';
import type { SEVERITY_LEVELS } from 'error-service/models';
import type { ValueOf } from 'types/utils';

type Metrics = {
  name: string;
  labels: {
    type: EventType;
    env: string;
    severity?: SeverityValue;
  }[];
};

const SESSION_CREATED = 'session_created';
const SESSION_ERRORED = 'session_errored';
let sessionCreated = false;
let sessionErrored = false;
type EventType = typeof SESSION_CREATED | typeof SESSION_ERRORED;
type SeverityValue = ValueOf<typeof SEVERITY_LEVELS>;

let env = TRAFFIC_ENV as string;
try {
  if (
    location.href.indexOf('https://api.razorpay.com/v1/checkout/public') === 0
  ) {
    const envPrefix = 'traffic_env=';
    const envString = location.search
      .slice(1)
      .split('&')
      .filter((a) => a.indexOf(envPrefix) === 0)[0];
    if (envString) {
      env = envString.slice(envPrefix.length);
    }
  }
} catch (e) {}

function getEventName(event: EventType) {
  if (event === SESSION_CREATED) {
    return `checkout.${env}.sessionCreated.metrics`.replace('.production', '');
  }
  return `checkout.${env}.sessionErrored.metrics`.replace('.production', '');
}
function createEventObject(event: EventType, severity: SeverityValue) {
  const name = getEventName(event);
  const metrics: Metrics[] = [
    {
      name,
      labels: [
        {
          type: event,
          env,
        },
      ],
    },
  ];
  if (severity) {
    metrics[0].labels[0]['severity'] = severity;
  }
  return metrics;
}

function trackAvailabilty(event: EventType, severity: SeverityValue) {
  // Use sendBeacon if supported.
  const useBeacon = hasProp(navigator, 'sendBeacon');

  const trackingPayload = {
    metrics: createEventObject(event, severity),
  };

  /**
   * We are doing encodeURIComponent → unescape here to remove all the
   * non-latin characters to latin
   */
  const postData = {
    url: 'https://lumberjack-metrics.razorpay.com/v1/frontend-metrics',
    data: {
      key: 'ZmY5N2M0YzVkN2JiYzkyMWM1ZmVmYWJk',
      data: encodeURIComponent(
        btoa(unescape(encodeURIComponent(JSON.stringify(trackingPayload))))
      ),
    },
  };
  const key = getPreferences('merchant_key') || getOption('key') || '';
  const isErrorSession = event === SESSION_ERRORED;
  // in case of error track anyway
  if ((key && key.indexOf('test_') > -1) || (!key && !isErrorSession)) {
    return;
  }

  if (
    (!sessionCreated && event === SESSION_CREATED) ||
    (!sessionErrored && event === SESSION_ERRORED)
  ) {
    try {
      if (useBeacon) {
        navigator.sendBeacon(postData.url, JSON.stringify(postData.data));
      } else {
        fetch.post(postData);
      }
      if (event === SESSION_CREATED) {
        sessionCreated = true;
      }
      if (event === SESSION_ERRORED) {
        sessionErrored = true;
      }
      syncAvailability(sessionCreated, sessionErrored);
    } catch (e) {}
  }
}

Interface.subscribe('syncAvailability', (data) => {
  const { sessionCreated: session, sessionErrored: error } = data.data || {};
  sessionCreated = typeof session === 'boolean' ? session : sessionCreated;
  sessionErrored = typeof error === 'boolean' ? error : sessionErrored;
});

export { trackAvailabilty };
