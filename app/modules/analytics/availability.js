const SESSION_CREATED = 'session_created';
const SESSION_ERRORED = 'session_errored';
let sessionCreated = false;
let sessionErrored = false;
function createEventObject(event, severity) {
  const name =
    event === SESSION_CREATED
      ? 'checkout.sessionCreated.metrics'
      : 'checkout.sessionErrored.metrics';
  const metrics = [
    {
      name,
      labels: [
        {
          type: event,
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
  const useBeacon = _Obj.hasProp(navigator, 'sendBeacon');

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
