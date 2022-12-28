import { processCoproto } from 'payment/coproto';
import { payloadData, gpayInAppResponse } from 'payment/__mocks__/coproto';

const razorpayInstance = {
  id: 'id',
  key: 'rzp_test_key',
  get: jest.fn(),
  getMode: jest.fn(),
};

describe('Test processCoproto for google pay', () => {
  test('Test processCoproto for gpay_inapp', () => {
    const data = {
      ...payloadData,
      method: 'upi',
      provider: 'GOOGLE_PAY',
    };
    const emit = jest.fn();
    processCoproto.call({ emit, r: razorpayInstance, data }, gpayInAppResponse);
    expect(emit).toHaveBeenCalledTimes(2);
    expect(emit).toHaveBeenCalledWith(
      'createPayment.responseType',
      gpayInAppResponse.type
    );
    expect(emit).toHaveBeenCalledWith('upi.pending', { flow: 'upi-intent' });
  });
});
