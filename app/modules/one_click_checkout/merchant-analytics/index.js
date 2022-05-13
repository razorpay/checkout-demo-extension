import {
  isGoogleAnalyticsEnabled,
  isFacebookAnalyticsEnabled,
  isOneClickCheckout,
  getCustomerCart,
} from 'razorpay';

function getCartInfo() {
  const { content_type, contents, currency, value } = getCustomerCart() || {};
  return {
    content_ids: contents?.map((item) => item.id),
    content_type,
    contents,
    currency,
    value,
    num_items: contents?.length,
  };
}

export function merchantAnalytics(params) {
  if (isOneClickCheckout()) {
    if (isGoogleAnalyticsEnabled()) {
      global.Razorpay.sendMessage({
        event: 'gaevent',
        data: params,
      });
    }
    if (isFacebookAnalyticsEnabled()) {
      global.Razorpay.sendMessage({
        event: 'fbaevent',
        data: params,
      });
    }
  }
}

export function merchantFBStandardAnalytics(data) {
  if (
    isOneClickCheckout() &&
    isFacebookAnalyticsEnabled() &&
    getCustomerCart() &&
    Object.keys(getCustomerCart())?.length
  ) {
    data.params = getCartInfo();
    global.Razorpay.sendMessage({
      event: 'fbaevent',
      eventType: 'track',
      data,
    });
  }
}
