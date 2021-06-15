import * as Bridge from 'bridge';

import {
  GOOGLE_PAY_PACKAGE_NAME,
  PHONE_PE_PACKAGE_NAME,
  CRED_PACKAGE_NAME,
} from 'common/upi';

import { getSession } from 'sessionmanager';

export const appsThatSupportWebPayments = [
  { package_name: GOOGLE_PAY_PACKAGE_NAME, method: 'upi' },
  { package_name: PHONE_PE_PACKAGE_NAME, method: 'upi' },
  { package_name: CRED_PACKAGE_NAME, method: 'app' },
];

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
  // BE sends cred as provider, which needs to be checked here
  if (app === 'cred') {
    app = CRED_PACKAGE_NAME;
  }
  return webPaymentsApps[app];
}

export const checkWebPaymentsForApp = app => {
  const session = getSession();
  /* disable Web payments API for SDK as we have native intent there */
  if (Bridge.checkout.exists()) {
    return Promise.resolve(false);
  }

  return session.r.checkPaymentAdapter(app).then(() => {
    webPaymentsApps[app] = true;
  });
};
