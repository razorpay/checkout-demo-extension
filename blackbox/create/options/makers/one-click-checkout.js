function makeOptions(features, options) {
  const {
    showCoupons,
    showAddress,
    mandatoryLogin,
    forceCOD,
    orderId,
    callbackUrl,
  } = features;

  options = {
    one_click_checkout: true,
    show_address: showAddress,
    show_coupons: showCoupons,
    mandatory_login: mandatoryLogin,
    force_cod: forceCOD,
    order_id: orderId || 'order_IPsh3f7t7s0bv3',
  };

  if (callbackUrl) {
    options.callback_url =
      'http://www.merchanturl.com/callback?test1=abc&test2=xyz';
    options.redirect = true;
  }

  return options;
}

function makePreferences(features, preferences) {
  const { amount } = features;

  preferences.features = {
    one_click_checkout: true,
    one_cc_merchant_dashboard: true,
  };

  preferences.order = {
    amount,
    line_items_total: amount,
    partial_payment: false,
  };

  return preferences;
}

module.exports = {
  makeOptions,
  makePreferences,
};
