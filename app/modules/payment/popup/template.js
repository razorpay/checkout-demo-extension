import { displayAmount, getConvertedAmount } from 'common/currency';
import css from './popup.styl';
import { sanitizeHtmlEntities } from 'lib/utils';

const cancelError = _Obj.stringify({
  error: {
    code: 'BAD_REQUEST_ERROR',
    description: 'Payment processing cancelled by user',
  },
});

export default function popupTemplate(_) {
  var get = _.r.get;
  var method = _.data && _.data.method === 'wallet' ? 'wallet' : 'bank';
  var color = get('theme.color') || '#3594E2';
  var highlightColor = _.r.themeMeta.highlightColor;
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
    <img style="vertical-align:middle;margin-bottom:5px;" height="20px" src="https://cdn.razorpay.com/logo.svg">
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
</body>
</html>`;
}
