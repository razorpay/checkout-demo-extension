/** webworker code... update, minify and replace in freeze.ts file  */
var pingReceived = false;
var checkoutId = '';
var sessionErrored = false;
var checkoutContext = {};

self.onmessage = function (e) {
  if (typeof e.data === 'string') {
    if (e.data === 'ping') {
      handlePingReceived();
      return;
    }
    const input = e.data.split('${separator}');
    switch (input[0]) {
      case 'id':
        checkoutId = input[1];
        break;
      case 'context':
        try {
          checkoutContext = JSON.parse(input[1]);
        } catch (e) {
          //e
        }
        break;
    }
  } else {
    return;
  }
};

function handlePingReceived() {
  pingReceived = true;
  postMessage('pong');
}

self.interval = setInterval(() => {
  if (pingReceived) {
    pingReceived = false;
  } else {
    capture(new Error('Iframe Freeze Alert'));
    clearInterval(self.interval);
  }
}, 3500);

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

function capture(error, options = {}) {
  try {
    const { analytics = {}, severity = 'S2', unhandled = false } = options;
    const { data, immediately = true } = analytics || {};
    /**
     * Event name to be used for analytics.
     * Defaulting to 'js_error' till we move to the new system of analytics events
     */
    const eventName = 'js_error';
    try {
      if (!sessionErrored) {
        const availabilityTrackingPayload = {
          metrics: createEventObject('session_errored', severity),
        };
        const encodedAvailabilityData = encodeURIComponent(
          btoa(
            unescape(
              encodeURIComponent(JSON.stringify(availabilityTrackingPayload))
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
        sessionErrored = true;
      }
    } catch (e) {
      // e
    }
    Track(eventName, {
      data: Object.assign({}, typeof data === 'object' ? data : {}, {
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
      immediately: Boolean(immediately),
      isError: true,
    });
  } catch (e) {}
}

const EVT_Q = [];
const CHUNK_SIZE = 5;

const pushToEventQ = (evt) => EVT_Q.push(evt);

function Track(name, { data = {} } = {}) {
  let properties = {
    data: data,
  };
  properties.checkout_id = checkoutId;
  pushToEventQ({
    event: name,
    properties,
    timestamp: Date.now(),
  });
}

/**
 * Flushes all the events in queue.
 */
function flushEvents() {
  if (!EVT_Q.length) {
    return;
  }

  const trackingPayload = {
    context: checkoutContext,
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
  const encodedData = encodeURIComponent(
    btoa(unescape(encodeURIComponent(JSON.stringify(trackingPayload))))
  );
  const postData = {
    url: 'https://lumberjack.razorpay.com/v1/track',
    data: {
      key: 'ZmY5N2M0YzVkN2JiYzkyMWM1ZmVmYWJk',
      data: encodedData,
    },
  };
  sendRequest(postData);
}

function sendRequest(postData) {
  try {
    fetch(postData.url, {
      method: 'POST',
      body: JSON.stringify(postData.data),
    });
  } catch (e) {}
}

// Keep flushing at regular intervals. 🚽
const FLUSH_INTERVAL_DURATION = 1000;
setInterval(() => {
  flushEvents();
}, FLUSH_INTERVAL_DURATION);

function constructErrorObject(error, tags) {
  let customError = { tags };

  switch (true) {
    case !error:
      // Shouldn't ideally happen but including it to ensure we aren't missing any errors
      customError.message = 'NA';
      break;

    case typeof error === 'string':
      customError.message = error;
      break;

    case typeof error === 'object':
      {
        const { name, message, stack, fileName, lineNumber, columnNumber } =
          error;

        // this won't copy non-enumerable (JSON)
        customError = Object.assign(JSON.parse(JSON.stringify(error)), {
          // Handling common non-enumerable properties
          name,
          message,
          stack,
          fileName,
          lineNumber,
          columnNumber,
          tags,
        });
      }
      break;

    // Final catch all in case error is passed as a string or any other unknown format. We can add new cases as we identify them
    default:
      customError.message = JSON.stringify(error);
  }

  return customError;
}
