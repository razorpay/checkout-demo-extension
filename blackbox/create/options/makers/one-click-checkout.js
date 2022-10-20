function makeOptions(features, options) {
  const { showCoupons, showAddress, orderId, callbackUrl } = features;

  options = {
    one_click_checkout: true,
    show_address: showAddress,
    show_coupons: showCoupons,
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
  const { amount, mandatoryLogin, consentBannerViews } = features;

  preferences.features = {
    one_click_checkout: true,
    one_cc_merchant_dashboard: true,
    one_cc_mandatory_login: mandatoryLogin ?? false,
  };

  preferences.order = {
    amount,
    line_items_total: amount,
    partial_payment: false,
  };

  preferences['1cc'] = {
    configs: {
      one_cc_auto_fetch_coupons: features.showCoupons,
      one_cc_capture_billing_address: features.billingEnabled,
    },
  };

  if (preferences.customer) {
    preferences.customer = {
      ...preferences.customer,
      '1cc_consent_banner_views': consentBannerViews,
    };
  }

  return preferences;
}

module.exports = {
  makeOptions,
  makePreferences,
};
