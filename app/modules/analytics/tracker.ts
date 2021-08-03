// TODO-{typescript} update type of razorpay instance
// TODO-{typescript} extract fetch to lib and use via import
import { getExperimentsFromStorage } from 'experiments';
import type { CustomObject, Razorpay } from 'types';
import { pipe, isBase64Image, unFlattenObject } from 'utils/lib';

const base62Chars =
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

const map62: CustomObject<number> = base62Chars
  .split('')
  .reduce(
    (
      map: CustomObject<number>,
      chr: string,
      i: number
    ): CustomObject<number> => {
      map[chr] = i;
      return map;
    },
    {}
  );

function toBase62(number: number) {
  let rixit: number;
  let result: string = '';
  while (number) {
    rixit = number % 62;
    result = base62Chars[rixit] + result;
    number = Math.floor(number / 62);
  }
  return result;
}

function makeUid() {
  const num =
    toBase62(
      +(
        String(Date.now() - 1388534400000) +
        String('000000' + Math.floor(1000000 * Math.random())).slice(-6)
      )
    ) +
    toBase62(Math.floor(238328 * Math.random())) +
    '0';

  let sum = 0,
    tempDigit;

  String(num)
    .split('')
    .forEach((_, i) => {
      tempDigit = map62[num[num.length - 1 - i]];
      if ((num.length - i) % 2) {
        tempDigit *= 2;
      }
      if (tempDigit >= 62) {
        tempDigit = (tempDigit % 62) + 1;
      }
      sum += tempDigit;
    });

  tempDigit = sum % 62;

  if (tempDigit) {
    tempDigit = base62Chars[62 - tempDigit];
  }
  return String(num).slice(0, 13) + tempDigit;
}

var _uid = makeUid();

var trackingProps: CustomObject<string> = {
  library: 'checkoutjs',
  platform: 'browser',
  referer: location.href,
};

function getCommonTrackingData(r: Razorpay) {
  const props: CustomObject<any> = {
    checkout_id: r ? r.id : _uid,
  };

  const commonProps = [
    'device',
    'env',
    'integration',
    'library',
    'os_version',
    'os',
    'platform_version',
    'platform',
    'referer',
  ];

  commonProps.forEach((propName) => {
    if (trackingProps[propName]) {
      props[propName] = trackingProps[propName];
    }
  });

  return props;
}

type Event = {
  event: string;
  properties: CustomObject<any>;
  timestamp: number;
};

const EVT_Q: Event[] = [];
let PENDING_EVT_Q: [string, any, boolean][] = [];
let EVT_CTX: CustomObject<any>;

const pushToEventQ = (evt: Event): number => EVT_Q.push(evt);
const setEventContext = (ctx: CustomObject<any>): void => {
  EVT_CTX = ctx;
};

/**
 * Flushes all the events in queue.
 */
const flushEvents = () => {
  if (!EVT_Q.length) {
    return;
  }

  // Use sendBeacon if supported.
  const useBeacon = navigator.hasOwnProperty('sendBeacon');

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
      data: pipe(
        JSON.stringify,
        encodeURIComponent,
        unescape,
        btoa,
        encodeURIComponent
      )(trackingPayload),
    },
  };

  try {
    if (useBeacon) {
      navigator.sendBeacon(postData.url, JSON.stringify(postData.data));
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
export default function Track(
  r: Razorpay,
  event: string,
  data: any,
  immediately: boolean
) {
  if (!r) {
    PENDING_EVT_Q.push([event, data, immediately]);
    return;
  }
  if (!r.isLiveMode()) {
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

    var options: CustomObject<any> = {};
    var properties: {
      options: any;
      data?: any;
      local_order_id?: string;
      build_number?: string | number;
      experiments?: any;
    } = {
      options,
    };

    if (data) {
      properties.data = data;
    }

    options = Object.assign(options, unFlattenObject(r.get()));

    var handler = r.get('handler');
    if (typeof handler === 'function') {
      options.handler = true;
    }

    var callback_url = r.get('callback_url');
    if (typeof callback_url === 'string') {
      options.callback_url = true;
    }

    // Mask prefilled card details
    if (options.hasOwnProperty('prefill')) {
      ['card'].forEach((key) => {
        if (options.prefill.hasOwnProperty(key)) {
          options.prefill[key] = true;
        }
      });
    }

    if (options.image && isBase64Image(options.image)) {
      options.image = 'base64';
    }

    const externalWallets = r.get('external.wallets') || [];

    /**
     * Lumberjack doesn't support arrays well, so convert `external.wallets`
     * to object
     */

    options.external_wallets = externalWallets.reduce(
      (acc: CustomObject<boolean>, wallet: string) => {
        acc[wallet] = true;
        return acc;
      },
      {}
    );

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
      timestamp: Date.now(),
    });

    setEventContext(context);

    if (immediately) {
      flushEvents();
    }
  });
}

Track.dispatchPendingEvents = (r: any) => {
  if (!r) {
    return;
  }
  const track = Track.bind(Track, r);
  PENDING_EVT_Q.splice(0, PENDING_EVT_Q.length).forEach((e) => {
    track.apply(Track, e);
  });
};

Track.parseAnalyticsData = (data: CustomObject<any>) => {
  if (data && typeof data === 'object') {
    return;
  }

  Object.keys(data).forEach((key) => {
    trackingProps[key] = data[key];
  });
};

Track.makeUid = makeUid;
Track.common = getCommonTrackingData;
Track.props = trackingProps;
Track.id = _uid;
Track.updateUid = (uid: string) => {
  _uid = uid;
  Track.id = uid;
};
Track.flush = flushEvents;
