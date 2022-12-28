import { processCoproto } from 'payment/coproto';
import { payloadData, cardlessEMIResponse } from 'payment/__mocks__/coproto';

const razorpayInstance = {
  id: 'id',
  key: 'rzp_test_key',
  get: jest.fn(),
  getMode: jest.fn(),
};

describe('Test processCoproto for Cardless EMI', () => {
  test('should emit the expected request & response for Cardless EMI flow', () => {
    const data = {
      ...payloadData,
      method: 'cardless_emi',
      provider: 'earlysalary',
    };

    const emit = jest.fn();
    processCoproto.call(
      { emit, r: razorpayInstance, data },
      cardlessEMIResponse
    );
    expect(emit).toHaveBeenCalledTimes(2);
    expect(emit).toHaveBeenCalledWith(
      'createPayment.responseType',
      cardlessEMIResponse.type
    );
    expect(emit).toHaveBeenCalledWith('process', {
      request: cardlessEMIResponse.request,
      response: cardlessEMIResponse,
    });
  });
});
