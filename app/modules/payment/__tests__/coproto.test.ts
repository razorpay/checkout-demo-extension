import { processOtpResponse, processPaymentCreate } from 'payment/coproto';

const razorpayInstance = {
  id: 'id',
  key: 'rzp_test_key',
  get: jest.fn(),
  getMode: jest.fn(),
};

describe('Test processOtpResponse', () => {
  test('Test processOtpResponse during error incorrect OTP', () => {
    const response = {
      error: {
        code: 'BAD_REQUEST_ERROR',
        description: 'Payment processing failed because of incorrect OTP',
        source: 'customer',
        step: 'payment_authentication',
        reason: 'incorrect_otp',
        metadata: {
          payment_id: 'pay_KjNmpk7Gvt12EM',
        },
        action: 'RETRY',
      },
      next: ['otp_submit'],
      status_code: 400,
    };
    const emit = jest.fn();
    processOtpResponse.call({ emit, r: razorpayInstance }, response);
    expect(emit).toHaveBeenCalledTimes(1);
    expect(emit).toHaveBeenCalledWith('otp.required', 'incorrect_otp_retry');
  });
  test('Test processOtpResponse during error insufficient wallet balance', () => {
    const response = {
      error: {
        code: 'BAD_REQUEST_ERROR',
        description:
          'Your payment could not be completed due to insufficient wallet balance. Try another payment method.',
        source: 'customer',
        step: 'payment_authorization',
        reason: 'insufficient_funds',
        metadata: {
          payment_id: 'pay_KjWUgTYDK3rAZX',
        },
        action: 'TOPUP',
      },
      status_code: 400,
    };
    const emit = jest.fn();
    processOtpResponse.call({ emit, r: razorpayInstance }, response);
    expect(emit).toHaveBeenCalledTimes(1);
    expect(emit).toHaveBeenCalledWith(
      'wallet.topup',
      response.error.description
    );
  });
  test('Test processOtpResponse during network error', () => {
    const response = {
      error: {
        description: 'Network error',
      },
    };
    const complete = jest.fn();
    processOtpResponse.call({ complete, r: razorpayInstance }, response);
    expect(complete).toHaveBeenCalledTimes(1);
    expect(complete).toHaveBeenCalledWith(response);
  });
  test('Test processOtpResponse during success', () => {
    const response = {
      razorpay_payment_id: 'pay_KjW7wHJcRIi5Vl',
      status_code: 200,
    };
    const complete = jest.fn();
    processOtpResponse.call({ complete, r: razorpayInstance }, response);
    expect(complete).toHaveBeenCalledTimes(1);
    expect(complete).toHaveBeenCalledWith(response);
  });
});
describe('Test processPaymentCreate', () => {
  test('should return expected error response for network failure', () => {
    const response = {
      error: {
        description: 'Network error',
      },
      xhr: {
        status: 0,
      },
    };
    const trySubmit = jest.fn();
    processPaymentCreate.call({ trySubmit }, response);
    expect(trySubmit).toHaveBeenCalledTimes(1);
  });
  test('should return undefined if payment has been canceled', () => {
    const response = {
      payment_id: 'pay_KkeUsnvwyoGbNl',
    };
    const popup = { checkClose: jest.fn(() => true) };
    expect(processPaymentCreate.call({ popup }, response)).toBe(undefined);
  });
});
