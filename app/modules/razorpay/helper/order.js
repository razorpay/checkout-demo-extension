import { PAYMENT_ENTITIES } from '../constant';
import { getOption, getPreferences } from './base';
import { getMerchantOrder } from './preferences';
import { isSubscription } from './recurring';

/**
 * order related
 * // set orderid as it is required while creating payments
 * // if invoice then pick order Id from preference else from option
 */
export const getOrderId = () =>
  getPreferences('invoice.order_id') || getOption('order_id');

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
