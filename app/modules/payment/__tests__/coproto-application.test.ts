import { processCoproto } from 'payment/coproto';
import { payloadData, gpaySDKResponse } from 'payment/__mocks__/coproto';

const razorpayInstance = {
  id: 'id',
  key: 'rzp_test_key',
  get: jest.fn(),
  getMode: jest.fn(),
};

describe('Test processCoproto for google pay', () => {
  test('Test processCoproto for application google pay', () => {
    const data = {
      ...payloadData,
      method: 'upi',
      provider: 'GOOGLE_PAY',
    };

    const emit = jest.fn();
    const on = jest.fn();
    processCoproto.call(
      { emit, r: razorpayInstance, data, on },
      gpaySDKResponse
    );
    expect(emit).toHaveBeenCalledTimes(2);
    expect(emit).toHaveBeenCalledWith(
      'createPayment.responseType',
      gpaySDKResponse.type
    );
    expect(emit).toHaveBeenCalledWith('externalsdk.process', gpaySDKResponse);
    expect(on).toHaveBeenCalledTimes(1);
  });
});
