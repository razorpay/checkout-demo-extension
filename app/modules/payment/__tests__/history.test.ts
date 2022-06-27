import {
  getLatestPayment,
  matchLatestPaymentWith,
  setLatestPayment,
  updateLatestPaymentErrorReason,
  updateLatestPaymentStatus,
  getAllPaymentInstances,
} from 'payment/history';

describe('Payment History Utility Tests', () => {
  test('getAllPaymentInstances', () => {
    expect(getAllPaymentInstances()).toMatchObject([]);
    setLatestPayment(
      {
        data: {},
      },
      true
    );
    expect(getAllPaymentInstances()).toMatchObject([
      {
        data: {},
        errorReason: 'automatic',
      },
    ]);
  });
  test('getLatestPayment: when no payment happened, should return nothing', () => {
    expect(getLatestPayment()).toMatchObject({});
  });
  test('getLatestPayment: when a payment happened, should return the object', () => {
    setLatestPayment(
      {
        data: {},
      },
      true
    );
    expect(getLatestPayment()).toMatchObject({
      data: {},
      errorReason: 'automatic',
    });
  });
  test('setLatestPayment-init', () => {
    setLatestPayment(
      {
        data: {},
      },
      true
    );
    expect(getLatestPayment().errorReason).toBe('automatic');
  });
  test('setLatestPayment', () => {
    setLatestPayment({
      data: {},
      errorReason: 'manual',
    });
    expect(getLatestPayment().errorReason).toBe('manual');
  });
  test('updateLatestPaymentErrorReason-test', () => {
    setLatestPayment({
      data: {},
    });

    updateLatestPaymentErrorReason('manual');
    expect(getLatestPayment().errorReason).toBe('manual');
    updateLatestPaymentErrorReason('' as any);
    expect(getLatestPayment().errorReason).toBe('manual');
  });
  test('updateLatestPaymentStatus-test', () => {
    setLatestPayment({
      data: {},
    });
    updateLatestPaymentStatus('cancel');
    expect(getLatestPayment().status).toBe('cancel');
  });
  test('updateLatestPaymentStatus-cancel must not be overriden', () => {
    setLatestPayment({
      data: {},
    });
    updateLatestPaymentStatus('cancel');
    expect(getLatestPayment().status).toBe('cancel');
    updateLatestPaymentStatus('error');
    expect(getLatestPayment().status).toBe('cancel');
  });
  test('matchLatestPaymentWith', () => {
    setLatestPayment({
      params: {
        additionalInfo: {
          referrer: 'UPI_UX',
        },
      } as any,
      status: 'error',
      errorReason: 'automatic',
    });

    expect(
      matchLatestPaymentWith({
        referrer: 'UPI_UX',
        inStatuses: ['cancel', 'error'],
        errorReason: 'automatic',
      })
    ).toBe(true);
    updateLatestPaymentStatus('cancel');
    expect(
      matchLatestPaymentWith({
        referrer: 'UPI_UX',
        inStatuses: ['cancel', 'error'],
        errorReason: 'automatic',
      })
    ).toBe(true);
    setLatestPayment(
      {
        data: {},
        statusData: {
          error: {
            metadata: {
              payment_id: 'test-2-id',
            },
          },
        },
      },
      true
    );
    expect(
      matchLatestPaymentWith({
        referrer: 'UPI_UX',
        inStatuses: ['cancel', 'error'],
        errorReason: 'automatic',
      })
    ).toBe(false);
    expect(
      matchLatestPaymentWith({
        referrer: 'UPI_UX',
        inStatuses: ['cancel', 'error'],
        errorReason: 'automatic',
        paymentId: 'testId',
      })
    ).toBe(false);
  });
});
