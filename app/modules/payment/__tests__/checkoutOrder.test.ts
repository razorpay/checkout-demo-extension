import {
  processCheckoutOrder,
  prepareCheckoutOrderRequestPayload,
} from 'payment/checkoutOrder';
import { processPaymentCreate } from 'payment/coproto';
jest.mock('payment/coproto', () => ({
  processPaymentCreate: jest.fn(),
}));

const requestPayload = {
  contact: '+918888888888',
  email: 'test@razorpay.com',
  key_id: 'rzp_live_ILgsfZCZoFIKMb',
  amount: 100,
  method: 'upi',
  upi: {
    flow: 'intent',
  },
  '_[upiqr]': '1',
  '_[flow]': 'intent',
  currency: 'INR',
  description: 'Fine tshirt',
  '_[shield][fhash]': '069a7598fa5cf4d27b9aea85b73b0a46148415e4',
  '_[device_id]':
    '1.55b11706d57c79b7ad91b2961094564175b9e05f.1666266349529.55923087',
  '_[shield][tz]': 330,
  '_[build]': 3323243946,
  '_[checkout_id]': 'KaGJwnOd6WtvA8',
  '_[request_index]': 0,
};

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
  test('#processCheckoutOrder success response during request key is missing from QRResponse', () => {
    const context = {};
    delete (sampleQRResponse as any).request;
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
      request: {
        method: 'GET',
        url: 'https://api.razorpay.com/v1/checkout/qr_code/qr_KMoQ0LP7jw2g0c/payment/status',
      },
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

  test('Checkout order request payload', () => {
    expect(prepareCheckoutOrderRequestPayload(requestPayload)).toMatchObject(
      requestPayload
    );

    expect(
      prepareCheckoutOrderRequestPayload({ ...requestPayload, bank: 'HDFC' })
    ).toMatchObject(requestPayload);

    expect(
      prepareCheckoutOrderRequestPayload({
        ...requestPayload,
        someOtherDummyParameter: 'DummyValue',
      })
    ).toMatchObject(requestPayload);
  });
});
