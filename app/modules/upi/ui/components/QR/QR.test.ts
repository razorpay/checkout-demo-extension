import { render } from '@testing-library/svelte';
import QR from './QR.svelte';
import { updateQrState } from './store';
import { handleUPIPayments } from 'upi/payment';
import { QR_EXPIRE_TIME } from 'upi/constants';

jest.mock('razorpay', () => ({
  get: jest.fn(),
  isOneClickCheckout: () => false,
  isCustomerFeeBearer: () => false,
  isOfferForced: () => false,
  getPreferences: () => {},
  isRecurring: () => false,
  getOptionalObject: jest.fn(),
  getOption: jest.fn(),
  razorpayInstance: {
    createPayment: () => {
      return new Object({ on: () => {} });
    },
  },
}));

jest.mock('upi/payment', () => ({
  handleUPIPayments: jest.fn(),
}));
jest.mock('upi/helper', () => ({
  ...jest.requireActual('upi/helper'),
  clearActiveQRPayment: jest.fn(),
}));

jest.mock('analytics', () => ({
  __esModule: true,
  default: {
    track: jest.fn(() => {}),
  },
}));

jest.mock('sessionmanager', () => ({
  getSession: () => ({
    r: {
      get: jest.fn(),
    },
    themeMeta: {
      icons: {
        saved_card: '',
      },
    },
    getPayload: jest.fn(),
    getAppliedOffer: jest.fn(),
    get: jest.fn(() => ({
      paused: false,
    })),
  }),
}));

describe('QR Component Tests', () => {
  it('should render without any errors', async () => {
    expect(render(QR, {})).toBeTruthy();
  });
  it('should render loading->qr->expire view properly', async () => {
    updateQrState({
      status: 'loading',
      url: '',
      autoGenerate: true,
    });
    const { getByText, debug, getByTestId } = render(QR, {});
    expect(
      getByText('Scan the QR using any UPI app on your phone.')
    ).toBeInTheDocument();
    expect(getByTestId('loading')).toBeInTheDocument();
    expect(handleUPIPayments).toBeCalled();
    const [payload, onResponse, config] = (handleUPIPayments as any).mock
      .calls[0];

    payload.qrFlow.onPaymentCreate({
      intent_url: 'test-url',
    });
    onResponse('error', {
      error: {
        description: 'dummy-error',
      },
    });
    jest.advanceTimersByTime(QR_EXPIRE_TIME + 50000);
    // expect(clearActiveQRPayment).toBeCalled();
  });
  it('should render refresh view properly', async () => {
    updateQrState({
      status: 'refresh',
      url: '',
      autoGenerate: false,
    });
    const { getByText, getByTestId } = render(QR, {});
    expect(
      getByText('Scan the QR using any UPI app on your phone.')
    ).toBeInTheDocument();
    expect(getByTestId('refresh')).toBeInTheDocument();
    expect(handleUPIPayments).not.toBeCalled();
  });
  it('should render QR view properly', async () => {
    updateQrState({
      status: 'qr',
      url: 'test-url',
      autoGenerate: false,
    });
    const { getByText, debug, getByTestId, queryByTestId } = render(QR, {});
    expect(
      getByText('Scan the QR using any UPI app on your phone.')
    ).toBeInTheDocument();
    expect(queryByTestId('refresh')).not.toBeInTheDocument();
    expect(queryByTestId('loading')).not.toBeInTheDocument();
    expect(handleUPIPayments).not.toBeCalled();
    expect((fetch as unknown as CFU.Fetch).resumePoll).toBeCalled;
  });
});
