/* eslint-disable no-restricted-syntax */
declare const __BUILD_NUMBER__: string;

interface Window {
  Razorpay: any;
  Event: any;
  Element: any;
  CheckoutBridge: any;
  Sentry: any;
  msCrypto: any;
}

declare const global: Window;

declare var Razorpay: Window['Razorpay'];
