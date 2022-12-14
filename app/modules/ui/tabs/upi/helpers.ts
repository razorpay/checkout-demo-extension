import { getMerchantKey, isEnableAllPSPExperimentEnabled } from 'razorpay';
import { APPS_SUPPORTING_AUTOPAY_INTENT } from 'upi/constants';
import {
  banksThatSupportRecurring,
  experimentingMerchants,
  banksForSpecificMerchants,
} from './constants';

export const getSupportedBankForUPIRecurring = () => {
  // Creating new instance to avoid the original data extension
  const banksList = [...banksThatSupportRecurring];
  const merchantKey = getMerchantKey() || '';

  /**
   * On Special Ask we are enabling some banks to specific merchants
   * This will be removed once business confirms
   */
  if (merchantKey && experimentingMerchants?.includes(merchantKey)) {
    banksList.push(...banksForSpecificMerchants);
  }
  return banksList;
};

/**
 * For recurring payments, filtering apps which support
 * autopay intents
 */
export function filterUPIIntentAppsForAutopayIntent(
  intentApps: UPI.AppConfiguration[]
) {
  if (isEnableAllPSPExperimentEnabled()) {
    return intentApps;
  }
  return intentApps.filter((app) =>
    APPS_SUPPORTING_AUTOPAY_INTENT.includes(app.package_name)
  );
}
