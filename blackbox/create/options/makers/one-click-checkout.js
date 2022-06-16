function makeOptions(features, options) {
  const { showCoupons, showAddress, mandatoryLogin, orderId, callbackUrl } =
    features;

  options = {
    one_click_checkout: true,
    show_address: showAddress,
    show_coupons: showCoupons,
    mandatory_login: mandatoryLogin,
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

  if (features.showCoupons) {
    preferences['1cc'] = {
      configs: {
        one_cc_auto_fetch_coupons: true,
      },
    };
  }

  return preferences;
}

module.exports = {
  makeOptions,
  makePreferences,
};
