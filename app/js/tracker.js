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

function track(r, event, extra){
  if (!r.isLiveMode()) {
    return;
  }

  // invoke makes tracking async
  invoke(function(){
    // convert error to plain object
    if (extra instanceof Error) {
      extra = {message: extra.message, stack: extra.stack}
    }

    // data is of format prescribed by segment
    var data = {
      // mandatory
      event: event,

      // unique identifier needs to be named "anonymousId"
      anonymousId: r.id,
      properties: {
        // can be checkoutjs or razorpayjs, depending on discreet.isFrame
        library: trackingProps.library,

        // whether web or app
        platform: trackingProps.platform,

        // for auto parsing of url, property name has to be "page_url".
        // this is specific to segment + keen
        page_url: trackingProps.context,

        // for auto parsing of ua, property name has to be "user_agent".
        user_agent: ua,
        extra: extra
      },

      // in order to force segment pass original IP to mixpanel & keen
      context: {
        direct: true
      }
    };

    if (isNonEmpty(trackStack)) {
      var prev = {};
      each(
        trackStack,
        function(event, time){
          prev[event] = new Date() - time;
        }
      )
      data.properties.prev = prev;
    }
    trackStack[event] = new Date().getTime();

    // return console.log(event, data.properties);

    $.ajax({
      url: 'https://api.segment.io/v1/track',
      method: 'post',
      data: JSON.stringify(data),
      headers: {
        'Content-type': 'application/json',
        'Authorization': 'Basic ' + _btoa('vz3HFEpkvpzHh8F701RsuGDEHeVQnpSj:')
      }
    })
  })
}