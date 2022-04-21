import { setView, destroyView } from './';
import { returnAsIs } from 'lib/utils';
import Analytics from 'analytics';

import { getSession } from 'sessionmanager';
import { GOOGLE_PAY_PACKAGE_NAME } from 'upi/constants';
import {
  isWebPaymentsApiAvailable,
  checkWebPaymentsForApp,
  appsThatSupportWebPayments,
} from 'common/webPaymentsApi';

import { getUPIIntentApps, setUpiApps } from 'checkoutstore/native';

import UpiTab from 'ui/tabs/upi/index.svelte';
import { querySelector } from 'utils/doc';
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
export function checkForPossibleWebPaymentsForUpi() {
  appsThatSupportWebPayments
    .filter((app) => app.method === 'upi')
    .forEach((app) => {
      checkWebPaymentsForApp(app.package_name)
        .then((status) => {
          if (status === false) {
            return;
          }
          setUpiApps([
            ...getUPIIntentApps().all,
            {
              package_name: app.package_name,
            },
          ]);
          Analytics.setMeta('upi.intent_on_mweb', true);
        })
        .catch(returnAsIs);
    });
}

export function render(props = {}) {
  const upiTab = new UpiTab({
    target: querySelector('#form-fields'),
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
