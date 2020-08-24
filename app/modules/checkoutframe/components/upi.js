import { setView, destroyView } from './';
import { getSession } from 'sessionmanager';
import * as Bridge from 'bridge';
import { GOOGLE_PAY_PACKAGE_NAME } from 'common/upi';
import { setUpiApps } from 'checkoutstore/native';

import UpiTab from 'ui/tabs/upi/index.svelte';
const UPI_KEY = 'upiTab';

let googlePayWebPaymentsAvailable = false;

/**
 * Tells if Google Pay Web Payments are available
 *
 * @returns {boolean}
 */
export function isGooglePayWebPaymentsAvailable() {
  return googlePayWebPaymentsAvailable;
}

/**
 * Checks if Google Pay Web Payments are possible
 * and sets the app in the list of UPI intent apps
 * if so.
 */
export function checkGooglePayWebPayments() {
  const session = getSession();

  /* disable Web payments API for SDK as we have native intent there */
  if (Bridge.checkout.exists()) {
    return;
  }

  session.r
    .checkPaymentAdapter('gpay')
    .then(() => {
      googlePayWebPaymentsAvailable = true;

      // Google Pay is available for web payments
      setUpiApps([
        {
          package_name: GOOGLE_PAY_PACKAGE_NAME,
        },
      ]);
    })
    .catch(() => {});
}

export function render(props = {}) {
  const upiTab = new UpiTab({
    target: _Doc.querySelector('#form-fields'),
    props,
  });
  setView(UPI_KEY, upiTab);
  getSession()[UPI_KEY] = upiTab;
  upiTab.onShown();
  return upiTab;
}

export function destroy() {
  destroyView(UPI_KEY);
  getSession()[UPI_KEY] = null;
}
