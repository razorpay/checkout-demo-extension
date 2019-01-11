var RC = Razorpay.config;

function parseOptions(o, data) {
  if (typeof o === 'string') {
    o = {
      url: o,
      data: data,
    };
  }
  return o;
}

function makeAPIFactory(requestFn) {
  return function(url, defaults) {
    return function(attributes) {
      if (!attributes) {
        attributes = {};
      }
      for (var i in defaults) {
        if (defaults.hasOwnProperty(i) && !attributes.hasOwnProperty(i)) {
          attributes[i] = defaults[i];
        }
      }
      return requestFn(url, attributes).id;
    };
  };
}

var api = {
  request: function(o, data) {
    o = parseOptions(o, data);
    var url = RC.api + 'v1/' + o.url;
    var method = o.method || 'post';
    var xhr = new XMLHttpRequest();
    xhr.open(method, url, false, o.user || RC.key_id, o.pass || RC.key_secret);
    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.send((o.data && JSON.stringify(o.data)) || null);
    return JSON.parse(xhr.responseText);
  },

  adminRequest: function(o, data) {
    o = parseOptions(o, data);
    o.user = RC.app_user;
    o.pass = RC.app_secret;
    return api.request(o);
  },
};

var publicApi = makeAPIFactory(api.request);
var adminApi = makeAPIFactory(api.adminRequest);

api.createOrder = publicApi('orders', { currency: 'INR', amount: 100 });

api.createOffer = function() {
  return adminApi('offers', {
    ends_at: 2147483646,
    terms: 'Terms of the offer',
    percent_rate: 10,
  });
};
