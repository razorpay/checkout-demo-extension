import { getMerchantKey } from 'checkoutstore';
import { clearTaxMerchantKey } from './constants';

//| HTMLElement['dir'] is a string (which is an error hence using actual types)
type HTMLInputElementDir = 'ltr' | 'rtl' | 'auto';

export const getDirectionForField = (): HTMLInputElementDir => {
  if (getMerchantKey() === clearTaxMerchantKey) {
    return 'ltr';
  }
  return 'auto';
};
