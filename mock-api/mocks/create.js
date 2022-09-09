const fs = require('fs');
const { ENDPOINT } = global;

const ajax = {
  cod: {
    razorpay_payment_id: 'pay_29QQoUBi66xm2f',
    razorpay_order_id: 'order_9A33XWu170gUtm',
    razorpay_signature:
      '9ef4dffbfd84f1318f6739a3ce19f9d85851857ae648f114332d8401e0949a3d',
  },
  hdfc_dc: {
    type: 'otp',
    request: {
      url: 'https://api-dark.razorpay.com/v1/payments/pay_Ef3hpkiFpLkCmn/otp_submit/c835ea3d470d473c48cb56431f898fb526dbc33c?key_id=rzp_live_cepk1crIu9VkJU',
      content: {
        type: 'otp',
        bank: 'HDFC',
        next: ['submit_otp', 'resend_otp'],
      },
      method: 'POST',
    },
    version: 1,
    payment_id: 'pay_Ef3hpkiFpLkCmn',
    gateway:
      'eyJpdiI6IjZHYTZXNE9uXC91NlVkYzdjS0ZVN2Z3PT0iLCJ2YWx1ZSI6Ik9rYVwvN1hKRGxxS3ZmQjM2alwvblhUZjl2YjdzVFUwSGk5VWpiaG55ekZNST0iLCJtYWMiOiJiOGRiMTI3M2MwNDY2YjcyYTg0OTA0MmU0YTY1MTM2YmY0YmYxMDJjNmExNzM4YjU5ZTUwODk5NGY3NzU5N2Y1In0=',
    submit_url:
      ENDPOINT +
      '/v1/payments/pay_EfZEwe28YBctRJ/otp_submit/5bc33a3afc07cad92ed16f750e1b393d894fdf86?key_id=rzp_live_ILgsfZCZoFIKMb',
    contact: '+919723461024',
    amount: '6,000.00',
    formatted_amount: '₹ 6000',
    wallet: null,
    merchant: 'Incredible',
    merchant_id: 'CNoxEwowM0nMIT',
    redirect:
      'https://api-dark.razorpay.com/v1/payments/pay_Ef3hpkiFpLkCmn/authentication/redirect?key_id=rzp_live_cepk1crIu9VkJU',
    metadata: {
      issuer: 'HDFC',
      network: 'VISA',
      last4: '0176',
      iin: '416021',
      gateway: 'cybersource',
    },
  },
  kkbk_dc: {
    type: 'otp',
    request: {
      url: 'https://api-dark.razorpay.com/v1/payments/pay_Ef3hpkiFpLkCmn/otp_submit/c835ea3d470d473c48cb56431f898fb526dbc33c?key_id=rzp_live_cepk1crIu9VkJU',
      content: {
        type: 'otp',
        bank: 'HDFC',
        next: ['submit_otp', 'resend_otp'],
      },
      method: 'POST',
    },
    version: 1,
    payment_id: 'pay_Ef3hpkiFpLkCmn',
    gateway:
      'eyJpdiI6IjZHYTZXNE9uXC91NlVkYzdjS0ZVN2Z3PT0iLCJ2YWx1ZSI6Ik9rYVwvN1hKRGxxS3ZmQjM2alwvblhUZjl2YjdzVFUwSGk5VWpiaG55ekZNST0iLCJtYWMiOiJiOGRiMTI3M2MwNDY2YjcyYTg0OTA0MmU0YTY1MTM2YmY0YmYxMDJjNmExNzM4YjU5ZTUwODk5NGY3NzU5N2Y1In0=',
    submit_url:
      ENDPOINT +
      '/v1/payments/pay_EfZEwe28YBctRJ/otp_submit/5bc33a3afc07cad92ed16f750e1b393d894fdf86?key_id=rzp_live_ILgsfZCZoFIKMb',
    contact: '+919723461024',
    amount: '6,000.00',
    formatted_amount: '₹ 6000',
    wallet: null,
    merchant: 'Incredible',
    merchant_id: 'CNoxEwowM0nMIT',
    redirect:
      'https://api-dark.razorpay.com/v1/payments/pay_Ef3hpkiFpLkCmn/authentication/redirect?key_id=rzp_live_cepk1crIu9VkJU',
    metadata: {
      issuer: 'KKBK',
      network: 'VISA',
      last4: '0176',
      iin: '416021',
      gateway: 'cybersource',
    },
  },
  hdfc_dc_error: {
    error: {
      code: 'BAD_REQUEST_ERROR',
      description:
        'Debit Card EMI offer is not available for the entered details',
      metadata: { payment_id: 'pay_Eh1KQadSURkJXb' },
    },
  },
  hdfc_first: {
    type: 'first',
    request: {
      method: 'direct',
      content:
        '<!doctype html>\n<html>\n<head>\n  <title></title>\n  <meta http-equiv="X-UA-Compatible" content="IE=edge">\n  <meta charset="utf-8" />\n  <meta http-equiv="X-UA-Compatible" content="IE=edge">\n  <meta name="viewport" content="width=device-width, initial-scale=1">\n</head>\n<script>\n  var events = {\n    page: \'gateway_otp_postform\',\n    props: {\n          payment_id: \'pay_EfZEwe28YBctRJ\',\n              merchant_id: \'2aTeFCKTYWwfrF\',\n        },\n    load: true,\n    unload: true\n  }\n</script>\n<script>\n!function(e){e.track=Boolean;try{if(/razorpay\\.in$/.test(location.origin))return;if("object"!=typeof e.events)return;var n=e.events.props;if(0===Object.keys(n).length)return;var t,o=e.events,r=o.page,a=o.load,s=o.unload,i=o.error,c="https://lumberjack.razorpay.com/v1/track",u="MC40OTMwNzgyMDM3MDgwNjI3Nw9YnGzW",p="function"==typeof navigator.sendBeacon,d=Date.now(),f=[{name:"ua_parser",input_key:"user_agent",output_key:"user_agent_parsed"}];function l(e,o){(o=o||{}).beacon=p,o.time_since_render=Date.now()-d,o.url=location.href,function(e,n){if(e&&n)Object.keys(n).forEach(function(t){e[t]=n[t]})}(o,n);var a={addons:f,events:[{event:r+":"+e,properties:o,timestamp:Date.now()}]},s=encodeURIComponent(btoa(unescape(encodeURIComponent(JSON.stringify(a))))),i=JSON.stringify({key:u,data:s});p?navigator.sendBeacon(c,i):((t=new XMLHttpRequest).open("post",c,!0),t.send(i))}a&&l("load"),s&&e.addEventListener("unload",function(){l("unload")}),i&&e.addEventListener("error",function(e){l("error",{message:e.message,line:e.line,col:e.col,stack:e.error&&e.error.stack})})}catch(e){}e.track=l}(window);\n</script>\n\n<body>\n    <div id="preloading">\n        <style>\n            body {\n                background: #f4f4f4;\n            }\n        </style>\n        <style>\n@keyframes  lo{to{transform:rotate(360deg)}}@-webkit-keyframes lo{to{-webkit-transform:rotate(360deg)}}\n.loader{height:24px;width:24px;border-radius:50%;display:inline-block;\n  animation:lo .8s infinite linear;-webkit-animation:lo .8s infinite linear;\n  transition:0.3s;-webkit-transition:0.3s;\n  opacity:0;border:2px solid #3395FF;border-top-color:transparent}\n.vis{opacity:1}\n</style>\n<div class="loader vis" style="position:absolute;top:115px;left:50%;margin-left:-12px"></div>\n        <img src="https://cdn.razorpay.com/logo.svg" id="logo" height="35px" style="margin:30px auto 10px; display:block">\n    </div>\n  <script type="text/javascript">\n    // input data //\n    var data = {"type":"otp","request":{"content":{"bank":"HDFC","type":"otp","next":["submit_otp","resend_otp"]},"method":"POST","url":"http://localhost:5000\\/v1\\/payments\\/pay_EfZEwe28YBctRJ\\/otp_submit\\/5bc33a3afc07cad92ed16f750e1b393d894fdf86?key_id=rzp_live_ILgsfZCZoFIKMb"},"version":1,"payment_id":"pay_EfZEwe28YBctRJ","gateway":"eyJpdiI6InkxcTIwaFVJRjJXR3diTkErYnVQVHc9PSIsInZhbHVlIjoiODFPa3oyMUtBS0JON01FNk1YN1AwNTMxK3FtY3hWQ1dmYzNyQ1wvR0x4TWs9IiwibWFjIjoiNzIxYzE4MjkyNjMwNmMxMWE4YmYzNzczY2E3NWRmOTc3NGZjYzEyNjdhYTZkNGFhNGRjNWUxM2EwODAzNjFkYSJ9","contact":"+919723461024","amount":"1.00","formatted_amount":"₹ 1","wallet":null,"merchant":"Razorpay","merchant_id":"2aTeFCKTYWwfrF","redirect":"https:\\/\\/api.razorpay.com\\/v1\\/payments\\/pay_EfZEwe28YBctRJ\\/authentication\\/redirect?key_id=rzp_live_ILgsfZCZoFIKMb","metadata":{"issuer":"HDFC","network":"VISA","last4":"0176","iin":"416021","gateway":"hitachi"}};\n    // input data //\n    try { CheckoutBridge.setPaymentID(data.payment_id) } catch(e){}\n  </script>\n  <div id="app"></div>\n  <script type="text/javascript" src="https://cdn.razorpay.com/static/payment_redirect/bundle.js" charset="utf-8"></script>\n  \n  <form class="card" id="otpform" name="otpform" action="http://localhost:5000/v1/payments/pay_EfZEwe28YBctRJ/otp_submit/5bc33a3afc07cad92ed16f750e1b393d894fdf86?key_id=rzp_live_ILgsfZCZoFIKMb" method="post">\n    <input id=\'otp\' type="hidden" name="otp" maxlength="6">\n  </form>\n  <form id="form2" name="form2">\n    <input type="hidden" name="type" value="otp">\n    <input type="hidden" name="gateway" value="eyJpdiI6InkxcTIwaFVJRjJXR3diTkErYnVQVHc9PSIsInZhbHVlIjoiODFPa3oyMUtBS0JON01FNk1YN1AwNTMxK3FtY3hWQ1dmYzNyQ1wvR0x4TWs9IiwibWFjIjoiNzIxYzE4MjkyNjMwNmMxMWE4YmYzNzczY2E3NWRmOTc3NGZjYzEyNjdhYTZkNGFhNGRjNWUxM2EwODAzNjFkYSJ9">\n  </form>\n</body>\n</html>\n',
    },
    version: 1,
    payment_id: 'pay_EfZEwe28YBctRJ',
    next: ['otp_submit', 'otp_resend'],
    gateway:
      'eyJpdiI6InkxcTIwaFVJRjJXR3diTkErYnVQVHc9PSIsInZhbHVlIjoiODFPa3oyMUtBS0JON01FNk1YN1AwNTMxK3FtY3hWQ1dmYzNyQ1wvR0x4TWs9IiwibWFjIjoiNzIxYzE4MjkyNjMwNmMxMWE4YmYzNzczY2E3NWRmOTc3NGZjYzEyNjdhYTZkNGFhNGRjNWUxM2EwODAzNjFkYSJ9',
    submit_url:
      ENDPOINT +
      '/v1/payments/pay_EfZEwe28YBctRJ/otp_submit/5bc33a3afc07cad92ed16f750e1b393d894fdf86?key_id=rzp_live_ILgsfZCZoFIKMb',
    resend_url: ENDPOINT + '/v1/payments/pay_EfZEwe28YBctRJ/otp/resend',
    metadata: {
      issuer: 'HDFC',
      network: 'VISA',
      last4: '0176',
      iin: '416021',
      gateway: 'hitachi',
    },
    redirect:
      ENDPOINT +
      '/v1/payments/pay_EfZEwe28YBctRJ/authentication/redirect?key_id=rzp_live_ILgsfZCZoFIKMb',
    submit_url_private: ENDPOINT + '/v1/payments/pay_EfZEwe28YBctRJ/otp/submit',
    resend_url_private: ENDPOINT + '/v1/payments/pay_EfZEwe28YBctRJ/otp/resend',
  },
  first_data: {
    type: 'first',
    request: {
      url: ENDPOINT + '/bank',
      method: 'post',
      content: {
        timezone: 'Asia/Kolkata',
        txndatetime: '2020:05:06-11:38:37',
        hash_algorithm: 'SHA1',
        hash: 'f9c5a782187470ec6c5d23a72a85a047fab2667f',
        storename: '3387030093',
        mode: 'payonly',
        chargetotal: 1,
        currency: '356',
        oid: 'Emy1SghR4AkTfR',
        invoicenumber: 'Emy1SghR4AkTfR',
        merchantTransactionId: 'Emy1SghR4AkTfR',
        comments: '',
        dynamicMerchantName: 'Razorpay',
        language: 'en_GB',
        cardnumber: '508925XXXXXX4928',
        bname: 'Prabhath',
        expmonth: 4,
        expyear: 2023,
        cvm: '000',
        responseSuccessURL:
          ENDPOINT +
          '/v1/payments/pay_Emy1SghR4AkTfR/callback/10ff9d4ab123e138b6e3dd1057c539625735fe3a/rzp_live_OwPnQuHrOcVAax',
        responseFailURL:
          ENDPOINT +
          '/v1/payments/pay_Emy1SghR4AkTfR/callback/10ff9d4ab123e138b6e3dd1057c539625735fe3a/rzp_live_OwPnQuHrOcVAax',
        txntype: 'sale',
        paymentMethod: 'RU',
      },
      options: [],
    },
    version: 1,
    payment_id: 'pay_Emy1SghR4AkTfR',
    gateway:
      'eyJpdiI6InVTNWtCampaV052MHpPMHZCNG5TSGc9PSIsInZhbHVlIjoidUdJYWFwOVRZSjZJN2QrVTFJYWlGVXgxdmp6MktVeCtzamhXNmV3SXl2bz0iLCJtYWMiOiJhOTc0ZjVmZmZkZmVkMGUwYWIzNzdkZTIwNGI4OTQzOTIwN2Y0YzMzOGNiZmRiMzdhNjA4NWY0NjkwMDI0YmNjIn0=',
    amount: '\u20b9 1',
    image: null,
    magic: false,
  },
  hdfc_otp: {
    type: 'otp',
    request: {
      method: 'direct',
      content:
        '<!doctype html>\n<html>\n<head>\n  <title></title>\n  <meta http-equiv="X-UA-Compatible" content="IE=edge">\n  <meta charset="utf-8" />\n  <meta http-equiv="X-UA-Compatible" content="IE=edge">\n  <meta name="viewport" content="width=device-width, initial-scale=1">\n</head>\n<script>\n  var events = {\n    page: \'gateway_otp_postform\',\n    props: {\n          payment_id: \'pay_Ep1kkNJDzAdvIZ\',\n              merchant_id: \'2aTeFCKTYWwfrF\',\n        },\n    load: true,\n    unload: true\n  }\n</script>\n<script>\n!function(e){e.track=Boolean;try{if(/razorpay\\.in$/.test(location.origin))return;if("object"!=typeof e.events)return;var n=e.events.props;if(0===Object.keys(n).length)return;var t,o=e.events,r=o.page,a=o.load,s=o.unload,i=o.error,c="https://lumberjack.razorpay.com/v1/track",u="MC40OTMwNzgyMDM3MDgwNjI3Nw9YnGzW",p="function"==typeof navigator.sendBeacon,d=Date.now(),f=[{name:"ua_parser",input_key:"user_agent",output_key:"user_agent_parsed"}];function l(e,o){(o=o||{}).beacon=p,o.time_since_render=Date.now()-d,o.url=location.href,function(e,n){if(e&&n)Object.keys(n).forEach(function(t){e[t]=n[t]})}(o,n);var a={addons:f,events:[{event:r+":"+e,properties:o,timestamp:Date.now()}]},s=encodeURIComponent(btoa(unescape(encodeURIComponent(JSON.stringify(a))))),i=JSON.stringify({key:u,data:s});p?navigator.sendBeacon(c,i):((t=new XMLHttpRequest).open("post",c,!0),t.send(i))}a&&l("load"),s&&e.addEventListener("unload",function(){l("unload")}),i&&e.addEventListener("error",function(e){l("error",{message:e.message,line:e.line,col:e.col,stack:e.error&&e.error.stack})})}catch(e){}e.track=l}(window);\n</script>\n\n<body>\n    <div id="preloading">\n        <style>\n            body {\n                background: #f4f4f4;\n            }\n        </style>\n        <style>\n@keyframes  lo{to{transform:rotate(360deg)}}@-webkit-keyframes lo{to{-webkit-transform:rotate(360deg)}}\n.loader{height:24px;width:24px;border-radius:50%;display:inline-block;\n  animation:lo .8s infinite linear;-webkit-animation:lo .8s infinite linear;\n  transition:0.3s;-webkit-transition:0.3s;\n  opacity:0;border:2px solid #3395FF;border-top-color:transparent}\n.vis{opacity:1}\n</style>\n<div class="loader vis" style="position:absolute;top:115px;left:50%;margin-left:-12px"></div>\n        <img src="https://cdn.razorpay.com/logo.svg" id="logo" height="35px" style="margin:30px auto 10px; display:block">\n    </div>\n  <script type="text/javascript">\n    // input data //\n    var data = {"type":"otp","request":{"content":{"bank":"HDFC","type":"otp","next":["submit_otp","resend_otp"]},"method":"POST","url":"https:\\/\\/api.razorpay.com\\/v1\\/payments\\/pay_Ep1kkNJDzAdvIZ\\/otp_submit\\/4a6a87fce1bc82588be5f299b42ab93792554f36?key_id=rzp_live_ILgsfZCZoFIKMb"},"version":1,"payment_id":"pay_Ep1kkNJDzAdvIZ","gateway":"eyJpdiI6IjVmNmxSN2FrTlE0R2I3QThtSnFLR3c9PSIsInZhbHVlIjoib29IRmFBTWxEaG0xQVp3Tm95U0pNZExGN2lsQnBJWkJlcDJaQ0xmQ1p1UT0iLCJtYWMiOiIzYTZhYTczNWJhN2M4YzBlMDlmODYxMjIxN2Y3Y2FiNjdkNzgyYmZhZTRkMDY3MTNiZjI2YTEzZWMwYjJlOGY3In0=","contact":"+919723461024","amount":"1.00","formatted_amount":"\u20b9 1","wallet":null,"merchant":"Razorpay","merchant_id":"2aTeFCKTYWwfrF","redirect":"https:\\/\\/api.razorpay.com\\/v1\\/payments\\/pay_Ep1kkNJDzAdvIZ\\/authentication\\/redirect?key_id=rzp_live_ILgsfZCZoFIKMb","metadata":{"issuer":"HDFC","network":"VISA","last4":"0176","iin":"416021","gateway":"hitachi"}};\n    // input data //\n    try { CheckoutBridge.setPaymentID(data.payment_id) } catch(e){}\n  </script>\n  <div id="app"></div>\n  <script type="text/javascript" src="https://cdn.razorpay.com/static/payment_redirect/bundle.js" charset="utf-8"></script>\n  \n  <form class="card" id="otpform" name="otpform" action="http://localhost:5000/v1/payments/pay_Ep1kkNJDzAdvIZ/otp_submit/4a6a87fce1bc82588be5f299b42ab93792554f36?key_id=rzp_live_ILgsfZCZoFIKMb" method="post">\n    <input id=\'otp\' type="hidden" name="otp" maxlength="6">\n  </form>\n  <form id="form2" name="form2">\n    <input type="hidden" name="type" value="otp">\n    <input type="hidden" name="gateway" value="eyJpdiI6IjVmNmxSN2FrTlE0R2I3QThtSnFLR3c9PSIsInZhbHVlIjoib29IRmFBTWxEaG0xQVp3Tm95U0pNZExGN2lsQnBJWkJlcDJaQ0xmQ1p1UT0iLCJtYWMiOiIzYTZhYTczNWJhN2M4YzBlMDlmODYxMjIxN2Y3Y2FiNjdkNzgyYmZhZTRkMDY3MTNiZjI2YTEzZWMwYjJlOGY3In0=">\n  </form>\n</body>\n</html>\n',
    },
    version: 1,
    payment_id: 'pay_Ep1kkNJDzAdvIZ',
    next: ['otp_submit', 'otp_resend'],
    gateway:
      'eyJpdiI6IjVmNmxSN2FrTlE0R2I3QThtSnFLR3c9PSIsInZhbHVlIjoib29IRmFBTWxEaG0xQVp3Tm95U0pNZExGN2lsQnBJWkJlcDJaQ0xmQ1p1UT0iLCJtYWMiOiIzYTZhYTczNWJhN2M4YzBlMDlmODYxMjIxN2Y3Y2FiNjdkNzgyYmZhZTRkMDY3MTNiZjI2YTEzZWMwYjJlOGY3In0=',
    submit_url:
      ENDPOINT +
      '/v1/payments/pay_Ep1kkNJDzAdvIZ/otp_submit/4a6a87fce1bc82588be5f299b42ab93792554f36?key_id=rzp_live_ILgsfZCZoFIKMb',
    resend_url: ENDPOINT + '/v1/payments/pay_Ep1kkNJDzAdvIZ/otp/resend',
    metadata: {
      issuer: 'HDFC',
      network: 'VISA',
      last4: '0176',
      iin: '416021',
      gateway: 'hitachi',
    },
    redirect:
      ENDPOINT +
      '/v1/payments/pay_Ep1kkNJDzAdvIZ/authentication/redirect?key_id=rzp_live_ILgsfZCZoFIKMb',
    submit_url_private: ENDPOINT + '/v1/payments/pay_Ep1kkNJDzAdvIZ/otp/submit',
    resend_url_private: ENDPOINT + '/v1/payments/pay_Ep1kkNJDzAdvIZ/otp/resend',
  },
  wallet: {
    type: 'otp',
    request: {
      url:
        ENDPOINT +
        '/v1/payments/pay_EfaGm4YEWwDLMc/otp_submit/90593e08f08bb9cec829cb857d891a85fd56b847?key_id=rzp_live_ILgsfZCZoFIKMb',
      method: 'post',
      content: {
        next: ['resend_otp'],
      },
    },
    version: 1,
    payment_id: 'pay_EfaGm4YEWwDLMc',
    gateway:
      'eyJpdiI6IlpLT3FndmNyVUNUQUFNOWRrcXFcL3FBPT0iLCJ2YWx1ZSI6IllXSEtcL0huWXVyTGtkbDBQNXRUdkJlOUE1ZVF4b1NKVWtnTWl1ditvdzdIWEp1bjdvTEVwc2o4ZGJscDdHc1Q1IiwibWFjIjoiN2E5Yzg4ZmZkN2I3ZmJjY2Q4MGQ0YWNiMDkzYzA1NDFmYTRkYzkxMGM2MDM1YTM5ZWM5MDRkZTZiMDI5ZmEzOSJ9',
    contact: '+919723461024',
    amount: '1.00',
    formatted_amount: '₹ 1',
    wallet: 'freecharge',
    merchant: 'Razorpay',
    merchant_id: '2aTeFCKTYWwfrF',
  },
  gpay_cards: {
    version: '1.0',
    type: 'application',
    application_name: 'google_pay',
    payment_id: 'pay_GqAUUr978elhqA',
    gateway: '*encrypted gateway value*',
    request: {
      url: ENDPOINT + '/v1/payments/pay_GqAUUr978elhqA/status',
      method: 'sdk',
      content: {
        bundle: {
          apiVersion: '1.0',
          allowedPaymentMethods: [
            {
              type: 'CARD',
              parameters: {
                allowedCardNetworks: ['VISA', 'MASTERCARD'],
              },
            },
          ],
          tokenizationSpecification: {
            type: 'PAYMENT_GATEWAY',
            parameters: {
              gateway: 'razorpay',
              gatewayMerchantId: 'Gr978elhqAGqAU',
              gatewayTransactionId: 'pay_GqAUUr978elhqA',
            },
          },
          transactionInfo: {
            currencyCode: 'INR',
            totalPrice: '100',
            totalPriceStatus: 'FINAL',
          },
        },
      },
    },
  },
  cred_intent: {
    type: 'intent',
    version: 1,
    payment_id: 'pay_F2pqrpQCgRS6ae',
    gateway:
      'eyJpdiI6InlYXC9NT1wvcDc5VEl2TVNFaVFVdktQUT09IiwidmFsdWUiOiJrVm9BcUFkMHZBczltbjdCeXhlSFhBVEIxQWVtdCtPblwvKzdMWlEya0JnMD0iLCJtYWMiOiJjODMwM2VjZjFhMzZmYTRjZDBjMjE1OWMwNWMwYjA2OWQ3YTk2YzI3NWIzYWM3YTY4NzAyMGRkNTRhYTFlZmJmIn0=',
    data: {
      intent_url:
        'credpay://checkout?ref_id=22323482-f73f-4c60-85b7-a673d43ffbf9&is_collect=false&redirect_to=https%3A%2F%2Fbeta-api.stage.razorpay.in%2Fv1%2Fpayments%2Fpay_F2pqrpQCgRS6ae%2Fcallback%2F4733245ccd35a14a0a40ea1732fa106b001c0fa8%2Frzp_live_aEZD9dPPpUfCeq',
    },
    request: {
      url: ENDPOINT + '/v1/payments/pay_GqAUUr978elhqA/status',
      method: 'GET',
    },
  },
  cred_collect: {
    type: 'async',
    version: 1,
    payment_id: 'pay_F66XB9Pq9RNH1m',
    gateway:
      'eyJpdiI6IkR2XC9Mazg3WEQrdzlCMHdJQ2NuelZnPT0iLCJ2YWx1ZSI6IlwveGZCb1JNakJRUjFwNzBQT0paWVwvT2N5aVNkMkdFVTFoQlA2M0w2MGtKdz0iLCJtYWMiOiI3Zjc0MGVkNWY0M2I1MDE5MTVhOWYxOWVmNzhlNGY1MGQ2NjUzMTYzYjk1NzFjOThjNzZhYzk2MTg2NzIzOTJlIn0=',
    data: {
      vpa: 'CRED',
    },
    request: {
      url: ENDPOINT + '/v1/payments/pay_GqAUUr978elhqA/status',
      method: 'GET',
    },
  },
  bepg_ajax: {
    type: 'first',
    request: {
      content: {
        next: ['resend_otp'],
      },
      method: 'post',
      url:
        ENDPOINT +
        '/v1/payments/pay_F6Pdu6JSFfmwKx/otp_submit/ae7fa8e9487c7eb551626a71a40f17c141a20d1f?key_id=rzp_live_rcoG73Wt262itG',
    },
    version: 1,
    payment_id: 'pay_F6Pdu6JSFfmwKx',
    gateway:
      'eyJpdiI6IjdySGR6MUpMR3pCMU9TZEdDXC92d2ZRPT0iLCJ2YWx1ZSI6ImNVQmhaSXB2eGxvenVoV3pkbjlUZCtXQkhkM295ZDRCTDJiTGlUODBDZzA9IiwibWFjIjoiYjliMWJiODA0ZGFlNzA0ZmVmOTJkOGRmN2EwYWExYzJiMjZiYmU1MDRjYTZjMWM0MGY5M2I5ZTgzOWUxYmYzYiJ9',
    amount: '₹ 1',
    image: null,
    magic: false,
  },
  bepg_otp_incorrect: {
    error: {
      code: 'BAD_REQUEST_ERROR',
      description: 'Payment processing failed because of incorrect OTP',
      source: 'customer',
      step: 'payment_authentication',
      reason: 'incorrect_otp',
      metadata: {
        payment_id: 'pay_F6Pdu6JSFfmwKx',
      },
      action: 'RETRY',
    },
  },
  bepg_otp_missing: {
    error: {
      code: 'BAD_REQUEST_ERROR',
      description: 'Validation Failure',
      source: 'business',
      step: 'payment_initiation',
      reason: 'input_validation_failed',
      metadata: {
        payment_id: 'pay_F6Q4NvP1E05HxH',
      },
    },
  },
  bepg_error: {
    error: {
      code: 'GATEWAY_ERROR',
      description:
        'Payment processing failed due to error at bank or wallet gateway',
      source: 'gateway',
      step: 'payment_authorization',
      reason: 'gateway_technical_error',
      metadata: {
        payment_id: 'pay_F6Pdu6JSFfmwKx',
      },
    },
  },
  bepg_ajax_otp: {
    type: 'otp',
    request: {
      method: 'direct',
      content: '',
    },
    version: 1,
    payment_id: 'pay_Ep1kkNJDzAdvIZ',
    next: ['otp_submit', 'otp_resend'],
    gateway:
      'eyJpdiI6IjVmNmxSN2FrTlE0R2I3QThtSnFLR3c9PSIsInZhbHVlIjoib29IRmFBTWxEaG0xQVp3Tm95U0pNZExGN2lsQnBJWkJlcDJaQ0xmQ1p1UT0iLCJtYWMiOiIzYTZhYTczNWJhN2M4YzBlMDlmODYxMjIxN2Y3Y2FiNjdkNzgyYmZhZTRkMDY3MTNiZjI2YTEzZWMwYjJlOGY3In0=',
    submit_url:
      ENDPOINT +
      '/v1/payments/pay_Ep1kkNJDzAdvIZ/otp_submit/4a6a87fce1bc82588be5f299b42ab93792554f36?key_id=rzp_live_ILgsfZCZoFIKMb',
    resend_url: ENDPOINT + '/v1/payments/pay_Ep1kkNJDzAdvIZ/otp/resend',
    metadata: {
      issuer: 'HDFC',
      network: 'VISA',
      last4: '0176',
      iin: '416021',
      gateway: 'hitachi',
      contact: '9723461024',
      ip: '10.2.1.33',
      resend_timeout: 30,
    },
    unused_redirect:
      ENDPOINT +
      '/v1/payments/pay_Ep1kkNJDzAdvIZ/authentication/redirect?key_id=rzp_live_ILgsfZCZoFIKMb',
    submit_url_private: ENDPOINT + '/v1/payments/pay_Ep1kkNJDzAdvIZ/otp/submit',
    resend_url_private: ENDPOINT + '/v1/payments/pay_Ep1kkNJDzAdvIZ/otp/resend',
  },
  hdfc_cardless: {
    type: 'respawn',
    request: {
      url: 'https://api.razorpay.com/v1/otp/verify?method=cardless_emi&provider=icic&payment_id=pay_JndaYiEzvigfR9&key_id=rzp_live_ILgsfZCZoFIKMb',
      method: 'POST',
      content: {
        contact: '+919731881407',
        email: 'qa.testing@razorpay.com',
        method: 'cardless_emi',
        provider: 'hdfc',
        amount: '1000000',
        reward_ids: ['reward_GfGhhZ129iXdJ3'],
        currency: 'INR',
        payment_id: 'pay_JndaYiEzvigfR9',
      },
    },
    emi_plans: {
      hdfc: [
        {
          entity: 'emi_plan',
          duration: 3,
          interest: '16.0',
          currency: 'INR',
          amount_per_month: 342300,
          emi_plan_id: '1001156',
        },
        {
          entity: 'emi_plan',
          duration: 6,
          interest: '16.0',
          currency: 'INR',
          amount_per_month: 174600,
          emi_plan_id: '1001155',
        },
        {
          entity: 'emi_plan',
          duration: 9,
          interest: '16.0',
          currency: 'INR',
          amount_per_month: 118700,
          emi_plan_id: '1001157',
        },
        {
          entity: 'emi_plan',
          duration: 12,
          interest: '16.0',
          currency: 'INR',
          amount_per_month: 90800,
          emi_plan_id: '1001158',
        },
      ],
    },
    gateway:
      'eyJpdiI6IjI1UXpwS0gyMFN0WEJGN3p2N2ZuQVE9PSIsInZhbHVlIjoiRXhNZFZvckZzS2E5ekI4WVR2RVc2cU1Yb0NqNnhOUERlK1lrdnFOQThyUVVKRkU0TDhaZnpIU2YzMVVKUlIwMyIsIm1hYyI6IjQxNTFmNGJlYjg5MmMyOGEwMWRlMmJmYTE4YjViODE3ZGM5YzVjMjRkYjYyM2Q4ZmRkODQyNDA4OWNiZTdjYmIifQ==',
    image: null,
    key_id: 'rzp_live_ILgsfZCZoFIKMb',
    lender_branding_url: 'https://iccdn.in/lenders/icici-main-logo-v3.svg',
    merchant: 'Razorpay Software Private Limited',
    method: 'cardless_emi',
    payment_create_url:
      'https://api.razorpay.com/v1/payments?key_id=rzp_live_ILgsfZCZoFIKMb',
    payment_id: 'pay_JndaYiEzvigfR9',
    version: 1,
  },
  cardless_error: {
    error: {
      code: 'BAD_REQUEST_ERROR',
      description:
        'Your payment was declined as you are not registered with the provider. To pay successfully try using another method.',
      source: 'customer',
      step: 'payment_eligibility check',
      reason: 'user_not_eligible',
      metadata: {},
    },
  },
};

const checkout = {
  hdfc: fs.readFileSync(__dirname + '/../html/bank.html', 'utf8'),
  cred_collect: fs.readFileSync(
    __dirname + '/../html/cred_collect.html',
    'utf8'
  ),
};

const getAjax = (body) => {
  if (body.method === 'app' && body.provider === 'cred') {
    if (Number(body.app_present)) {
      return ajax.cred_intent;
    }
    return ajax.cred_collect;
  }
  if (body.application === 'google_pay') {
    return ajax.gpay_cards;
  }
  if (body.method === 'wallet') {
    return ajax.wallet;
  }
  if (body.method === 'emi') {
    return ajax.hdfc_dc;
  }
  if (body.method === 'card') {
    return ajax.hdfc_otp;
  }
  if (body.method === 'cardless_emi') {
    if (body.provider !== 'hdfc') {
      return ajax.cardless_error;
    }
    return ajax.hdfc_cardless;
  }
  if (body.method === 'cod') {
    return ajax.cod;
  }
  if (body.method === 'app' && ['trustly', 'poli'].includes(body.provider)) {
    return ajax.hdfc_first;
  }
  return {
    error: {
      description: 'Unsupported payload/method',
    },
  };
};

const getCheckout = (body) => {
  if (body.method === 'card') {
    return checkout.hdfc;
  }
  return {
    error: {
      description: 'Unsupported payload/method',
    },
  };
};

module.exports = { getAjax, getCheckout };
