import * as Bridge from 'bridge';

import {
  GOOGLE_PAY_PACKAGE_NAME,
  PHONE_PE_PACKAGE_NAME,
  CRED_PACKAGE_NAME,
} from 'common/upi';

import { checkPaymentAdapter, phonepeSupportedMethods } from 'payment/adapters';

export const appsThatSupportWebPayments = [
  { package_name: GOOGLE_PAY_PACKAGE_NAME, method: 'upi' },
  { package_name: PHONE_PE_PACKAGE_NAME, method: 'upi' },
  { package_name: CRED_PACKAGE_NAME, method: 'app' },
];

export const supportedWebPaymentsMethodsForApp = {
  [PHONE_PE_PACKAGE_NAME]: phonepeSupportedMethods,
  [CRED_PACKAGE_NAME]: 'https://cred-web-stg.dreamplug.in/checkout/pay',
};

const webPaymentsApps = {};

appsThatSupportWebPayments.forEach(app => {
  webPaymentsApps[app] = false;
});

/**
 * Tells if Web Payments are available for the app passed
 * @param app
 *
 * @returns {boolean}
 */
export function isWebPaymentsApiAvailable(app) {
  return webPaymentsApps[app];
}

export const checkWebPaymentsForApp = app => {
  /* disable Web payments API for SDK as we have native intent there */
  if (Bridge.checkout.exists()) {
    return;
  }

  return checkPaymentAdapter(app).then(() => {
    webPaymentsApps[app] = true;
  });
};
