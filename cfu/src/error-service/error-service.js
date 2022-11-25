import { constructErrorObject } from './helpers';
/**
 * make sure while using window functions do prepend `window.`
 */
const SEVERITY_LEVELS = {
  S0: 'S0',
  S1: 'S1',
  S2: 'S2', // Warn
  S3: 'S3', // Trivial
};
let sessionErrored = false;

function createEventObject(event, severity) {
  const name = 'checkout.sessionErrored.metrics';
  const metrics = [
    {
      name,
      labels: [
        {
          type: event,
          severity: severity,
        },
      ],
    },
  ];
  return metrics;
}

export const capture = (
  error,
  { analytics, severity = SEVERITY_LEVELS.S1, unhandled = false }
) => {
  try {
    const { event, data, immediately = true } = analytics || {};
    /**
     * Event name to be used for analytics.
     * Defaulting to 'js_error' till we move to the new system of analytics events
     */
    const eventName = typeof event === 'string' ? event : 'js_error';
    try {
      if (
        (severity === SEVERITY_LEVELS.S0 || severity === SEVERITY_LEVELS.S1) &&
        !sessionErrored
      ) {
        const availabilityTrackingPayload = {
          metrics: createEventObject('session_errored', severity),
        };
        const encodedAvailabilityData = window.encodeURIComponent(
          window.btoa(
            window.unescape(
              window.encodeURIComponent(
                JSON.stringify(availabilityTrackingPayload)
              )
            )
          )
        );
        const postData = {
          url: 'https://lumberjack-metrics.razorpay.com/v1/frontend-metrics',
          data: {
            key: 'ZmY5N2M0YzVkN2JiYzkyMWM1ZmVmYWJk',
            data: encodedAvailabilityData,
          },
        };
        sendRequest(postData);
        const finalMessage = JSON.stringify({
          data: { data: { sessionErrored: true } },
          topic: 'syncAvailability',
          source: '__razorpay',
          time: window.Date.now(),
        });
        // this will send data to all listeners...merchant listener can also listen
        window.postMessage(finalMessage, '*');
        sessionErrored = true;
      }
    } catch (e) {
      // e
    }
    Track(eventName, {
      data: window.Object.assign({}, typeof data === 'object' ? data : {}, {
        /**
         * Intentionally overriding data.error prop to ensure
         * we're following the same structure across all errors
         * reported. If there is any data getting lost we should
         * look at restructuring how the data is passed
         */
        error: constructErrorObject(error, { severity, unhandled }),
      }),
      /**
       * Constructing analytics.immediately property
       * Defaulting to true to ensure we capture all reported errors
       */
      immediately: window.Boolean(immediately),
      isError: true,
    });
  } catch (e) {
    // try/catch to ensure `captureError` does not contribute to more
  }
};

const ERROR_TRACKING_URLS = [
  'https://checkout.razorpay.com',
  'https://checkout-static.razorpay.com',
  'https://checkout-static-next.razorpay.com',
];

function isUrlApplicableForErrorTracking(url) {
  return ERROR_TRACKING_URLS.some(function (availableUrl) {
    return url.indexOf(availableUrl) !== -1;
  });
}

function errorHandler(event) {
  const error = event.error;
  if (
    error &&
    (event.filename || error.stack) &&
    isUrlApplicableForErrorTracking(event.filename || event.error.stack)
  ) {
    const errorObj = {
      message: error.message,
      lineNumber: event.lineno,
      fileName: event.filename,
      columnNumber: event.colno,
      stack: error.stack,
    };
    capture(error, {
      unhandled: true,
      analytics: {
        event: 'js_error',
        // Keeping this for historic reasons. Once we've migrated to new events system we can remove this.
        data: errorObj,
      },
    });
  }
}

export function startErrorCapturing() {
  /**
   * clear listener if we setup listener inside module (prevent duplication report)
   */
  window.addEventListener('message', function (e) {
    // Get the sent data
    let inputData = {};
    try {
      inputData = JSON.parse(e.data);
    } catch (e) {
      // e
    }
    try {
      const { topic } = inputData || {};
      if (topic && topic === 'clearMountErrorListener') {
        window.removeEventListener('error', errorHandler, { capture: true });
      }
    } catch (e) {
      // e
    }
  });
  window.addEventListener('error', errorHandler, { capture: true });
}
const EVT_Q = [];
const CHUNK_SIZE = 5;

const pushToEventQ = (evt) => EVT_Q.push(evt);

function Track(name, { data = {} } = {}) {
  let properties = {
    data: data,
  };
  properties.build_number = __BUILD_NUMBER__;
  pushToEventQ({
    event: name,
    properties,
    timestamp: window.Date.now(),
  });
}

/**
 * Flushes all the events in queue.
 */
const flushEvents = () => {
  if (!EVT_Q.length) {
    return;
  }

  const trackingPayload = {
    context: {
      platform: window.CheckoutBridge ? 'mobile_sdk' : 'browser',
    },
    addons: [
      {
        name: 'ua_parser',
        input_key: 'user_agent',
        output_key: 'user_agent_parsed',
      },
    ],
    events: EVT_Q.splice(0, CHUNK_SIZE),
  };

  /**
   * We are doing encodeURIComponent → unescape here to remove all the
   * non-latin characters to latin
   */
  const encodedData = window.encodeURIComponent(
    window.btoa(
      window.unescape(
        window.encodeURIComponent(JSON.stringify(trackingPayload))
      )
    )
  );
  const postData = {
    url: 'https://lumberjack.razorpay.com/v1/track',
    data: {
      key: 'ZmY5N2M0YzVkN2JiYzkyMWM1ZmVmYWJk',
      // key: 'DyWQEJ6LM9PG+8XseHxX/dAtqc8PMR6tHR6/3m0NcOw=',
      data: encodedData,
    },
  };
  sendRequest(postData);
};

function sendRequest(postData) {
  try {
    // Use sendBeacon if supported.
    const useBeacon = 'sendBeacon' in window.navigator;
    /**
     * Attempt sending the events using Beacon API if supported/successful
     * else fallback to using the Fetch API
     */
    let isQueuedSuccessfully = false;
    if (useBeacon) {
      isQueuedSuccessfully = window.navigator.sendBeacon(
        postData.url,
        JSON.stringify(postData.data)
      );
    }

    if (!isQueuedSuccessfully) {
      fetch(postData.url, {
        method: 'POST',
        body: JSON.stringify(postData.data),
      });
    }
  } catch (e) {}
}

// Keep flushing at regular intervals. 🚽
const FLUSH_INTERVAL_DURATION = 1000;
window.setInterval(() => {
  flushEvents();
}, FLUSH_INTERVAL_DURATION);
