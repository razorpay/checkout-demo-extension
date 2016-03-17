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
    (new Date().getTime() - 1388534400000).toString() +
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

function track(event, props){
  return
  var id = this.id;
  setTimeout(function(){
    if(id && /^rzp_l/.test(this.get('key'))){
      var payload = {
        context: {
          direct: true
        },
        anonymousId: id,
        event: event
      };
      var data = payload.properties = {
        id: id
      };
      if(props && event === 'js_error' && props instanceof Error){
        // if props is error object, extract relevant properties
        props = {message: props.message, stack: props.stack}
      }
      if(props){
        each(
          props,
          function(propKey, propVal){
            data[propKey] = propVal;
          }
        )
      }

      setTrackingProps(data, options, event);
      data.medium = discreet.medium;
      data.user_agent = ua;
      if(discreet.context){
        data.page_url = discreet.context;
      }
      data.library = discreet.lib;

      var xhr = new XMLHttpRequest();
      xhr.open(
        'post',
        'https://api.segment.io/v1/track',
        true
      );
      xhr.setRequestHeader('Content-type', 'application/json');
      xhr.setRequestHeader('Authorization', 'Basic ' + _btoa('vz3HFEpkvpzHh8F701RsuGDEHeVQnpSj:'));
      xhr.send(JSON.stringify(payload));
    }
  })
}

function setTrackingProps(data, options, event){
  if(event === 'init'){
    data.options = getInitOptions(options);
  }
  else {
    data.options = {
      key: options.key,
      amount: options.amount
    }
  }
}

function getOverrides(options, defaults){
  var overrodeOnce = false;
  var overrides = {};
  each(
    defaults || Razorpay.defaults,
    function(key, defaultValue){
      var val = options[key];
      var valType = typeof val;
      if(val && valType === 'object'){
        val = getOverrides(val, defaultValue) || defaultValue;
      }
      if(val !== defaultValue && valType !== 'function'){
        overrodeOnce = true;
        overrides[key] = val;
      }
    }
  )
  if(arguments.length === 1){
    overrodeOnce = true;
    discreet.setNotes(overrides, options);
  }
  if(overrodeOnce){
    return overrides;
  }
}

function getInitOptions(options){
  var overrides = getOverrides(options);

  if(discreet.isBase64Image(overrides.image)){
    overrides.image = 'base64';
  }

  if(overrides.amount){
    overrides.amount = parseInt(overrides.amount, 10);
  }
  return overrides;
}