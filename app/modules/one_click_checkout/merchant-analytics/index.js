import {
  isGoogleAnalyticsEnabled,
  isFacebookAnalyticsEnabled,
  isOneClickCheckout,
} from 'razorpay';

export function merchantAnalytics(params) {
  if (isOneClickCheckout()) {
    Razorpay.sendMessage({
      event: 'merchantevent',
      data: {
        enableGoogleAnalytics: isGoogleAnalyticsEnabled(),
        enableFacebookAnalytics: isFacebookAnalyticsEnabled(),
        ...params,
      },
    });
  }
}
