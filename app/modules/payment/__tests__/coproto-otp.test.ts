import { processCoproto } from 'payment/coproto';
import {
  payloadData,
  nativeOTPWalletResponse,
  nativeOTPCardResponse,
  cardOTPResponse,
  emiOTPResponse,
} from 'payment/__mocks__/coproto';

const razorpayInstance = {
  id: 'id',
  key: 'rzp_test_key',
  get: jest.fn(),
  getMode: jest.fn(),
};

describe('Test processCoproto', () => {
  test('Test processCoproto native OTP for wallet', () => {
    const data = {
      ...payloadData,
      method: 'wallet',
      wallet: 'freecharge',
    };
    const emit = jest.fn();
    processCoproto.call(
      { emit, r: razorpayInstance, data },
      nativeOTPWalletResponse
    );
    expect(emit).toHaveBeenCalledTimes(2);
    expect(emit).toHaveBeenCalledWith(
      'createPayment.responseType',
      nativeOTPWalletResponse.type
    );
    expect(emit).toHaveBeenCalledWith('otp.required');
  });
  test('Test processCoproto native OTP for Card', () => {
    const data = {
      ...payloadData,
      method: 'card',
      'card[number]': '4111111666222111',
      'card[cvv]': '111',
      'card[name]': 'Abishek',
      save: 1,
      'card[expiry_month]': '07',
      'card[expiry_year]': '24',
    };
    const emit = jest.fn();
    processCoproto.call(
      { emit, r: razorpayInstance, data, nativeotp: true },
      nativeOTPCardResponse
    );
    expect(emit).toHaveBeenCalledTimes(2);
    expect(emit).toHaveBeenCalledWith(
      'createPayment.responseType',
      nativeOTPCardResponse.type
    );
    expect(emit).toHaveBeenCalledWith('otp.required', nativeOTPCardResponse);
  });
  test('Test processCoproto OTP for EMI', () => {
    const data = {
      ...payloadData,
      method: 'emi',
      'card[number]': '4111111666222111',
      'card[cvv]': '111',
      'card[name]': 'Abishek',
      save: 1,
      'card[expiry_month]': '07',
      'card[expiry_year]': '24',
    };

    const emit = jest.fn();
    const nativeotp = true;
    processCoproto.call(
      { emit, r: razorpayInstance, data, nativeotp },
      emiOTPResponse
    );
    expect(emit).toHaveBeenCalledTimes(2);
    expect(emit).toHaveBeenCalledWith(
      'createPayment.responseType',
      emiOTPResponse.type
    );
    expect(emit).toHaveBeenCalledWith('otp.required', emiOTPResponse);
  });
  test('Test processCoproto normal OTP for Card', () => {
    const data = {
      ...payloadData,
      method: 'card',
      'card[number]': '4111111666222111',
      'card[cvv]': '111',
      'card[name]': 'Abishek',
      save: 1,
      'card[expiry_month]': '07',
      'card[expiry_year]': '24',
    };
    const emit = jest.fn();
    const checkRedirect = jest.fn();
    processCoproto.call(
      { emit, r: razorpayInstance, data, checkRedirect },
      cardOTPResponse
    );
    expect(emit).toHaveBeenCalledTimes(1);
    expect(emit).toHaveBeenCalledWith(
      'createPayment.responseType',
      cardOTPResponse.type
    );
  });
});
