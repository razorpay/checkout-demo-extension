import Analytics from 'analytics';
import { getPrefilledEmail } from 'checkoutframe/customer';
import {
  isTruecallerLoginEnabled,
  setCustomer,
  triggerTruecallerIntent,
  TRUECALLER_VARIANT_NAMES,
} from 'truecaller';
import { META_KEYS } from 'truecaller/analytics/events';
import {
  setDefaultSelectedAddress,
  setSavedAddresses,
} from './address/sessionInterface';

export function initTruecaller() {
  const truecallerEnabled = isTruecallerLoginEnabled(
    TRUECALLER_VARIANT_NAMES.contact_screen
  ).status;
  return new Promise((resolve, reject) => {
    // Here is the truecaller integration
    if (truecallerEnabled) {
      triggerTruecallerIntent({}, TRUECALLER_VARIANT_NAMES.contact_screen)
        .then((res) => {
          Analytics.setMeta(META_KEYS.LOGIN_SCREEN_SOURCE, 'summary_screen');
          getPrefilledEmail()
            ? setCustomer({
                ...res,
                email: getPrefilledEmail(),
              })
            : setCustomer(res);

          setSavedAddresses(res.addresses);
          setDefaultSelectedAddress();
          resolve(true);
        })
        .catch((e) => {
          reject(e);
        });
    } else {
      resolve(true);
    }
  });
}
