import { getOption, getPreferences } from 'razorpay';
import { hasProp } from 'utils/object';
import fetch from 'utils/fetch';
import { TRAFFIC_ENV } from 'common/constants';

const SESSION_CREATED = 'session_created';
const SESSION_ERRORED = 'session_errored';
let sessionCreated = false;
let sessionErrored = false;

function getEventName(event) {
  const isCanary = TRAFFIC_ENV === 'canary' ? '.canary' : '';
  const isBaseline = TRAFFIC_ENV === 'baseline' ? '.baseline' : '';
  if (event === SESSION_CREATED) {
    return `checkout${isCanary || isBaseline}.sessionCreated.metrics`;
  } else {
    return `checkout${isCanary || isBaseline}.sessionErrored.metrics`;
  }
}
function createEventObject(event, severity) {
  const name = getEventName(event);
  const metrics = [
    {
      name,
      labels: [
        {
          type: event,
          env: TRAFFIC_ENV,
        },
      ],
    },
  ];
  if (severity) {
    metrics[0].labels[0]['severity'] = severity;
  }
  return metrics;
}

function trackAvailabilty(event, severity) {
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
      data:
        trackingPayload
        |> _Obj.stringify
        |> encodeURIComponent
        |> unescape
        |> btoa
        |> encodeURIComponent,
    },
  };
  const key = getPreferences('merchant_key') || getOption('key') || '';
  if (key && key.indexOf('test_') > -1) {
    return;
  }
  if (
    (!sessionCreated && event === SESSION_CREATED) ||
    (!sessionErrored && event === SESSION_ERRORED)
  ) {
    try {
      if (useBeacon) {
        navigator.sendBeacon(postData.url, _Obj.stringify(postData.data));
      } else {
        fetch.post(postData);
      }
      if (event === SESSION_CREATED) {
        sessionCreated = true;
      }
      if (event === SESSION_ERRORED) {
        sessionErrored = true;
      }
    } catch (e) {}
  }
}
export { trackAvailabilty };
