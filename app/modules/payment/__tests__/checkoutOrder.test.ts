import { processCheckoutOrder } from 'payment/checkoutOrder';
import { processPaymentCreate } from 'payment/coproto';
jest.mock('payment/coproto', () => ({
  processPaymentCreate: jest.fn(),
}));

const sampleQRResponse = {
  id: 'KMoPzBSBhHWNuN',
  checkout_id: 'KMoPpsVGJyDHTx',
  closed_at: null,
  close_reason: null,
  expire_at: 1664257890,
  invoice_id: null,
  order_id: null,
  status: 'active',
  qr_code: {
    id: 'qr_KMoQ0LP7jw2g0c',
    entity: 'qr_code',
    created_at: 1664257171,
    name: null,
    usage: 'single_use',
    type: 'upi_qr',
    image_url: null,
    payment_amount: 100000,
    status: 'active',
    description: null,
    fixed_amount: true,
    payments_amount_received: 0,
    payments_count_received: 0,
    notes: [],
    customer_id: null,
    close_by: 1664257890,
    image_content:
      'upi://pay?ver=01&mode=15&pa=rpy.qrdemo02908740047603@icici&pn=demo&tr=RZPKMoQ0LP7jw2g0cqrv2&tn=Paymenttodemo&cu=INR&mc=5817&qrMedium=04&am=1000',
    tax_invoice: [],
  },
  request: {
    method: 'GET',
    url: 'https://api-web-saikiran.dev.razorpay.in/v1/checkout/qr_code/qr_KMoQ0LP7jw2g0c/payment/status?key_id=rzp_test_XOL9PxU6MA8KeJ',
  },
};

describe('Checkout Order Utils', () => {
  test('#processCheckoutOrder success response', () => {
    const context = {};
    processCheckoutOrder.call(context, sampleQRResponse);
    expect(processPaymentCreate).toHaveBeenCalledTimes(1);
    expect(processPaymentCreate).toHaveBeenCalledWith({
      data: {
        intent_url: sampleQRResponse.qr_code.image_content,
      },
      is_checkout_order: true,
      method: 'upi',
      payment_id: sampleQRResponse.id,
      provider: null,
      request: sampleQRResponse.request,
      type: 'intent',
      version: 1,
    });
  });
  test('#processCheckoutOrder failure response', () => {
    const context = {};
    processCheckoutOrder.call(context, {} as any);
    expect(processPaymentCreate).toHaveBeenCalledTimes(1);
    expect(processPaymentCreate).toHaveBeenCalledWith({
      error: {
        code: 'BAD_REQUEST_ERROR',
        description: 'QR v2 not supported',
        reason: 'qr_v2_disabled',
      },
    });
  });
});
