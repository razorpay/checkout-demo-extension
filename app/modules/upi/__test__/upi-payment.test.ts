import { handleUPIPayments } from 'upi/payment/payment';
import {
  setFlowInPayload,
  creatUPIPaymentV2,
} from 'upi/payment/prePaymentHandlers';
import { resetCallbackOnUPIAppForPay } from 'upi/helper/upi';
import { adoptSessionUI } from 'upi/payment/postPayment/adoptSessionUI';
import { reusePaymentIdExperimentEnabled } from 'razorpay';
import { clearPaymentRequest } from 'upi/payment/postPayment/postPaymentHandlers';
import { trackTrace, TRACES } from 'upi/events';
import { handleFeeBearer } from 'upi/helper/fee-bearer';

const payload = {
  contact: '+919952398401',
  email: 'abisheksrv@gmail.com',
  amount: 100,
};

const razorpayInstance = {
  createPayment: () => {
    return razorpayInstance;
  },
  on: () => {
    return razorpayInstance;
  },
};

jest.mock('upi/helper/fee-bearer', () => ({
  __esModule: true,
  handleFeeBearer: jest.fn(),
}));

jest.mock('sessionmanager', () => ({
  __esModule: true,
  getSession: jest.fn(() => ({
    r: {
      _payment: true,
    },
    getPayload: jest.fn(() => payload),
  })),
}));

jest.mock('upi/events', () => ({
  __esModule: true,
  trackTrace: jest.fn(),
  TRACES: {
    FEE_MODAL_WAITING_FOR_USER: 'FEE_MODAL_WAITING_FOR_USER',
  },
}));

jest.mock('upi/payment/postPayment/postPaymentHandlers', () => ({
  __esModule: true,
  responseHandler: jest.fn(),
  clearPaymentRequest: jest.fn(),
}));

jest.mock('upi/payment/prePaymentHandlers', () => ({
  __esModule: true,
  setFlowInPayload: jest.fn((data, action) => {
    data.upi = {
      flow: action,
    };
    if (action === 'intent') {
      data['_[flow]'] = 'intent';
    } else if (action === 'qr') {
      data['_[upiqr]'] = '1';
      delete data.save;
      data['_[flow]'] = 'intent';
      data.upi = {
        flow: 'intent',
      };
    }
  }),
  creatUPIPaymentV2: jest.fn(),
}));

jest.mock('razorpay', () => ({
  get: jest.fn(),
  getAmount: jest.fn(() => 100),
  getCurrency: jest.fn(() => 'INR'),
  isOneClickCheckout: jest.fn(),
  reusePaymentIdExperimentEnabled: jest.fn(() => true),
  razorpayInstance: {
    createPayment: function () {
      return this;
    },
    on: function () {
      return this;
    },
  },
}));

jest.mock('upi/helper/upi', () => ({
  __esModule: true,
  resetCallbackOnUPIAppForPay: jest.fn(),
}));

jest.mock('upi/payment/postPayment/adoptSessionUI', () => ({
  __esModule: true,
  adoptSessionUI: jest.fn(),
}));

describe('Test handleUPIPayments', () => {
  test('Test handleUPIPayments for QR flow', () => {
    const config = {
      action: 'none',
      qrFlow: {
        qrv2: true,
        onPaymentCreate: jest.fn(),
      },
    };
    const basePayload = {
      ...payload,
      method: 'upi',
      upi: {
        flow: 'intent',
      },
      '_[flow]': 'intent',
      '_[upiqr]': '1',
      '_[checkout_order]': '1',
    };
    (creatUPIPaymentV2 as any).mockReturnValue({
      paymentPayload: {
        ...payload,
        method: 'upi',
        upi: {
          flow: 'intent',
        },
        '_[upiqr]': '1',
        '_[flow]': 'intent',
      },
      paymentParams: {
        feesRedirect: false,
        external: {},
        optional: {
          contact: false,
          email: false,
        },
        upiqr: true,
        additionalInfo: {
          config,
          referrer: 'QR_V2',
        },
      },
    });

    handleUPIPayments(config as UPI.PaymentProcessConfiguration);
    expect(setFlowInPayload).toHaveBeenCalledTimes(1);
    expect(setFlowInPayload).toHaveBeenCalledWith(basePayload, 'qr');
    expect(creatUPIPaymentV2).toHaveBeenCalledTimes(1);
    expect(creatUPIPaymentV2).toHaveBeenCalledWith(basePayload, {
      config,
      referrer: 'QR_V2',
    });
    expect(resetCallbackOnUPIAppForPay).toHaveBeenCalledTimes(1);
    expect(adoptSessionUI).toHaveBeenCalledTimes(1);
  });
  test('Test handleUPIPayments for deeplink intent flow', () => {
    const config = {
      action: 'deepLinkIntent',
      app: {
        app_name: 'Google Pay',
        package_name: 'com.google.android.apps.nbu.paisa.user',
        app_icon: 'https://cdn.razorpay.com/app/googlepay.svg',
        handles: ['okhdfcbank', 'okicici', 'okaxis', 'oksbi'],
        verify_registration: true,
        shortcode: 'google_pay',
      },
    };
    const basePayload = {
      ...payload,
      method: 'upi',
      persistentMode: true,
      upi: {
        flow: 'intent',
      },
      '_[flow]': 'intent',
    };
    (creatUPIPaymentV2 as any).mockReturnValue({
      paymentPayload: {
        ...payload,
        method: 'upi',
        upi: {
          flow: 'intent',
        },
        '_[flow]': 'intent',
      },
      paymentParams: {
        feesRedirect: false,
        external: {},
        optional: {
          contact: false,
          email: false,
        },
        upiqr: true,
        additionalInfo: {
          config,
          referrer: 'UPI_UX',
        },
      },
    });
    handleUPIPayments(config as UPI.PaymentProcessConfiguration);
    expect(setFlowInPayload).toHaveBeenCalledTimes(1);
    expect(setFlowInPayload).toHaveBeenCalledWith(basePayload, 'intent');
    expect(reusePaymentIdExperimentEnabled).toHaveBeenCalledTimes(1);
    expect(clearPaymentRequest).toHaveBeenCalledTimes(1);
    expect(clearPaymentRequest).toHaveBeenCalledWith(
      'clear persistent payment',
      true
    );
    expect(creatUPIPaymentV2).toHaveBeenCalledTimes(1);
    expect(creatUPIPaymentV2).toHaveBeenCalledWith(basePayload, {
      config,
      referrer: 'UPI_UX',
    });
    expect(resetCallbackOnUPIAppForPay).toHaveBeenCalledTimes(1);
    expect(adoptSessionUI).toHaveBeenCalledTimes(1);
  });
  test('Test handleUPIPayments for native intent flow', () => {
    const config = {
      action: 'nativeIntent',
      app: {
        app_name: 'Google Pay',
        package_name: 'com.google.android.apps.nbu.paisa.user',
        app_icon: 'https://cdn.razorpay.com/app/googlepay.svg',
        handles: ['okhdfcbank', 'okicici', 'okaxis', 'oksbi'],
        verify_registration: true,
        shortcode: 'google_pay',
      },
    };
    const basePayload = {
      ...payload,
      method: 'upi',
      upi_app: config.app.package_name,
      upi: {
        flow: 'intent',
      },
      '_[flow]': 'intent',
    };
    (creatUPIPaymentV2 as any).mockReturnValue({
      paymentPayload: {
        ...payload,
        method: 'upi',
        upi: {
          flow: 'intent',
        },
        '_[flow]': 'intent',
      },
      paymentParams: {
        feesRedirect: false,
        external: {
          gpay: true,
        },
        optional: {
          contact: false,
          email: false,
        },
        upiqr: true,
        additionalInfo: {
          config,
          referrer: 'UPI_UX',
        },
      },
    });
    handleUPIPayments(config as UPI.PaymentProcessConfiguration);
    expect(setFlowInPayload).toHaveBeenCalledTimes(1);
    expect(setFlowInPayload).toHaveBeenCalledWith(basePayload, 'intent');
    expect(creatUPIPaymentV2).toHaveBeenCalledTimes(1);
    expect(creatUPIPaymentV2).toHaveBeenCalledWith(basePayload, {
      config,
      referrer: 'UPI_UX',
    });
    expect(resetCallbackOnUPIAppForPay).toHaveBeenCalledTimes(1);
    expect(adoptSessionUI).toHaveBeenCalledTimes(1);
  });
  test('Test handleUPIPayments for paymentRequestAPI intent flow', () => {
    const config = {
      action: 'paymentRequestAPI',
      app: {
        app_name: 'Google Pay',
        package_name: 'com.google.android.apps.nbu.paisa.user',
        app_icon: 'https://cdn.razorpay.com/app/googlepay.svg',
        handles: ['okhdfcbank', 'okicici', 'okaxis', 'oksbi'],
        verify_registration: true,
        shortcode: 'google_pay',
      },
    };
    const basePayload = {
      ...payload,
      method: 'upi',
      persistentMode: true,
      upi_app: config.app.package_name,
      upi: {
        flow: 'intent',
      },
      '_[flow]': 'intent',
    };
    (creatUPIPaymentV2 as any).mockReturnValue({
      paymentPayload: {
        ...payload,
        method: 'upi',
        upi: {
          flow: 'intent',
        },
        '_[flow]': 'intent',
      },
      paymentParams: {
        feesRedirect: true,
        external: {},
        optional: {
          contact: false,
          email: false,
        },
        upiqr: true,
        additionalInfo: {
          config,
          referrer: 'UPI_UX',
        },
      },
    });
    handleUPIPayments(config as UPI.PaymentProcessConfiguration);
    expect(setFlowInPayload).toHaveBeenCalledTimes(1);
    expect(setFlowInPayload).toHaveBeenCalledWith(basePayload, 'intent');
    expect(reusePaymentIdExperimentEnabled).toHaveBeenCalledTimes(1);
    expect(creatUPIPaymentV2).toHaveBeenCalledTimes(1);
    expect(creatUPIPaymentV2).toHaveBeenCalledWith(basePayload, {
      config,
      referrer: 'UPI_UX',
    });
    expect(trackTrace).toHaveBeenCalledTimes(1);
    expect(trackTrace).toHaveBeenCalledWith(TRACES.FEE_MODAL_WAITING_FOR_USER);
    expect(handleFeeBearer).toHaveBeenCalledTimes(1);
  });
});
