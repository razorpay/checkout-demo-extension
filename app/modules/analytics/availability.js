import { getOption, getPreferences } from 'razorpay';
import { hasProp } from 'utils/object';
import fetch from 'utils/fetch';
import { syncAvailability } from 'common/meta';
import Interface from 'common/interface';
import { TRAFFIC_ENV } from 'common/constants';

const SESSION_CREATED = 'session_created';
const SESSION_ERRORED = 'session_errored';
let sessionCreated = false;
let sessionErrored = false;

function getEventName(event) {
  if (event === SESSION_CREATED) {
    return `checkout.${TRAFFIC_ENV}.sessionCreated.metrics`.replace(
      '.production',
      ''
    );
  }
  return `checkout.${TRAFFIC_ENV}.sessionErrored.metrics`.replace(
    '.production',
    ''
  );
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
