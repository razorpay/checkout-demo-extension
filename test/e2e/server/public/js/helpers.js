function getCookie(sKey) {
  if (!sKey) { return null; }
  return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
}

function merge(source, obj) {
  for (i in obj) {
    if (obj.hasOwnProperty(i)) {
      if (typeof obj[i] === 'object') {
        source[i] = merge(source[i] || {}, obj[i]);
      } else {
        source[i] = obj[i];
      }
    }
  }
  return source;
}

var options = {
  "key": "rzp_test_n7LBSmN4pm3dqe",
  "amount": "2000", // 2000 paise = INR 20
  "name": "Merchant Name",
  "description": "Purchase Description",
  "image": "images/glyph-rounded-square.svg",
  "handler": function (response){
    alert(JSON.stringify(response));
  },
  "prefill": {
    "name": "Harshil Mathur",
    "email": "harshil@razorpay.com"
  },
  "notes": {
    "address": "Hello World"
  },
  "theme": {
    "color": "#F37254"
  }
};
