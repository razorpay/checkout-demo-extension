import type { Preferences } from 'razorpay/types/Preferences';
import { getPreferences } from './base';

// Preference related
export const getPayoutContact = () => getPreferences('contact');
export const getMerchantMethods = () => getPreferences('methods', {}) || {};
export const getMerchantOrder = () => getPreferences('order');
export const getOrderMethod = () => getPreferences('order.method');
export const getMerchantOrderAmount = () => getPreferences('order.amount');
export const getMerchantOrderDueAmount = () =>
  getPreferences('order.amount_due');
export const getMerchantKey = () => getPreferences('merchant_key');
export const isGlobalVault = () => getPreferences('global');
export const isPartialPayment = () => getPreferences('order.partial_payment');
export const hasFeature = (feature: string, fallbackValue: boolean): boolean =>
  getPreferences(
    `features.${feature}` as unknown as keyof Preferences,
    fallbackValue
  ) as unknown as boolean;
export const getBanks = () => getPreferences('methods.netbanking');
