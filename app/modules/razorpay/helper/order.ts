import { PAYMENT_ENTITIES } from '../constant';
import { getOption, getPreferences } from './base';
import { getMerchantOrder } from './preferences';
import { isSubscription } from './recurring';

let SHOPIFY_ORDER_ID: string; // this stores the lazily created order id in magic shopify flow

export const setShopifyOrderId = (orderId: string) =>
  (SHOPIFY_ORDER_ID = orderId);

/**
 * order related
 * // set orderid as it is required while creating payments
 * // if invoice then pick order Id from preference else from option
 */
export const getOrderId = () =>
  SHOPIFY_ORDER_ID ||
  getPreferences('invoice.order_id') ||
  getOption('order_id');

export const isInvoicePayment = () => !!getPreferences('invoice');

/**
 * Determines the payment entity used in current checkout
 * @returns {PAYMENT_ENTITIES|null}
 */
export const getPaymentEntity = () => {
  if (isInvoicePayment()) {
    return PAYMENT_ENTITIES.INVOICE;
  }
  if (isSubscription()) {
    return PAYMENT_ENTITIES.SUBSCRIPTION;
  }
  if (getMerchantOrder()) {
    return PAYMENT_ENTITIES.ORDER;
  }
  return null;
};
