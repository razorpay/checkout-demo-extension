import { get } from 'svelte/store';
import {
  qrState,
  QrStateType,
  initialState as qrInitialState,
  resetQRState,
} from 'upi/ui/components/QR/store';
import {
  isQRPaymentActive,
  getQRImage,
  clearActiveQRPayment,
  isQRPaymentCancellable,
  QRPaymentCancelStatus,
} from 'upi/helper/qr';
import { clearPaymentRequest } from 'upi/payment/postPayment/postPaymentHandlers';
import {
  updateRenderQrState,
  qrRenderState,
  QrRenderState,
} from 'upi/ui/components/QRWrapper/store';
import { PAYMENT_CANCEL_REASONS } from 'common/constants';

jest.mock('sessionmanager', () => ({
  __esModule: true,
  getSession: jest.fn(() => ({
    r: {
      get: jest.fn(),
      emit: jest.fn(),
    },
  })),
}));

jest.mock('upi/ui/components/QR/store', () => ({
  ...jest.requireActual('upi/ui/components/QR/store'),
  __esModule: true,
  resetQRState: jest.fn(),
}));

jest.mock('upi/payment/postPayment/postPaymentHandlers', () => ({
  __esModule: true,
  clearPaymentRequest: jest.fn(),
}));

const qrActiveState = {
  status: 'qr',
  url: 'upi://pay?pa=razorpay@icici&pn=Razorpay&tr=EZV2022120710545672495079&tn=RazorpayJEEMainAdvanced&am=10000&cu=INR&mc=8931',
  autoGenerate: true,
  manualRefresh: true,
  renderTimer: true,
};

describe('Test isQRPaymentActive', () => {
  test('should return false for QR initial state', () => {
    qrState.set(qrInitialState as QrStateType);
    expect(isQRPaymentActive()).toBe(false);
  });
  test('should return true for QR active state', () => {
    qrState.set(qrActiveState as QrStateType);
    expect(isQRPaymentActive()).toBe(true);
  });
});
describe('Test getQRImage', () => {
  beforeEach(() => {
    jest.mock('upi/helper/qr', () => ({
      ...jest.requireActual('upi/ui/components/QR/store'),
      __esModule: true,
      getQRPaymentTestUrlForImage: jest.fn(
        () =>
          'upi://pay?pa=razorpay.pg@hdfcbank&pn=Razorpay&tr=M10rKVfkNww2eBE&am=10000&cu=INR&mc=5411&tn=RazorpayJEEMain&Advanced'
      ),
    }));
  });
  test('should return preparedURL for QR Image', () => {
    const URL =
      'upi://pay?pa=razorpay@icici&pn=Razorpay&tr=EZV2022120711172072573816&tn=RazorpayJEEMainAdvanced&am=10000&cu=INR&mc=8931';
    const imageSize = 141;
    const preparedURL =
      'https://chart.googleapis.com/chart?chs=141x141&cht=qr&chl=upi%3A%2F%2Fpay%3Fpa%3Drazorpay%40icici%26pn%3DRazorpay%26tr%3DEZV2022120711172072573816%26tn%3DRazorpayJEEMainAdvanced%26am%3D10000%26cu%3DINR%26mc%3D8931&choe=UTF-8&chld=L|0';
    expect(getQRImage(URL, imageSize)).toBe(preparedURL);
  });
  test('should return preparedURL for QR Image with default image size', () => {
    const URL =
      'upi://pay?pa=razorpay@icici&pn=Razorpay&tr=EZV2022120711172072573816&tn=RazorpayJEEMainAdvanced&am=10000&cu=INR&mc=8931';
    const preparedURL =
      'https://chart.googleapis.com/chart?chs=141x141&cht=qr&chl=upi%3A%2F%2Fpay%3Fpa%3Drazorpay%40icici%26pn%3DRazorpay%26tr%3DEZV2022120711172072573816%26tn%3DRazorpayJEEMainAdvanced%26am%3D10000%26cu%3DINR%26mc%3D8931&choe=UTF-8&chld=L|0';
    expect(getQRImage(URL)).toBe(preparedURL);
  });
  test('should return preparedURL for QR Image', () => {
    const preparedURL =
      'https://chart.googleapis.com/chart?chs=141x141&cht=qr&chl=upi%3A%2F%2Fpay%3Fpa%3Drazorpay.pg%40hdfcbank%26pn%3DRazorpay%26tr%3DM10rKVfkNww2eBE%26am%3D100%26cu%3DINR%26mc%3D5411%26tn%3D&choe=UTF-8&chld=L|0';
    expect(getQRImage()).toBe(preparedURL);
  });
});
describe('Test clearActiveQRPayment', () => {
  test('should return undefined when QR is inactive', () => {
    qrState.set(qrInitialState as QrStateType);
    expect(clearActiveQRPayment()).toBe(undefined);
  });
  test('should return INTENDED_OPT_OUT', () => {
    const expired = false;
    const silent = false;
    qrState.set(qrActiveState as QrStateType);
    clearActiveQRPayment(expired, silent);
    expect(resetQRState).toHaveBeenCalledTimes(1);
    expect(clearPaymentRequest).toHaveBeenCalledTimes(1);
    expect(clearPaymentRequest).toHaveBeenCalledWith(
      PAYMENT_CANCEL_REASONS.INTENDED_OPT_OUT,
      silent
    );
  });
  test('should return INTENDED_EXPIRE', () => {
    const expired = true;
    const silent = false;
    qrState.set(qrActiveState as QrStateType);
    clearActiveQRPayment(expired, silent);
    expect(resetQRState).toHaveBeenCalledTimes(1);
    expect(clearPaymentRequest).toHaveBeenCalledTimes(1);
    expect(clearPaymentRequest).toHaveBeenCalledWith(
      PAYMENT_CANCEL_REASONS.INTENDED_EXPIRE,
      silent
    );
  });
});
describe('Test isQRPaymentCancellable', () => {
  test('should return NO_ACTIVE_PAYMENT', () => {
    qrState.set(qrInitialState as QrStateType);
    const metaProps = {};
    expect(isQRPaymentCancellable(metaProps)).toBe(
      QRPaymentCancelStatus.NO_ACTIVE_PAYMENT
    );
  });
  test('should return ACTIVE_BUT_AUTO_CANCELLED', () => {
    const autoCancelIfAny = true;
    qrState.set(qrActiveState as QrStateType);
    const metaProps = {};
    expect(isQRPaymentCancellable(metaProps, autoCancelIfAny)).toBe(
      QRPaymentCancelStatus.ACTIVE_BUT_AUTO_CANCELLED
    );
  });
  test('should return ACTIVE_BUT_FAILED_TO_CANCEL', () => {
    qrState.set(qrActiveState as QrStateType);
    const metaProps = {};
    expect(isQRPaymentCancellable(metaProps)).toBe(
      QRPaymentCancelStatus.ACTIVE_BUT_FAILED_TO_CANCEL
    );
  });
  test('should return ACTIVE_CANCEL_POSSIBLE_WITH_REASON', () => {
    qrState.set(qrActiveState as QrStateType);
    expect(
      isQRPaymentCancellable({
        '_[reason]': PAYMENT_CANCEL_REASONS.INTENDED_OPT_OUT,
      })
    ).toBe(QRPaymentCancelStatus.ACTIVE_CANCEL_POSSIBLE_WITH_REASON);
  });
});
describe('Test updateRenderQrState', () => {
  test('should update qrRenderState', () => {
    const qrState = {
      status: true,
      homeScreenQR: false,
      upiScreenQR: true,
      upiScreenQRPosition: 'top',
      downtimePSPApps: [],
    };
    updateRenderQrState(qrState as QrRenderState);
    expect(get(qrRenderState)).toMatchObject(qrState);
  });
});
