import { displayAmount } from 'common/currency';

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
<style>*{box-sizing:border-box;margin:0;padding:0;}
body{background:#f5f5f5;overflow:hidden;text-align:center;height:100%;
white-space:nowrap;margin:0;padding:0;
font-family:-apple-system,BlinkMacSystemFont,ubuntu,verdana,helvetica,sans-serif}
#bg{position:absolute;bottom:50%;width:100%;height:50%;background:${color};margin-bottom:90px}
#cntnt{position:relative;width:100%;vertical-align:middle;display:inline-block;
margin:auto;max-width:420px;min-width:280px;height:95%;max-height:360px;background:#fff;
z-index:9999;box-shadow:0 0 20px 0 rgba(0,0,0,0.16);border-radius:4px;overflow:hidden;
padding:24px;text-align:left}
#ftr{position:absolute;left:0;right:0;bottom:0;height:80px;background:#f5f5f5;
text-align:center;color:#212121;font-size:14px;letter-spacing:-0.3px}
#ldr{width:100%;height:3px;position:relative;margin-top:16px;border-radius:3pxoverflow:hidden}
#ldr:before,#ldr:after{content:'';position:absolute;top:0;bottom:0;width:100%}
#ldr:before{top:1px;border-top:1px solid #bcbcbc}
#ldr:after{background:${highlightColor};width:0%;transition:20s cubic-bezier(0,0.1,0,1)}
.loaded #ldr:after{width:90%}
#logo{width:48px;height:48px;padding:8px;border:1px solid #e5e5e5;border-radius:3px;text-align:center}
#hdr{min-height:48px;position:relative}
#logo,#name,#amt{display:inline-block;vertical-align:middle;letter-spacing:-0.5px}
#amt{position:absolute;right:0;top:0;background:#fff;color:#212121}
#name{line-height:48px;margin-left:12px;font-size:16px;max-width:140px;
overflow:hidden;text-overflow:ellipsis;color:#212121}
#logo+#name{line-height:20px}
#txt{height:200px;text-align:center}
#title{font-size:20pxline-height:24pxmargin-bottom:8pxletter-spacing:-0.3px}
#msg,#cncl{font-size:14pxline-height:20pxcolor:#757575margin-bottom:8pxletter-spacing:-0.3px}
#cncl{text-decoration:underlinecursor:pointer}
#logo img{max-width:100%max-height:100%vertical-align:middle}
@media(max-height:580px),(max-width:420px){#bg{display:none}body{background:${color}}}
@media(max-width:420px){#cntnt{padding:16px;width:95%}#name{margin-left:8px}}
</style></head><body><div id='bg'></div><div id='cntnt'>
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
