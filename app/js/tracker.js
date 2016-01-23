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

  var sum = 0, tempdigit;
  var map62 = {};
  each(
    base62Chars,
    function(i, chr){
      map62[chr] = i;
    }
  )
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

function track(event, props) {
  var id = this.id;
  if(id && /^rzp_l/.test(this.options.key)){
    if(props){
      props = $.clone(props);
    }

    setTimeout(function(){
      var data = {
        id: _uid
      };
      if(event === 'init'){
        props = formInitProps(props);
        data.medium = discreet.medium;
        data.context = discreet.context;
        data.ip = '${keen.ip}';
        data.ua = ua;
      }

      if(typeof props === 'object') {
        data.data = props;
      }

      var xhr = new XMLHttpRequest();
      xhr.open(
        'post',
        'https://api.keen.io/3.0/projects/56815e9096773d537f3aa38d/events/' + event + '?api_key=aaa7ed2762721feae486b937c8860697495484b68941ccc4d8aab85b10ace2a7b99be1b69a08b2bee5338118bdfae828f685f4fe7badbb5fb811b4f55b60413412641841d0ec5201bee394eee329884cf4bd5e784bde605707a2203dcc6afb54871f1ce71a0a02211c9ef4deb62d5d63',
        true
      );
      xhr.setRequestHeader('Content-type', 'application/json');
      xhr.send(stringify(data));
    })
  }
}

function formInitProps(overrides){
  var props = {};

  each(
    overrides,
    function(key){
      if(!(key in Razorpay.defaults) || Razorpay.defaults[key] === overrides[key]){
        delete overrides[key];
      }
    }
  )

  props.key = overrides.key || '';
  delete overrides.key;

  props.amount = parseInt(overrides.amount, 10) || 0;
  delete overrides.amount;

  props.notes = overrides.notes &&  stringify(overrides.notes) || '';
  delete props.notes;

  props.method = {};
  each(
    overrides.method,
    function(method, value){
      props.method[method] = !!value;
    }
  )
  delete overrides.method;

  if(discreet.isBase64Image(overrides.image)){
    overrides.image = 'base64';
  }

  props.image = overrides.image || '';
  delete overrides.image;

  props.options = stringify(overrides);
  return props;
}