import type { Config } from './types';
import { IS_PROD } from '../common/constants';

export const DEFAULT_DEEPLINK_CONFIG: Readonly<Omit<Config, 'requestNonce'>> = {
  type: 'btmsheet',
  partnerKey: IS_PROD
    ? 'BwwcFdf4727abe5e5441c81444ffc76764717'
    : '2riKF978ac637445b4413baf87ab088732d0d',
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
