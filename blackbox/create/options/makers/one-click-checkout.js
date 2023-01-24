const { getOffersList } = require('../../../actions/one-click-checkout/offers');

function makeOptions(features, options) {
  const { orderId, callbackUrl, prefillContact } = features;

  options = {
    one_click_checkout: true,
    show_coupons: !features.couponsDisabled,
    order_id: orderId || 'order_IPsh3f7t7s0bv3',
    remember_customer: true,
  };
  if (features.prefillCoupon) {
    options.prefill = { coupon_code: features.couponCode };
  }
  if (callbackUrl) {
    options.callback_url =
      'http://www.merchanturl.com/callback?test1=abc&test2=xyz';
    options.redirect = true;
  }

  if (prefillContact) {
    options = {
      ...options,
      prefill: {
        contact: '9999999999',
        email: 'test@gmail.com',
      },
    };
  }

  return options;
}

function makePreferences(features, preferences) {
  const {
    amount,
    mandatoryLogin,
    offers,
    consentBannerViews,
    twDisabled,
    globalCustomer,
  } = features;

  preferences.experiments = {};

  preferences.features = {
    one_click_checkout: true,
    one_cc_merchant_dashboard: true,
    one_cc_mandatory_login: mandatoryLogin ?? false,
    cod_intelligence: !twDisabled,
    save_vpa: true,
  };

  preferences.order = {
    amount,
    line_items_total: amount,
    partial_payment: false,
  };

  preferences['1cc'] = {
    configs: {
      one_cc_auto_fetch_coupons: !!features.showCoupons,
      one_cc_capture_billing_address: !!features.billingEnabled,
      one_cc_international_shipping: !!features.internationalShippingEnabled,
    },
  };

  if (preferences.customer) {
    preferences.customer = {
      ...preferences.customer,
      '1cc_consent_banner_views': consentBannerViews,
    };
  }

  if (offers) {
    preferences.offers = getOffersList({ amount });
  }

  if (globalCustomer) {
    preferences.global = true;
  }

  preferences['options'] = {
    remember_customer: true,
  };

  return preferences;
}

module.exports = {
  makeOptions,
  makePreferences,
};
