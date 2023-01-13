import { PAYMENT_ENTITIES } from '../constant';
import { getOption, getPreferences } from './base';
import { getMerchantOrder } from './preferences';
import { isSubscription } from './recurring';

let LAZY_ORDER_ID: string; // this stores the lazily created order id both magic shopify flow and wooc flow

export const setLazyOrderId = (orderId: string) => {
  LAZY_ORDER_ID = orderId;
  window.Razorpay.sendMessage({
    event: 'event',
    data: {
      event: 'shopify.order',
      data: { order_id: orderId },
    },
  });
};

/**
 * order related
 * // set orderid as it is required while creating payments
 * // if invoice then pick order Id from preference else from option
 */
export const getOrderId = () =>
  getPreferences('invoice.order_id') || getOption('order_id') || LAZY_ORDER_ID;

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
