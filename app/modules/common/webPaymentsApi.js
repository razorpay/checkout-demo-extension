import * as Bridge from 'bridge';

import {
  GOOGLE_PAY_PACKAGE_NAME,
  PHONE_PE_PACKAGE_NAME,
  CRED_PACKAGE_NAME,
  BHIM_UPI_PACKAGE_NAME,
  PAYTM_PACKAGE_NAME,
} from 'common/upi';
import RazorpayStore from 'razorpay';

export const appsThatSupportWebPayments = [
  { package_name: GOOGLE_PAY_PACKAGE_NAME, method: 'upi' },
  { package_name: PHONE_PE_PACKAGE_NAME, method: 'upi' },
  { package_name: CRED_PACKAGE_NAME, method: 'app' },
];

export function additionalSupportedPaymentApps() {
  appsThatSupportWebPayments.push({ package_name: BHIM_UPI_PACKAGE_NAME, method: 'upi' }, { package_name: PAYTM_PACKAGE_NAME, method: 'upi' })
}

const webPaymentsApps = {};

appsThatSupportWebPayments.forEach((app) => {
  webPaymentsApps[app.package_name] = false;
});

/**
 * Tells if Web Payments are available for the app passed
 * @param {string} app package name of the application and sometimes the
 * Note: this method has to be tested in "https" route and local dev results in false all-time
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

/**
 *
 * @param {string} app package name of the application
 * @returns
 */
export const checkWebPaymentsForApp = (app) => {
  /* disable Web payments API for SDK as we have native intent there */
  if (Bridge.checkout.exists()) {
    return Promise.resolve(false);
  }

  const razorpayInstance = RazorpayStore.get();

  return razorpayInstance.checkPaymentAdapter(app).then(() => {
    webPaymentsApps[app] = true;
  });
};

/**
 * Returns a (key, value) pair for apps where:
 * key -> package name of app that has an adapter available
 * value -> is the flow possible (true | false)? (after getting result from adapter)
 * @returns {object}
 */
export const getAllWebPaymentApps = () => {
  return webPaymentsApps;
};
