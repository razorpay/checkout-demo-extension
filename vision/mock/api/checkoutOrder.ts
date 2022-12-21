import type { handlerType } from '../../core/types';

const defaultResponse = {
  status: 'active',
  id: 'GFZIYx6rMbP6gs',
  qr_code: {
    id: 'qr_GFZIYx6rMbP6gs',
    type: 'upi_qr',
    name: 'More megastore',
    image_content:
      'upi://pay?ver=01&mode=15&pa=rzr.qrtestaccoun27230053@icici&pn=TestAccount&tr=RZPIXnO3BgccsO35Qqrv2&tn=PaymenttoTestAccount&cu=INR&mc=1234&qrMedium=04&am=123.45', // intent_url
    usage: 'single',
    fixed_amount: true,
    payment_amount: 100,
    description: 'Fine T-Shirt',
    customer_id: 'cust_CtqVT5hl9czGsG',
    close_by: 1681615838,
    notes: {
      purpose: 'Test UPI QR code notes',
    },
    request: {
      url: 'https://api.razorpay.com/v1/checkout/qr_code/qr_GFZIYx6rMbP6gs/payment/status?key_id=rzp_live_ILgsfZCZoFIKMb',
      method: 'GET',
    },
    status: 'active',
    close_reason: 'on_demand',
    payments_count_received: 100,
    payments_amount_received: 34500,
    closed_at: null,
    created_at: 1603942055,
  },
};

const getCheckoutOrderResponse = {
  default: defaultResponse,
};

export const checkoutOrderHandler: handlerType = ({ name }) => {
  let response = getCheckoutOrderResponse[name];
  if (!response) {
    console.info(`No preference response found for context:${name}`);
    return {
      response: {},
    };
  }
  return {
    response,
  };
};

export const checkoutOrderStatusHandler: handlerType = () => {
  return {
    response: {
      status: {
        status: 'created',
      },
    },
  };
};
