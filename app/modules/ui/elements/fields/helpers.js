import { getMerchantKey } from 'razorpay';
import { clearTaxMerchantKey } from './constants';

// //| HTMLElement['dir'] is a string (which is an error hence using actual types)
// type HTMLInputElementDir = 'ltr' | 'rtl' | 'auto';

export const getDirectionForField = () => {
  if (getMerchantKey() === clearTaxMerchantKey) {
    return 'ltr';
  }
  return 'auto';
};
