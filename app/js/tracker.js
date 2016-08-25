var base62Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
var base64Chars = base62Chars + '+=';
base62Chars = base62Chars.slice(52) + base62Chars.slice(0, 52);
var map62 = {};
each(
  base62Chars,
  function(i, chr){
    map62[chr] = i;
  }
)

var _btoa = window.btoa;
if(!_btoa){
  _btoa = function(str) {
    var out, i, len;
    var c1, c2, c3;

    len = str.length;
    i = 0;
    out = '';
    while(i < len) {
      c1 = str.charCodeAt(i++) & 0xff;
      if(i === len)
      {
        out += base64Chars.charAt(c1 >> 2);
        out += base64Chars.charAt((c1 & 0x3) << 4);
        out += '==';
        break;
      }
      c2 = str.charCodeAt(i++);
      if(i === len)
      {
        out += base64Chars.charAt(c1 >> 2);
        out += base64Chars.charAt(((c1 & 0x3)<< 4) | ((c2 & 0xF0) >> 4));
        out += base64Chars.charAt((c2 & 0xF) << 2);
        out += '=';
        break;
      }
      c3 = str.charCodeAt(i++);
      out += base64Chars.charAt(c1 >> 2);
      out += base64Chars.charAt(((c1 & 0x3)<< 4) | ((c2 & 0xF0) >> 4));
      out += base64Chars.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >>6));
      out += base64Chars.charAt(c3 & 0x3F);
    }
    return out;
  };
}

function _toBase10(str62){
  var val = 0;
  var len = str62.length;
  each(
    str62,
    function(index, character){
      val += map62[character] * Math.pow(62, len - index);
    }
  )
  return val/62;
}

function _toBase62(number){
  var rixit;
  var result = '';
  while (number) {
    rixit = number % 62;
    result = base62Chars[rixit] + result;
    number = Math.floor(number / 62);
  }
  return result;
}

function generateUID(){
  var num = _toBase62(
    (now() - 1388534400000).toString() +
    ('000000' + Math.floor(1000000*Math.random())).slice(-6)
  ) +
  _toBase62(Math.floor(238328*Math.random())) + '0';

  var sum = 0, tempdigit;
  each(
    num,
    function(i){
      tempdigit = map62[num[num.length - 1 - i]];
      if((num.length - i) % 2){
        tempdigit *= 2;
      }
      if(tempdigit >= 62){
        tempdigit = tempdigit % 62 + 1;
      }
      sum += tempdigit;
    }
  )
  tempdigit = sum % 62;
  if(tempdigit){
    tempdigit = base62Chars[62 - tempdigit];
  }
  return num.slice(0, 13) + tempdigit
}

var _uid = generateUID();
var trackingProps = {
  library: 'checkoutjs',
  platform: 'browser',
  context: location.href
}

// we keep {event, timestamp} everytime something is tracked, and send it in next track
var trackStack = {};

function nest(options){
  if (typeof options !== 'object') {
    return options;
  }
  var result = {};
  each(
    options,
    function(key, val){
      if (/\./.test(key)) {
        var keySplit = key.split('.');
        if (!(keySplit[0] in result)) {
          result[keySplit[0]] = {};
        }
        result[keySplit[0]][keySplit[1]] = val;
      } else {
        result[key] = val;
      }
    }
  )
  return result;
}

function getCommonTrackingData(r) {
  var props = {
    ua: ua,
    checkout_id: r ? r.id : _uid,
    platform: 'web',
    library: trackingProps.library,
    context: trackingProps.context,
    integration: trackingProps.integration
  }
  each(['integration', 'context', 'library'], function(i, propName){
    if (trackingProps[propName]) {
      props[propName] = trackingProps[propName]''
    }
  })
  return props;
}

function track(r, event, data) {
  if (!r.isLiveMode()) {
    return;
  }

  // defer makes tracking async
  defer(function(){
    // convert error to plain object
    if (data instanceof Error) {
      data = {message: data.message, stack: data.stack}
    }

    // trackingPayload is of format prescribed by keen
    var trackingPayload = getCommonTrackingData(r);
    trackingPayload.data = nest(data);
    trackingPayload.options = nest(r.get());
    trackingPayload.ip = '${keen.ip}';
    trackingPayload.keen = {
      addons : [
        {
          name: 'keen:url_parser',
          input: {
            url: 'context'
          },
          output: 'url'
        },
        {
          name : 'keen:ip_to_geo',
          input : {
            ip : 'ip'
          },
          output : 'geo'
        },
        {
          name : 'keen:ua_parser',
          input : {
            ua_string : 'ua'
          },
          output : 'agent'
        }
      ]
    }

    if (isNonEmpty(trackStack)) {
      var prev = trackingPayload.prev = {};
      each(
        trackStack,
        function(event, time){
          prev[event] = new Date() - time;
        }
      )
    }
    trackStack[event] = new Date().getTime();

    // return console.log(event, data.properties);

    $.ajax({
      url: 'https://api.keen.io/3.0/projects/56dfed2446f9a70e39ec3a24/events/' + event,
      method: 'post',
      data: JSON.stringify(trackingPayloadgst),
      headers: {
        'Content-type': 'application/json',
        'Authorization': '856f246bc03088ac2390ad0d637a6e57d4637fc2cd088ff264650774022e7e6fec07a110d8256fca72b1362a569078c9371ee3ecfc67fc09fc9469d3c7b56744d4cfa9f2f4d466e24408ec77260288a7cb0741fe06f2399cb9d05456c479a737'
      }
    })
  })
}