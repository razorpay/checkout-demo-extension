var _base62_chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
var _base64_chars = _base62_chars + '+=';

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
        out += _base64_chars.charAt(c1 >> 2);
        out += _base64_chars.charAt((c1 & 0x3) << 4);
        out += '==';
        break;
      }
      c2 = str.charCodeAt(i++);
      if(i === len)
      {
        out += _base64_chars.charAt(c1 >> 2);
        out += _base64_chars.charAt(((c1 & 0x3)<< 4) | ((c2 & 0xF0) >> 4));
        out += _base64_chars.charAt((c2 & 0xF) << 2);
        out += '=';
        break;
      }
      c3 = str.charCodeAt(i++);
      out += _base64_chars.charAt(c1 >> 2);
      out += _base64_chars.charAt(((c1 & 0x3)<< 4) | ((c2 & 0xF0) >> 4));
      out += _base64_chars.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >>6));
      out += _base64_chars.charAt(c3 & 0x3F);
    }
    return out;
  }
}

function _toBase62(number){
  var rixit;
  var result = '';
  while (number) {
    rixit = number % 62
    result = _base62_chars[rixit] + result;
    number = Math.floor(number / 62);
  }
  return result;
}

var _uid = _toBase62(
    (new Date().getTime() - 1388534400000).toString() +
    ('000' + Math.floor(1000*Math.random())).slice(-3)
  ) +
  _toBase62(Math.floor(56800235584*Math.random()));

_base62_chars = _base62_chars.slice(52) + _base62_chars.slice(0, 52)

function track(event, props) {
  if(_uid){
    setTimeout(function(){
      if(typeof props !== 'object') {
        props = {};
      }

      props.token = '907d0c5b156fca57e1b254ccc1b9e8c9';
      props.distinct_id = _uid;
      props.time = new Date().getTime()

      var data = {
        event: event,
        properties: props
      }

      var xhr = new XMLHttpRequest();
      xhr.open('post', 'https://api.mixpanel.com/track/', true);
      xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
      xhr.send('ip=1&data=' + _btoa(JSON.stringify(data)));
    })
  }
}