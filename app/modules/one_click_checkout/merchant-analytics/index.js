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
      Razorpay.sendMessage({
        event: 'gaevent',
        data: params,
      });
    }
    if (isFacebookAnalyticsEnabled()) {
      Razorpay.sendMessage({
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
    Razorpay.sendMessage({
      event: 'fbaevent',
      data,
    });
  }
}
