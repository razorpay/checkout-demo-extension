import { processCoproto } from 'payment/coproto';
import { payWithMicroapp, payWithPaymentRequestApi } from 'gpay';
import { payloadData, intentUPIResponse } from 'payment/__mocks__/coproto';

const razorpayInstance = {
  id: 'id',
  key: 'rzp_test_key',
  get: jest.fn(),
  getMode: jest.fn(),
};

jest.mock('gpay', () => ({
  payWithMicroapp: jest.fn(() => Promise.resolve()),
  payWithPaymentRequestApi: jest.fn(),
}));

jest.mock('common/useragent', () => {
  return {
    ...jest.requireActual('common/useragent'),
    androidBrowser: true,
  };
});

describe('Test processCoproto', () => {
  test('Test processCoproto UPI intent flow', () => {
    const data = {
      ...payloadData,
      method: 'upi',
      upi: {
        flow: 'intent',
      },
      '_[flow]': 'intent',
    };
    const on = jest.fn();
    const emit = jest.fn();
    processCoproto.call(
      { emit, r: razorpayInstance, data, on },
      intentUPIResponse
    );
    expect(emit).toHaveBeenCalledTimes(2);
    expect(emit).toHaveBeenCalledWith(
      'upi.coproto_response',
      intentUPIResponse
    );
  });
  test('Test processCoproto UPI intent flow', async () => {
    const data = {
      ...payloadData,
      method: 'upi',
      upi: {
        flow: 'intent',
      },
      '_[flow]': 'intent',
    };
    const on = jest.fn();
    const emit = jest.fn();
    const gpay = true;
    processCoproto.call(
      { emit, r: razorpayInstance, data, on, gpay },
      intentUPIResponse
    );
    expect(emit).toHaveBeenCalled();
    expect(emit).toHaveBeenCalledWith(
      'upi.coproto_response',
      intentUPIResponse
    );
    await expect(payWithPaymentRequestApi).toHaveBeenCalled();

    let upi_app = 'com.google.android.apps.nbu.paisa.user';
    processCoproto.call(
      { emit, r: razorpayInstance, data, on, gpay, upi_app },
      intentUPIResponse
    );
    expect(emit).toHaveBeenCalledWith(
      'upi.coproto_response',
      intentUPIResponse
    );
    await expect(payWithPaymentRequestApi).toHaveBeenCalled();

    upi_app = 'com.phonepe.app';
    processCoproto.call(
      { emit, r: razorpayInstance, data, on, gpay, upi_app },
      intentUPIResponse
    );
    expect(emit).toHaveBeenCalledWith(
      'upi.coproto_response',
      intentUPIResponse
    );
    await expect(payWithPaymentRequestApi).toHaveBeenCalled();
  });
  test('Test processCoproto UPI intent flow', () => {
    const data = {
      ...payloadData,
      method: 'upi',
      upi: {
        flow: 'intent',
      },
      '_[flow]': 'intent',
    };
    const on = jest.fn();
    const emit = jest.fn();
    const gpay = true;
    const microapps = {
      gpay: true,
    };
    processCoproto.call(
      { emit, r: razorpayInstance, data, on, gpay, microapps },
      intentUPIResponse
    );
    expect(emit).toHaveBeenCalledTimes(2);
    expect(emit).toHaveBeenCalledWith(
      'upi.coproto_response',
      intentUPIResponse
    );
    expect(payWithMicroapp).toHaveBeenCalled();
  });
  test('Test processCoproto UPI intent flow', () => {
    window.CheckoutBridge = {
      callNativeIntent: jest.fn(),
    };
    const data = {
      ...payloadData,
      method: 'upi',
      upi: {
        flow: 'intent',
      },
      '_[flow]': 'intent',
    };
    const on = jest.fn();
    const emit = jest.fn();
    processCoproto.call(
      { emit, r: razorpayInstance, data, on },
      intentUPIResponse
    );
    expect(emit).toHaveBeenCalledTimes(2);
    expect(emit).toHaveBeenCalledWith(
      'upi.coproto_response',
      intentUPIResponse
    );
    expect(window.CheckoutBridge.callNativeIntent).toHaveBeenCalledTimes(1);
    expect(window.CheckoutBridge.callNativeIntent).toHaveBeenCalledWith(
      intentUPIResponse.data.intent_url
    );
    const upi_app = 'com.phonepe.app';
    processCoproto.call(
      { emit, r: razorpayInstance, data, on, upi_app },
      intentUPIResponse
    );
    expect(window.CheckoutBridge.callNativeIntent).toHaveBeenCalled();
    expect(window.CheckoutBridge.callNativeIntent).toHaveBeenCalledWith(
      intentUPIResponse.data.intent_url,
      upi_app
    );
  });
});
