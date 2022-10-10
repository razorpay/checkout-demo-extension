import { makeAuthUrl } from 'common/helper';
import { processPaymentCreate } from 'payment/coproto';

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
            null,
            `checkout/qr_code/${response.qr_code?.id}/payment/status`
          ),
          method: 'GET',
        },
  };
}
