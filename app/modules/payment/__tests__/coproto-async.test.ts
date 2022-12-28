import { processCoproto } from 'payment/coproto';
import { payloadData, appCredResponse } from 'payment/__mocks__/coproto';

const razorpayInstance = {
  id: 'id',
  key: 'rzp_test_key',
  get: jest.fn(),
  getMode: jest.fn(),
};

describe('Test processCoproto', () => {
  test('Test processCoproto for aync flow on CRED', () => {
    const data = {
      ...payloadData,
      method: 'app',
      provider: 'cred',
    };
    const on = jest.fn();
    const emit = jest.fn();
    processCoproto.call(
      { emit, r: razorpayInstance, data, on },
      appCredResponse
    );
    expect(emit).toHaveBeenCalledTimes(2);
    expect(emit).toHaveBeenCalledWith(
      'createPayment.responseType',
      appCredResponse.type
    );
    expect(emit).toHaveBeenCalledWith('app.pending', appCredResponse);
  });
  test('Test processCoproto for aync flow on UPI', () => {
    const data = {
      ...payloadData,
      provider: 'cred',
      app_present: 0,
    };
    const on = jest.fn();
    const emit = jest.fn();
    processCoproto.call(
      { emit, r: razorpayInstance, data, on },
      appCredResponse
    );
    expect(emit).toHaveBeenCalledTimes(2);
    expect(emit).toHaveBeenCalledWith(
      'createPayment.responseType',
      appCredResponse.type
    );
    expect(emit).toHaveBeenCalledWith('upi.pending', appCredResponse.data);
  });
});
