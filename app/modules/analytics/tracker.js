import { getExperimentsFromStorage } from 'experiments';
import { getOrderId } from 'razorpay';
import { trackAvailabilty } from './availability';
import { hasProp } from 'utils/object';
import fetch from 'utils/fetch';
import { BUILD_NUMBER } from 'common/constants';
import { getDeviceId } from 'fingerprint';

const CHUNK_SIZE = 5;

const base62Chars =
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

const map62 = base62Chars
  .split('')
  .reduce((map, chr, i) => ({ ...map, [chr]: i }), {});

function toBase62(number) {
  let rixit;
  let result = '';
  while (number) {
    rixit = number % 62;
    result = base62Chars[rixit] + result;
    number = _.floor(number / 62);
  }
  return result;
}

function makeUid() {
  let num =
    toBase62(
      String(_.now() - 1388534400000) +
        String('000000' + _.floor(1000000 * _.random())).slice(-6)
    ) +
    toBase62(_.floor(238328 * _.random())) +
    '0';

  let sum = 0,
    tempdigit;

  num.split('').forEach(function (_, i) {
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

let _uid = makeUid();

let trackingProps = {
  library: 'checkoutjs',
  platform: 'browser',
  referer: location.href,
  env: '',
};

function getCommonTrackingData(r) {
  let props = {
    checkout_id: r ? r.id : _uid,
    'device.id': getDeviceId() ?? '',
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
  ].forEach((propName) => {
    if (trackingProps[propName]) {
      props[propName] = trackingProps[propName];
    }
  });

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

  EVT_Q.forEach((eventData) => {
    // open event will trigger for standard checkout
    // submit event in case of custom checkout
    if (
      eventData.event === 'open' ||
      (eventData.event === 'submit' && Track.props.library === 'razorpayjs')
    ) {
      trackAvailabilty('session_created');
    }
  });

  // Use sendBeacon if supported.
  const useBeacon = hasProp(navigator, 'sendBeacon');

  const trackingPayload = {
    context: EVT_CTX,
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
    /**
     * Attempt sending the events using Beacon API if supported/successful
     * else fallback to using the Fetch API
     */
    let isQueuedSuccessfully = false;
    if (useBeacon) {
      isQueuedSuccessfully = navigator.sendBeacon(
        postData.url,
        _Obj.stringify(postData.data)
      );
    }

    if (!isQueuedSuccessfully) {
      fetch.post(postData);
    }
  } catch (e) {}
};

// Keep flushing at regular intervals. 🚽
const FLUSH_INTERVAL_DURATION = 1000;
setInterval(() => {
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

    let context = getCommonTrackingData(r);
    context.user_agent = null;
    context.mode = 'live';
    let order_id = getOrderId();
    if (order_id) {
      context.order_id = order_id;
    }

    let options = {};
    let properties = {
      options,
    };

    if (data) {
      properties.data = data;
    }

    options = _Obj.extend(options, _Obj.unflatten(r.get()));

    let handler = r.get('handler');
    if (typeof handler === 'function') {
      options.handler = true;
    }
    let callback_url = r.get('callback_url');
    if (callback_url && typeof callback_url === 'string') {
      options.callback_url = true;
    }

    // Mask prefilled card details
    if (hasProp(options, 'prefill')) {
      ['card'].forEach((key) => {
        if (hasProp(options.prefill, key)) {
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

    options.external_wallets = externalWallets.reduce(
      (acc, wallet) => ({ ...acc, [wallet]: true }),
      {}
    );

    if (_uid) {
      properties.local_order_id = _uid;
    }

    // Add build number
    // eslint-disable-next-line no-undef
    properties.build_number = BUILD_NUMBER;

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
