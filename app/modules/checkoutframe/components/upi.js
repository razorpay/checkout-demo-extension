import { setView, destroyView } from './';
import { getSession } from 'sessionmanager';
import { GOOGLE_PAY_PACKAGE_NAME } from 'common/upi';
import {
  isWebPaymentsApiAvailable,
  checkWebPaymentsForApp,
  appsThatSupportWebPayments,
} from 'common/webPaymentsApi';

import { getUPIIntentApps, setUpiApps } from 'checkoutstore/native';

import UpiTab from 'ui/tabs/upi/index.svelte';
const UPI_KEY = 'upiTab';

/**
 * Tells if Google Pay Web Payments are available
 *
 * @returns {boolean}
 */
export function isGooglePayWebPaymentsAvailable() {
  return isWebPaymentsApiAvailable(GOOGLE_PAY_PACKAGE_NAME);
}

/**
 * Checks if Web Payments are possible
 * and sets the app in the list of UPI intent apps
 * if so.
 */
export function checkForPossibleWebPayments() {
  appsThatSupportWebPayments
    .filter(app => app.method === 'upi')
    .forEach(app => {
      checkWebPaymentsForApp(app)
        .then(() => {
          setUpiApps(
            _Arr.mergeWith(getUPIIntentApps().all, [
              {
                package_name: app,
              },
            ])
          );
        })
        .catch(_Func.noop);
    });
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
