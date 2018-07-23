import { displayAmount } from 'common/currency';
import css from './popup.styl';

export default function popupTemplate(_) {
  var get = _.r.get;
  var method = _.data.method === 'wallet' ? 'wallet' : 'bank';
  var color = get('theme.color') || '#3594E2';
  var highlightColor = _.r.themeMeta.highlightColor;
  var title = get('name') || get('description') || 'Redirecting...';
  var amount = displayAmount(_.r);

  var image = get('image');
  image = image ? `<div id="logo"><img src="${image}"/></div>` : '';

  var message =
    _.message ||
    'Please wait while we redirect you to your ' + method + ' page.';

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
  <div id="amt">
    <div style="font-size:12px;color:#757575;line-height:15px;margin-bottom:5px;text-align:right">PAYING</div>
    <div style="font-size:20px;line-height:24px;">${amount}</div>
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
    <img style="vertical-align:middle;margin-bottom:5px;" height="20px" src="https://razorpay.com/assets/razorpay-logo.svg">
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
        CheckoutBridge.oncomplete(JSON.stringify({
          error: { description: 'Payment Cancelled' }
      }))}}};

try{opener.Razorpay.popup_delay()}catch(e){}},10e4)

${_.sdk_popup &&
    `
function submitForm(action, data, method) {
  if (method === 'get') {
    window.location = action      return    }

  var form = document.createElement('form')    form.setAttribute('action', action);

  if (method) {
    form.setAttribute('method', method)    }
  if (data) {
    form.innerHTML = deserialize(data)    }

  doc.body.appendChild(form)    form.submit()    doc.body.removeChild(form)  }

function deserialize(data, key) {
  if (typeof data === 'object' && data !== null) {
    var str = ''      for (name in data) {
      if (!data.hasOwnProperty(name)) {
        return        }
      value = data[name]        if (key) {
        name = key + '[' + name + ']'        }
      str += deserialize(value, name)      }

    return str    }
  return '<input type="hidden" name="' + key + '" value="' + data + '">'  }
`}
</script>
</body>
</html>`;
}
