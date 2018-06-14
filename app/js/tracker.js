var base62Chars =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
var base64Chars = base62Chars + '+=';
base62Chars = base62Chars.slice(52) + base62Chars.slice(0, 52);
var map62 = {};
each(base62Chars, function(i, chr) {
  map62[chr] = i;
});

var _btoa = window.btoa;
if (!_btoa) {
  _btoa = function(str) {
    var out, i, len;
    var c1, c2, c3;

    len = str.length;
    i = 0;
    out = '';
    while (i < len) {
      c1 = str.charCodeAt(i++) & 0xff;
      if (i === len) {
        out += base64Chars.charAt(c1 >> 2);
        out += base64Chars.charAt((c1 & 0x3) << 4);
        out += '==';
        break;
      }
      c2 = str.charCodeAt(i++);
      if (i === len) {
        out += base64Chars.charAt(c1 >> 2);
        out += base64Chars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xf0) >> 4));
        out += base64Chars.charAt((c2 & 0xf) << 2);
        out += '=';
        break;
      }
      c3 = str.charCodeAt(i++);
      out += base64Chars.charAt(c1 >> 2);
      out += base64Chars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xf0) >> 4));
      out += base64Chars.charAt(((c2 & 0xf) << 2) | ((c3 & 0xc0) >> 6));
      out += base64Chars.charAt(c3 & 0x3f);
    }
    return out;
  };
}

function _toBase10(str62) {
  var val = 0;
  var len = str62.length;
  each(str62, function(index, character) {
    val += map62[character] * Math.pow(62, len - index);
  });
  return val / 62;
}

function _toBase62(number) {
  var rixit;
  var result = '';
  while (number) {
    rixit = number % 62;
    result = base62Chars[rixit] + result;
    number = Math.floor(number / 62);
  }
  return result;
}

function generateUID() {
  var num =
    _toBase62(
      (now() - 1388534400000).toString() +
        ('000000' + Math.floor(1000000 * Math.random())).slice(-6)
    ) +
    _toBase62(Math.floor(238328 * Math.random())) +
    '0';

  var sum = 0,
    tempdigit;
  each(num, function(i) {
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
  return num.slice(0, 13) + tempdigit;
}

var _uid = generateUID();
var trackingProps = {
  library: 'checkoutjs',
  platform: 'browser',
  referer: location.href
};

// we keep {event, timestamp} everytime something is tracked, and send it in next track
var trackStack = {};

function nest(options) {
  if (typeof options !== 'object') {
    return options;
  }
  var result = {};
  each(options, function(key, val) {
    if (/\./.test(key)) {
      var keySplit = key.split('.');
      if (!(keySplit[0] in result)) {
        result[keySplit[0]] = {};
      }
      result[keySplit[0]][keySplit[1]] = val;
    } else {
      result[key] = val;
    }
  });
  return result;
}

function getCommonTrackingData(r) {
  var props = {
    checkout_id: r ? r.id : _uid
  };
  each(
    [
      'integration',
      'referer',
      'library',
      'platform',
      'platform_version',
      'os',
      'os_version',
      'device'
    ],
    function(i, propName) {
      if (trackingProps[propName]) {
        props[propName] = trackingProps[propName];
      }
    }
  );
  return props;
}

function track(r, event, data) {
  if (!r.isLiveMode()) {
    return;
  }

  // defer makes tracking async
  defer(function() {
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
      options: options
    };

    if (data) {
      properties.data = data;
    }

    var trackingOptions = [
      'key',
      'amount',
      'prefill',
      'theme',
      'image',
      'description',
      'name',
      'method'
    ];

    each(r.get(), function(key, value) {
      var keySplit = key.split('.');
      var rootKey = keySplit[0];
      if (trackingOptions.indexOf(rootKey) !== -1) {
        if (keySplit.length > 1) {
          if (!trackingOptions.hasOwnProperty(rootKey)) {
            options[rootKey] = {};
          }
          options[rootKey][keySplit[1]] = value;
        } else {
          options[key] = value;
        }
      }
    });
    if (options.image && discreet.isBase64Image(options.image)) {
      options.image = 'base64';
    }

    var payment = r._payment || {};
    var paymentId = payment.payment_id;
    if (paymentId) {
      properties.payment_id = paymentId;
    }

    if (typeof payment.magicPossible !== 'undefined') {
      properties.magic_possible = payment.magicPossible;
    }

    if (typeof payment.isMagicPayment !== 'undefined') {
      properties.magic_attempted = payment.isMagicPayment;
    }

    if (typeof payment.magicCoproto !== 'undefined') {
      properties.magic_coproto = payment.magicCoproto;
    }

    if (_uid) {
      properties.local_order_id = _uid;
    }

    var trackingPayload = {
      context: context,
      events: [
        {
          event: event,
          properties: properties,
          timestamp: new Date().getTime()
        }
      ]
    };

    try {
      fetch.post({
        url: 'https://lumberjack.razorpay.com/v1/track',
        method: 'post',
        data: {
          key: 'ZmY5N2M0YzVkN2JiYzkyMWM1ZmVmYWJk',
          // key: 'DyWQEJ6LM9PG+8XseHxX/dAtqc8PMR6tHR6/3m0NcOw=',
          data: encodeURIComponent(btoa(stringify(trackingPayload)))
        }
      });
    } catch (e) {}
  });
}
