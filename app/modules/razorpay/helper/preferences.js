import { getPreferences } from './base';

// Preference related
export const getPayoutContact = () => getPreferences('contact');
export const getMerchantMethods = () => getPreferences('methods', {});
export const getMerchantOrder = () => getPreferences('order');
export const getOrderMethod = () => getPreferences('order.method');
export const getMerchantOrderAmount = () => getPreferences('order.amount');
export const getMerchantOrderDueAmount = () =>
  getPreferences('order.amount_due');
export const getMerchantKey = () => getPreferences('merchant_key');
export const isGlobalVault = () => getPreferences('global');
export const isPartialPayment = () => getPreferences('order.partial_payment');
export const hasFeature = (feature, fallbackValue) =>
  getPreferences(`features.${feature}`, fallbackValue);
export const getBanks = () => getPreferences('methods.netbanking');
