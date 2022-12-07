import {
  setFlowInPayload,
  processSessionData,
  googlePayRequestProcessor,
  generateRequestParamsForPayment,
  creatUPIPaymentV2,
} from 'upi/payment/prePaymentHandlers';
import { getSession } from 'sessionmanager';
import { processInstrument } from 'checkoutframe/personalization';
import { isGpayMergedFlowEnabled } from 'checkoutstore/methods';
import { getPreferences, getOption } from 'razorpay';
import { reward } from 'checkoutstore/rewards';

jest.mock('sessionmanager', () => ({
  __esModule: true,
  getSession: jest.fn(),
}));

jest.mock('checkoutstore/methods', () => ({
  __esModule: true,
  isGpayMergedFlowEnabled: jest.fn(() => true),
}));

jest.mock('checkoutframe/personalization', () => ({
  __esModule: true,
  processInstrument: jest.fn(),
}));

jest.mock('razorpay', () => ({
  get: jest.fn(),
  isEmailOptional: jest.fn(() => false),
  getOption: jest.fn((key) => {
    if (key === 'force_terminal_id') {
      return 'term_KA93GhgQ300qtS';
    }
  }),
  getOptionalObject: jest.fn(() => ({
    contact: false,
    email: false,
  })),
  getPreferences: jest.fn((key) => {
    if (key === 'fee_bearer') {
      return true;
    } else if (key === 'order.bank') {
      return 'HDFC';
    }
  }),
}));

describe('Test setFlowInPayload', () => {
  test('should return undefined if we are not passed any data to setFlowInPayload', () => {
    // @ts-ignore
    expect(setFlowInPayload()).toBe(undefined);
  });
  test('should return paylod for UPI intent flow', () => {
    const data = {
      upi_provider: 'google_pay',
      vpa: '9952398501@ybl',
      upi: {
        vpa: '9952398501@ybl',
      },
      token: 'token_KiFoudKTPqzKmw',
    };
    setFlowInPayload(data, 'intent');
    expect(data).toMatchObject({
      upi: { flow: 'intent' },
      '_[flow]': 'intent',
    });
  });
  test('should return paylod for UPI QR flow', () => {
    const data = {};
    setFlowInPayload(data, 'qr');
    expect(data).toMatchObject({
      upi: { flow: 'intent' },
      '_[flow]': 'intent',
      '_[upiqr]': '1',
    });
  });
  test('should return paylod for UPI collect(VPA) flow', () => {
    const data = {};
    setFlowInPayload(data, 'collect', '9952345345@ybl');
    expect(data).toMatchObject({
      upi: { flow: 'collect' },
      '_[flow]': 'directpay',
      vpa: '9952345345@ybl',
    });
  });
});

describe('Test processSessionData', () => {
  test('should return undefined if we are not passed any data to processSessionData', () => {
    // @ts-ignore
    expect(processSessionData()).toBe(undefined);
  });
  test('should return data from processSessionData when UPI offer is applied', () => {
    const data = {};
    (getSession as any).mockReturnValue({
      getAppliedOffer: jest.fn(() => ({ payment_method: 'upi', id: '1234' })),
    });
    // @ts-ignore
    expect(processSessionData(data)).toBe(undefined);
    expect(processInstrument).toHaveBeenCalledTimes(1);
    expect(data).toMatchObject({
      offer_id: '1234',
    });
  });
});

describe('Test googlePayRequestProcessor', () => {
  test('should return request data for googlePayWrapperVersion - 1', () => {
    const data = {
      method: 'upi',
      upi_app: 'com.google.android.apps.nbu.paisa.user',
      upi: {
        flow: 'intent',
      },
    };
    const params = {
      feesRedirect: false,
      external: {},
      optional: {
        contact: false,
        email: false,
      },
      additionalInfo: {
        config: {
          action: 'deepLinkIntent',
          app: {
            app_name: 'Google Pay',
            package_name: 'com.google.android.apps.nbu.paisa.user',
            app_icon: 'https://cdn.razorpay.com/app/googlepay.svg',
            handles: ['okhdfcbank', 'okicici', 'okaxis', 'oksbi'],
            verify_registration: true,
            shortcode: 'google_pay',
          },
        },
        referrer: 'UPI_UX',
      },
    };
    (getSession as any).mockReturnValue({
      hasGooglePaySdk: true,
      googlePayWrapperVersion: '1',
    });
    googlePayRequestProcessor(
      data as UPI.UPIPaymentPayload,
      params as Payment.PaymentParams
    );
    expect(data).toMatchObject({
      method: 'upi',
      upi_app: 'com.google.android.apps.nbu.paisa.user',
      upi: {
        flow: 'intent',
      },
    });
    expect(isGpayMergedFlowEnabled).toHaveBeenCalledTimes(1);
  });
  test('should return request data for googlePayWrapperVersion - 2', () => {
    const data = {
      method: 'upi',
      upi_app: 'com.google.android.apps.nbu.paisa.user',
      upi: {
        flow: 'intent',
      },
    };
    const params = {
      feesRedirect: false,
      external: {},
      optional: {
        contact: false,
        email: false,
      },
      additionalInfo: {
        config: {
          action: 'deepLinkIntent',
          app: {
            app_name: 'Google Pay',
            package_name: 'com.google.android.apps.nbu.paisa.user',
            app_icon: 'https://cdn.razorpay.com/app/googlepay.svg',
            handles: ['okhdfcbank', 'okicici', 'okaxis', 'oksbi'],
            verify_registration: true,
            shortcode: 'google_pay',
          },
        },
        referrer: 'UPI_UX',
      },
    };
    (getSession as any).mockReturnValue({
      hasGooglePaySdk: true,
      googlePayWrapperVersion: '2',
    });
    googlePayRequestProcessor(
      data as UPI.UPIPaymentPayload,
      params as Payment.PaymentParams
    );
    expect(data).toMatchObject({
      method: 'app',
      provider: 'google_pay',
    });
    expect(params.external).toMatchObject({
      gpay: true,
    });
    expect(isGpayMergedFlowEnabled).toHaveBeenCalledTimes(1);
  });
});

describe('Test generateRequestParamsForPayment', () => {
  test('should generate request params for Payment', () => {
    const payload = {
      contact: '+919952398401',
      email: 'abisheksrv@gmail.com',
      amount: 100,
    };
    (getSession as any).mockReturnValue({
      get: jest.fn(() => ({ paused: true })),
      googlePayWrapperVersion: '1',
    });
    expect(generateRequestParamsForPayment(payload)).toMatchObject({
      feesRedirect: true,
      external: {},
      optional: {
        contact: false,
        email: false,
      },
      paused: true,
    });
  });
  test('should generate request params for Payment when QR is enabled', () => {
    const payload = {
      contact: '+919952398401',
      email: 'abisheksrv@gmail.com',
      amount: 100,
      '_[upiqr]': '1',
    };
    (getSession as any).mockReturnValue({
      get: jest.fn(() => ({ paused: true })),
      googlePayWrapperVersion: '1',
    });
    expect(
      generateRequestParamsForPayment(payload as Partial<UPI.UPIPaymentPayload>)
    ).toMatchObject({
      feesRedirect: true,
      external: {},
      optional: {
        contact: false,
        email: false,
      },
      paused: true,
      upiqr: true,
    });
  });
});

describe('Test creatUPIPaymentV2', () => {
  test('should create UPI payment for UPIV2', () => {
    const payload = {
      contact: '+919952398401',
      email: 'abisheksrv@gmail.com',
      amount: 100,
      upi_app: 'com.google.android.apps.nbu.paisa.user',
      fee: 100,
    };

    (getSession as any).mockReturnValue({
      get: jest.fn(() => ({ paused: true })),
      getAppliedOffer: jest.fn(() => ({ payment_method: 'upi', id: '1234' })),
    });

    const additionalInfo = {
      referrer: 'UPI_UX',
      config: {
        action: 'intent',
      },
    };
    reward.set({
      reward_id: '1234',
    });
    creatUPIPaymentV2(
      payload,
      additionalInfo as Payment.PaymentParams['additionalInfo']
    );
    expect(getPreferences).toHaveBeenCalledTimes(2);
    expect(getPreferences).toHaveBeenCalledWith('fee_bearer');
    expect(getPreferences).toHaveBeenCalledWith('order.bank');
    expect(getOption).toHaveBeenCalledTimes(2);
    expect(getOption).toHaveBeenCalledWith('force_terminal_id');
  });
});
