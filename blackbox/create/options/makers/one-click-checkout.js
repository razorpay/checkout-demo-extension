function makeOptions(features, options) {
  const { orderId, callbackUrl } = features;

  options = {
    one_click_checkout: true,
    show_coupons: !features.couponsDisabled,
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
  const { amount, mandatoryLogin, offers, consentBannerViews, twDisabled } =
    features;

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
    },
  };

  if (preferences.customer) {
    preferences.customer = {
      ...preferences.customer,
      '1cc_consent_banner_views': consentBannerViews,
    };
  }

  if (offers) {
    preferences.offers = [
      {
        original_amount: amount,
        amount: amount - 20 * 100,
        id: 'offer_DdMaQ3KHyKxcDN',
        name: 'Card Offer VISA',
        payment_method: 'card',
        payment_network: 'VISA',
        terms: `Offer terms and conditions`,
        display_text: 'Display text for VISA Offer',
      },
      {
        original_amount: amount,
        amount: 0,
        id: 'offer_DdOL4XeZosJh2t',
        name: 'Card Offer - MasterCard 20',
        payment_method: 'card',
        payment_network: 'MC',
        display_text: 'Display text for MC Offer',
      },
      {
        original_amount: amount,
        amount: amount - 20 * 100,
        id: 'offer_Dcad1sICBaV2wI',
        name: 'UPI Offer Name',
        payment_method: 'upi',
        display_text: 'UPI Offer Display Text',
      },
      {
        original_amount: amount,
        amount: 0,
        id: 'offer_DcaetTeD4Gjcma',
        name: 'UPI Offer Name 2',
        payment_method: 'upi',
        display_text: 'UPI Offer Display Text 2',
      },
    ];
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
