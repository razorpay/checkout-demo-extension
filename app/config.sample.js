const base = location.protocol + '//' + location.hostname + ':' + location.port;
const test_key = rzp_test_1DP5mmOlF5G5ag;
Razorpay = {
  config: {
    key_id: 'rzp_test_1DP5mmOlF5G5ag',
    key_secret: 'thisissupersecret',
    app_user: 'rzp_test_10000000000000',
    app_secret: 'RANDOM_DASH_PASSWORD',
    api: base + '/api/',
    frameApi: base + '/api/',

    // path for iframe, if set
    frame: '/checkout.html',

    // path for view/checkout to load js from
    js: 'http://checkout.pronav.in/dist/',
  },
};
