import type { Method } from 'types/types';
import { PHONE_PE_PACKAGE_NAME } from 'upi/constants';
import type { Personalization } from './personalization';

export const ALLOWED_METHODS_BY_DEVICE: Record<'desktop' | 'mobile', Method[]> =
  {
    desktop: ['upi', 'card', 'netbanking', 'fpx'],
    mobile: ['upi', 'card', 'fpx'],
  };

/**
 * The pivot amount basis which the methods displays different set of payment methods
 */
export const PIVOT_AMOUNT = 500000;

/**
 * Allowed methods if amount is greater than (GT) PIVOT_AMOUNT
 */
export const ALLOWED_METHODS_GT_PIVOT_AMOUNT: Method[] = [
  'upi',
  'card',
  'netbanking',
  'fpx',
];

/**
 * Allowed methods if amount is less than or equal (LTE) to PIVOT_AMOUNT
 */
export const ALLOWED_METHODS_LTE_PIVOT_AMOUNT: Method[] = [
  'upi',
  'card',
  'fpx',
];

/**
 * The default instrument P13N V2 API instrument that denotes Phonepe UPI
 */
export const DEFAULT_PHONEPE_P13N_V2_INSTRUMENT: Personalization.V2_Instrument_Raw =
  {
    method: 'upi',
    instrument: '@ybl',
  };

/**
 * The default instrument P13N V1 Storage instrument that denotes Phonepe UPI
 */
export const DEFAULT_PHONEPE_P13N_V1_INSTRUMENT: Partial<Personalization.V1_Instrument_Raw> =
  {
    '_[flow]': 'intent',
    method: 'upi',
    upi_app: PHONE_PE_PACKAGE_NAME,
  };

export const MAX_PREFERRED_METHODS = 2;
