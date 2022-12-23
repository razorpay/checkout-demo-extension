import { get } from '../../app/modules/utils/object';
import type { Context } from '../core/types';

export function getPreferences(context: Context, path: string) {
  const preference = context.apiResponse?.preferences;
  return get(preference || {}, path);
}

export function getOption(context: Context, path: string) {
  const options = context.options || {};
  return get(options || {}, path);
}

export function isIndianCurrency(context: Context) {
  const merchantBaseCurrency =
    getPreferences(context, 'merchant_currency') || 'INR';
  // if option currency is INR
  // or if option currency is not defined then we pick merchant base currency
  return (
    getOption(context, 'currency') === 'INR' ||
    (!getOption(context, 'currency') && merchantBaseCurrency === 'INR')
  );
}

export const hasCart = (context: Context) =>
  getOption(context, 'cart') && getOption(context, 'shopify_cart');

// Returns true if one_click_checkout is enabled on BE, passed in option and checkout is initialised using order
export const isOneClickCheckout = (context: Context) =>
  Boolean(
    (getPreferences(context, 'order.line_items_total') || hasCart(context)) &&
      getPreferences(context, 'features.one_click_checkout')
  );
