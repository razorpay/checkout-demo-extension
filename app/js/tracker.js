var base62Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
var base64Chars = base62Chars + '+=';
base62Chars = base62Chars.slice(52) + base62Chars.slice(0, 52);

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

  var sum = 0, flip = 0, tempdigit;
  var map62 = {};
  each(
    base62Chars,
    function(i, chr){
      map62[chr] = i;
    }
  )
  each(
    num,
    function(i, chr){
      tempdigit = map62[num[num.length - 1 - i]];
      if(!(flip++ % 2)){
        tempdigit *= 2;
        if(tempdigit >= 62){
          tempdigit = tempdigit % 62 + 1;
        }
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

function track(event, props) {
  if(_uid){
    setTimeout(function(){
      if(typeof props !== 'object') {
        props = {};
      }

      props.token = '181b3d7d22f7c71826d2f7db7c322028';
      props.distinct_id = _uid;
      props.time = new Date().getTime();

      if(event === 'init'){
        props.ua = ua;
        props.context = discreet.context;
      }

      var data = {
        event: event,
        properties: props
      }

      $.post({
        url: 'https://api.mixpanel.com/track/',
        data: {
          ip: 1,
          data: _btoa(JSON.stringify(data))
        }
      })
    })
  }
}