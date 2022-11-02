import { makeAuthUrl } from 'common/makeAuthUrl';
import { processPaymentCreate } from 'payment/coproto';

const VALID_REQUEST_PAYLOAD = {
  checkout_id: true,
  contact: true,
  email: true,
  expire_at: true,
  invoice_id: true,
  order_id: true,
  status: true,
  account_id: true,
  amount: true,
  auth_link_id: true,
  currency: true,
  customer_id: true,
  description: true,
  method: true,
  name: true,
  notes: true,
  offer_id: true,
  payment_link_id: true,
  receiver_type: true,
  signature: true,
  upi: true,
  key_id: true,
};

/**
 * For QR V2 specific payment
 * may need to rethink implementation if expand for other method.
 */
type Request = {
  method: string;
  url: string;
};
type QrCode = {
  id: string;
  entity: string;
  created_at: number;
  name: any;
  usage: string;
  type: string;
  image_url: any;
  payment_amount: number;
  status: string;
  description: any;
  fixed_amount: boolean;
  payments_amount_received: number;
  payments_count_received: number;
  notes: any[];
  customer_id: any;
  close_by: number;
  image_content: string;
  tax_invoice: any[];
};
type CheckoutOrderResponse = {
  id: string;
  checkout_id: string;
  closed_at: any;
  close_reason: any;
  expire_at: number;
  invoice_id: any;
  order_id: any;
  status: string;
  qr_code: QrCode;
  request: Request;
};

export const prepareCheckoutOrderRequestPayload = (
  data: Record<string, any>
) => {
  return Object.keys(data).reduce((finalObj: Record<string, any>, key) => {
    if (
      key.startsWith('_') ||
      key.startsWith('upi') ||
      key.startsWith('notes') ||
      VALID_REQUEST_PAYLOAD[key as keyof typeof VALID_REQUEST_PAYLOAD]
    ) {
      finalObj[key] = data[key];
    }
    return finalObj;
  }, {});
};

export const processCheckoutOrder = function (
  this: any,
  response: CheckoutOrderResponse
) {
  if (!response?.qr_code?.image_content) {
    processPaymentCreate.call(this, {
      error: {
        code: 'BAD_REQUEST_ERROR',
        description: 'QR v2 not supported',
        reason: 'qr_v2_disabled',
      },
    });
    return;
  }
  const updatedResponse = convertCheckoutOrderResponseForCoproto(response);
  this.is_checkout_order = true;
  processPaymentCreate.call(this, updatedResponse);
};

/** for UPI Intent method only for now */
function convertCheckoutOrderResponseForCoproto(
  response: CheckoutOrderResponse
) {
  return {
    type: 'intent',
    method: 'upi',
    provider: null,
    version: 1,
    payment_id: response.id,
    is_checkout_order: true,
    data: {
      intent_url: response.qr_code?.image_content,
    },
    request: response.request
      ? response.request
      : {
          url: makeAuthUrl(
            `checkout/qr_code/${response.qr_code?.id}/payment/status`
          ),
          method: 'GET',
        },
  };
}
