import { getExperimentsFromStorage } from 'experiments';

const base62Chars =
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

const map62 =
  base62Chars |> _Arr.reduce((map, chr, i) => _Obj.setProp(map, chr, i), {});

function toBase62(number) {
  var rixit;
  var result = '';
  while (number) {
    rixit = number % 62;
    result = base62Chars[rixit] + result;
    number = _.floor(number / 62);
  }
  return result;
}

function makeUid() {
  var num =
    toBase62(
      String(_.now() - 1388534400000) +
        String('000000' + _.floor(1000000 * _.random())).slice(-6)
    ) +
    toBase62(_.floor(238328 * _.random())) +
    '0';

  var sum = 0,
    tempdigit;

  num
    |> _Arr.loop(function (v, i) {
      tempdigit = map62[num[num.length - 1 - i]];
      if ((num.length - i) % 2) {
        tempdigit *= 2;
      }
      if (tempdigit >= 62) {
        tempdigit = (tempdigit % 62) + 1;
      }
      sum += tempdigit;
    });

  tempdigit = sum % 62;
  if (tempdigit) {
    tempdigit = base62Chars[62 - tempdigit];
  }
  return String(num).slice(0, 13) + tempdigit;
}

var _uid = makeUid();

var trackingProps = {
  library: 'checkoutjs',
  platform: 'browser',
  referer: location.href,
};

function getCommonTrackingData(r) {
  var props = {
    checkout_id: r ? r.id : _uid,
  };

  [
    'device',
    'env',
    'integration',
    'library',
    'os_version',
    'os',
    'platform_version',
    'platform',
    'referer',
  ]
    |> _Arr.loop(
      (propName) =>
        props |> _Obj.setTruthyProp(propName, trackingProps[propName])
    );

  return props;
}

const EVT_Q = [];
let PENDING_EVT_Q = [];
let RZP_MODE;
let EVT_CTX;

const pushToEventQ = (evt) => EVT_Q.push(evt);
const setEventContext = (ctx) => {
  EVT_CTX = ctx;
};

/**
 * Flushes all the events in queue.
 */
const flushEvents = (mode) => {
  if (mode) {
    RZP_MODE = mode;
  }
  if (!EVT_Q.length || RZP_MODE !== 'live') {
    return;
  }

  // Use sendBeacon if supported.
  const useBeacon = _Obj.hasProp(navigator, 'sendBeacon');

  const trackingPayload = {
    context: EVT_CTX,
    addons: [
      {
        name: 'ua_parser',
        input_key: 'user_agent',
        output_key: 'user_agent_parsed',
      },
    ],
    events: EVT_Q.splice(0, EVT_Q.length),
  };

  /**
   * We are doing encodeURIComponent → unescape here to remove all the
   * non-latin characters to latin
   */
  const postData = {
    url: 'https://lumberjack.razorpay.com/v1/track',
    data: {
      key: 'ZmY5N2M0YzVkN2JiYzkyMWM1ZmVmYWJk',
      // key: 'DyWQEJ6LM9PG+8XseHxX/dAtqc8PMR6tHR6/3m0NcOw=',
      data:
        trackingPayload
        |> _Obj.stringify
        |> encodeURIComponent
        |> unescape
        |> btoa
        |> encodeURIComponent,
    },
  };

  try {
    if (useBeacon) {
      navigator.sendBeacon(postData.url, _Obj.stringify(postData.data));
    } else {
      fetch.post(postData);
    }
  } catch (e) {}
};

// Keep flushing at regular intervals. 🚽
const FLUSH_INTERVAL_DURATION = 1000;
const FLUSH_INTERVAL = setInterval(() => {
  flushEvents();
}, FLUSH_INTERVAL_DURATION);

/**
 *
 * @param {Razorpay} r
 * @param {String} event
 * @param {Object} data
 * @param {Boolean} immediately Whether to send this event immediately.
 */
export default function Track(r, event, data, immediately) {
  if (!r) {
    PENDING_EVT_Q.push([event, data, immediately]);
    return;
  }
  RZP_MODE = r.getMode();
  if (RZP_MODE === 'test') {
    return;
  }
  // defer makes tracking async
  setTimeout(function () {
    // convert error to plain object
    if (data instanceof Error) {
      data = { message: data.message, stack: data.stack };
    }

    var context = getCommonTrackingData(r);
    context.user_agent = null;
    context.mode = 'live';
    var order_id = r.get('order_id');
    if (order_id) {
      context.order_id = order_id;
    }

    var options = {};
    var properties = {
      options,
    };

    if (data) {
      properties.data = data;
    }

    options = _Obj.extend(options, _Obj.unflatten(r.get()));

    var handler = r.get('handler');
    if (typeof handler === 'function') {
      options.handler = true;
    }

    var callback_url = r.get('callback_url');
    if (typeof callback_url === 'string') {
      options.callback_url = true;
    }

    // Mask prefilled card details
    if (_Obj.hasProp(options, 'prefill')) {
      _Arr.loop(['card'], (key) => {
        if (_Obj.hasProp(options.prefill, key)) {
          options.prefill[key] = true;
        }
      });
    }

    if (options.image && _.isBase64Image(options.image)) {
      options.image = 'base64';
    }

    const externalWallets = r.get('external.wallets') || [];

    /**
     * Lumberjack doesn't support arrays well, so convert `external.wallets`
     * to object
     */

    options.external_wallets =
      externalWallets
      |> _Arr.reduce((acc, wallet) => acc |> _Obj.setProp(wallet, true), {});

    if (_uid) {
      properties.local_order_id = _uid;
    }

    // Add build number
    // eslint-disable-next-line no-undef
    properties.build_number = __BUILD_NUMBER__ || 0;

    // Add canary_percentage
    // Add current experiments
    properties.experiments = getExperimentsFromStorage();

    pushToEventQ({
      event,
      properties,
      timestamp: _.now(),
    });

    setEventContext(context);

    if (immediately) {
      flushEvents();
    }
  });
}

Track.dispatchPendingEvents = (r) => {
  if (!r) {
    return;
  }
  const track = Track.bind(Track, r);
  PENDING_EVT_Q.splice(0, PENDING_EVT_Q.length).forEach((e) => {
    track.apply(Track, e);
  });
};

Track.parseAnalyticsData = (data) => {
  if (!_.isNonNullObject(data)) {
    return;
  }

  data
    |> _Obj.loop((key, val) => {
      trackingProps[key] = val;
    });
};

Track.makeUid = makeUid;
Track.common = getCommonTrackingData;
Track.props = trackingProps;
Track.id = _uid;
Track.updateUid = (uid) => {
  _uid = uid;
  Track.id = uid;
};
Track.flush = flushEvents;
