import { getMerchantKey } from 'razorpay';
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
