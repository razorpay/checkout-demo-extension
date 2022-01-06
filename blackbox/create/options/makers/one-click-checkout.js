function makeOptions(features, options) {
  const {
    showCoupons,
    showAddress,
    mandatoryLogin,
    forceCOD,
    orderId,
    prefillCoupon,
    couponCode,
  } = features;

  options = {
    one_click_checkout: true,
    show_address: showAddress,
    show_coupons: showCoupons,
    mandatory_login: mandatoryLogin,
    force_cod: forceCOD,
    order_id: orderId || 'order_IPsh3f7t7s0bv3',
  };

  if (prefillCoupon) {
    options = {
      prefill: {
        coupon_code: couponCode || 'WELCOME10',
      },
      ...options,
    };
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
    amount: amount || 2000,
    line_items_total: amount || 2000,
    partial_payment: false,
  };

  return preferences;
}

module.exports = {
  makeOptions,
  makePreferences,
};
