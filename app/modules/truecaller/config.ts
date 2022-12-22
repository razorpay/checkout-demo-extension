import type { Config } from './types';

export const DEFAULT_DEEPLINK_CONFIG: Readonly<Omit<Config, 'requestNonce'>> = {
  type: 'btmsheet',
  partnerKey: 'MMN4x1fd6bf2425fe426bb911b53abfd4ed50',
  partnerName: 'Razorpay Checkout',
  lang: 'en',
  loginPrefix: 'proceed',
  loginSuffix: 'verifymobile',
  ctaPrefix: 'getstarted',
  ctaColor: '#528FF0',
  ctaTextColor: '#ffffff',
  btnShape: 'rectangular',
  skipOption: 'useanothernum',
};
