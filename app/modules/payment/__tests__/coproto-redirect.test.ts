import { processCoproto } from 'payment/coproto';
import { submitForm } from 'common/form';
import { payloadData } from 'payment/__mocks__/coproto';

jest.mock('common/form', () => {
  return {
    __esModule: true,
    submitForm: jest.fn(),
  };
});

const razorpayInstance = {
  id: 'id',
  key: 'rzp_test_key',
  get: jest.fn(() => true),
  getMode: jest.fn(),
};

const data = {
  ...payloadData,
  method: 'card',
  'card[number]': '4111111666222111',
  'card[cvv]': '111',
  'card[name]': 'Abishek',
  save: 1,
};

const response = {
  payment_id: 'pay_KqZUxNkLcNqE8E',
  redirect: true,
  type: 'redirect',
  request: {
    url: 'https://api.razorpay.com/v1/payments/KqZUxNkLcNqE8E/authenticate',
    method: 'POST',
    task_id: '8ae221c436217f85ab435bc4d47b0093',
  },
  version: 1,
  status_code: 200,
};

describe('Test processCoproto for redirect flows', () => {
  test('Test processCoproto for card normal OTP flows', () => {
    const emit = jest.fn();
    const checkRedirect = jest.fn();
    processCoproto.call(
      { emit, r: razorpayInstance, data, checkRedirect },
      response
    );
    expect(emit).toHaveBeenCalledTimes(1);
    expect(emit).toHaveBeenCalledWith(
      'createPayment.responseType',
      response.type
    );
  });
  test('Test processCoproto for card native OTP flows', () => {
    const emit = jest.fn();
    const nativeotp = true;
    const redirect = jest.fn();
    processCoproto.call(
      { emit, r: razorpayInstance, data, nativeotp, redirect },
      response
    );
    expect(emit).toHaveBeenCalledTimes(1);
    expect(emit).toHaveBeenCalledWith(
      'createPayment.responseType',
      response.type
    );
  });
  test('Test processCoproto for card native OTP 3ds flows', () => {
    const emit = jest.fn();
    const nativeotp = true;
    const redirect = jest.fn();
    razorpayInstance.get = jest.fn();
    processCoproto.call(
      { emit, r: razorpayInstance, data, nativeotp, redirect },
      response
    );
    expect(emit).toHaveBeenCalledTimes(2);
    expect(emit).toHaveBeenCalledWith(
      'createPayment.responseType',
      response.type
    );
    expect(emit).toHaveBeenCalledWith('3ds.required');
  });
  test('Test processCoproto', () => {
    const emit = jest.fn();
    const popup = {
      show: jest.fn(),
      window: {
        document: {},
      },
    };
    const iframe = document.createElement('iframe');

    razorpayInstance.get = jest.fn();
    processCoproto.call(
      { emit, r: razorpayInstance, data, popup, iframe },
      response
    );
    expect(emit).toHaveBeenCalledTimes(1);
    expect(emit).toHaveBeenCalledWith(
      'createPayment.responseType',
      response.type
    );
    expect(submitForm).toHaveBeenCalledTimes(1);
    expect(submitForm).toHaveBeenCalledWith(
      expect.objectContaining({
        url: response.request.url,
        params: null,
        method: response.request.method,
        target: undefined,
      })
    );
  });
});
