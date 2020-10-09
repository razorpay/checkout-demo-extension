import { getSession } from 'sessionmanager';
import * as Bridge from 'bridge';
import { GOOGLE_PAY_PACKAGE_NAME, PHONE_PE_PACKAGE_NAME } from 'common/upi';
import { setUpiApps, getUPIIntentApps } from 'checkoutstore/native';
import { phonepeSupportedMethods } from 'payment/adapters';

export const appsThatSupportWebPayments = [
  GOOGLE_PAY_PACKAGE_NAME,
  PHONE_PE_PACKAGE_NAME,
];

export const supportedWebPaymentsMethodsForApp = {
  [PHONE_PE_PACKAGE_NAME]: phonepeSupportedMethods,
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
  const session = getSession();

  /* disable Web payments API for SDK as we have native intent there */
  if (Bridge.checkout.exists()) {
    return;
  }

  session.r.checkPaymentAdapter(app).then(() => {
    webPaymentsApps[app] = true;
    setUpiApps(
      _Arr.mergeWith(getUPIIntentApps().all, [
        {
          package_name: app,
        },
      ])
    );
  });
};
