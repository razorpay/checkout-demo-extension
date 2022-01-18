import {
  isGoogleAnalyticsEnabled,
  isFacebookAnalyticsEnabled,
  isOneClickCheckout,
} from 'razorpay';

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
