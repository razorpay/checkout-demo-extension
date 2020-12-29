import { displayAmount, getConvertedAmount } from 'common/currency';
import css from './popup.styl';
import { sanitizeHtmlEntities } from 'lib/utils';
import Track from 'tracker';

const cancelError = _Obj.stringify({
  error: {
    code: 'BAD_REQUEST_ERROR',
    description: 'Payment processing cancelled by user',
  },
});

const makeTrackingScript = ({ checkout_id, live, library }) => {
  if (!live) {
    return '';
  }

  return `
    <script>
      var events={page:"checkout_popup",props:{checkout_id:"${checkout_id}",library:"${library}"},load:!0,unload:!0};!function(e){e.track=Boolean;try{if("object"!=typeof e.events)return;var n,t=e.events.props,o=e.events,a="https://lumberjack.razorpay.com/v1/track",r="ZmY5N2M0YzVkN2JiYzkyMWM1ZmVmYWJk",c="function"==typeof navigator.sendBeacon,s=Date.now(),i=[{name:"ua_parser",input_key:"user_agent",output_key:"user_agent_parsed"}];function p(e,p){(p=p||{}).beacon=c,p.time_since_render=Date.now()-s,p.url=location.href,function(e,n){if(e&&n)Object.keys(n).forEach(function(t){e[t]=n[t]})}(p,t);var u={addons:i,events:[{event:o.page+":"+e,properties:p,timestamp:Date.now()}]},d=encodeURIComponent(btoa(unescape(encodeURIComponent(JSON.stringify(u))))),f=JSON.stringify({key:r,data:d});c?navigator.sendBeacon(a,f):((n=new XMLHttpRequest).open("post",a,!0),n.send(f))}p("load"),e.addEventListener("beforeunload",function(){p("unload")}),e.addEventListener("error",function(e){p("js_error",{message:e.message,line:e.line,col:e.col,stack:e.error&&e.error.stack})})}catch(e){}e.track=p}(window);
    </script>
  `;
};

export default function popupTemplate(_) {
  var get = _.r.get;
  var method = _.data && _.data.method === 'wallet' ? 'wallet' : 'bank';
  var color = get('theme.color') || '#3594E2';
  var highlightColor = _.r.themeMeta.highlightColor;
  var logo =
    _.r.preferences?.org?.checkout_logo_url ??
    'https://cdn.razorpay.com/logo.svg';
  var title =
    get('name') || get('description') || 'Redirecting...'
    |> sanitizeHtmlEntities;
  var amount = displayAmount(
    _.r,
    _.data && _.data.amount,
    _.data && _.data.currency
  );

  var dccCurrency = _.data && _.data.dcc_currency;
  if (dccCurrency) {
    var dccAmount = getConvertedAmount(_.data.amount, dccCurrency);
    amount = displayAmount(_.r, dccAmount, dccCurrency);
  }

  var hideAmount =
    _.data && _.data.method === 'emandate' ? 'display: none;' : '';

  var image = get('image');
  image = image
    ? `<div id="logo"><img src="${image.replace(/"/g, '')}"/></div>`
    : '';

  var message =
    _.message ||
      'Please wait while we redirect you to your ' + method + ' page.'
    |> sanitizeHtmlEntities;

  return `<!doctype html><html style="height:100%;width:100%;"><head>
<title>Processing, Please Wait...</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="${color}">
<style>${css}#ldr:after{background:${highlightColor}}#bg{background:${color}}
@media(max-height:580px),(max-width:420px){body{background:${color}}}
</style>
</head><body><div id='bg'></div><div id='cntnt'>
<div id="hdr">${image}
  <div id='name'>${title}</div>
  <div id="amt" style="${hideAmount}">
    <div style="font-size:12px;color:#757575;line-height:15px;margin-bottom:5px;text-align:right">PAYING</div>
    <div dir="ltr" style="font-size:20px;line-height:24px;">${amount}</div>
  </div>
</div>
<div id="ldr"></div>
<div id="txt">
  <div style="display:inline-block;vertical-align:middle;white-space:normal;">
    <h2 id='title'>Loading ${method} page…</h2><p id='msg'>${message}</p>
  </div>
  <div style="display:inline-block;vertical-align:middle;height:100%"></div>
</div>
<div id='ftr'>
  <div style="display:inline-block;">Secured by
    <img style="vertical-align:middle;margin-bottom:5px;" height="20px" src=${logo}>
  </div>
  <div style="display:inline-block;vertical-align:middle;height:100%"></div>
</div>
</div>
<div style="display:inline-block;vertical-align:middle;height:100%"></div>
<script>
var doc = document;
var gel = doc.getElementById.bind(doc);
setTimeout(function(){doc.body.className='loaded'}, 10);
setTimeout(function(){
  gel('title').innerHTML = 'Still trying to load...';
  gel('msg').innerHTML = 'The bank page is taking time to load. You can either wait or <span id="cncl">change the payment method</span>.';
  gel('cncl').onclick = function(){
    if(window.confirm("Do you want to cancel the ongoing payment?")){
      window.close();
      if (CheckoutBridge && CheckoutBridge.oncomplete) {
        CheckoutBridge.oncomplete('${cancelError}');
      }
    }
  };
},1e4)
</script>
<form></form>
${makeTrackingScript({
  live: _.r.isLiveMode(),
  checkout_id: _.r.id,
  library: Track.props.library,
})}
</body>
</html>`;
}

/**

Script used in string: Minify when being used.

<script>
var events = {
  page: 'checkout_popup',
  props: {
    checkout_id: '${checkout_id}',
    library: ${library},
  },
  load: true,
  unload: true
};
(function(window) {
  window.track = Boolean; // No-op
  try {
    if (typeof window.events !== 'object') {
      return;
    }

    // Default properties to be sent with every event payload
    var props = window.events.props;

    var config = window.events;

    var url = 'https://lumberjack.razorpay.com/v1/track';
    var key = 'ZmY5N2M0YzVkN2JiYzkyMWM1ZmVmYWJk';
    var useBeacon = typeof navigator.sendBeacon === 'function';
    var renderTime = Date.now();
    var addons = [
      {
        name: 'ua_parser',
        input_key: 'user_agent',
        output_key: 'user_agent_parsed'
      }
    ];
    var xhr;

    function copyKeys(dest, src) {
      if (!dest || !src) return;
      Object.keys(src).forEach(function (key) {
        dest[key] = src[key];
      });
      return dest;
    }

    function track(event, properties) {
      properties = properties || {};
      properties.beacon = useBeacon;
      properties.time_since_render = Date.now() - renderTime;
      properties.url = location.href;

      // Copy default properties
      copyKeys(properties, props);

      var payload = {
        addons: addons,
        events: [{
          event: config.page + ':' + event,
          properties: properties,
          timestamp: Date.now()
        }]
      };

      var data = encodeURIComponent(btoa(unescape(encodeURIComponent(JSON.stringify(payload)))));
      var body = JSON.stringify({ key: key, data: data });

      if (useBeacon) {
        navigator.sendBeacon(url, body);
      } else {
        xhr = new XMLHttpRequest();
        xhr.open('post', url, true);
        // Content-type doesn't need to be set, lumberjack parses JSON automatically.
        xhr.send(body);
      }
    }

    track('load');

    window.addEventListener('beforeunload', function () {
      track('unload');
    });

    // This is only work if the error occurs after this.
    window.addEventListener('error', function(event) {
      var properties = {
        message: event.message,
        line: event.line,
        col: event.col,
        stack: event.error && event.error.stack
      };
      track('js_error', properties);
    });
  } catch (e) {}
  window.track = track;
})(window);
</script>`

 */
