import Razorpay from 'common/Razorpay';
import {
  isGoogleAnalyticsEnabled,
  isFacebookAnalyticsEnabled,
  isOneClickCheckout,
  getCustomerCart,
  isMoEngageAnalyticsEnabled,
  getCurrency,
} from 'razorpay';

function getCartInfo() {
  const { content_type, contents, currency, value } = getCustomerCart() || {};
  return {
    content_ids: contents?.map((item) => item.variant_id),
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
      eventType: 'track',
      data,
    });
  }
}

export function moengageAnalytics(data) {
  if (isOneClickCheckout() && isMoEngageAnalyticsEnabled()) {
    global.Razorpay.sendMessage({
      event: 'moengageevent',
      data,
    });
  }
}

export function generateInitialMoengagePayload(data) {
  return {
    'Product Name': data.map((item) => item.name),
    'Product ID': data.map((item) => item.sku),
    'Product Quantity': data.map((item) => item.quantity),
    'Product Variant ID': data.map((item) => item.variant_id),
    'Product Price': data.map((item) => item.price / 100),
    'Image URL': data.map((item) => item.image_url),
    'Product Url': data.map((item) => item.product_url),
    Currency: getCurrency(),
    Tag: 'Magic',
  };
}
