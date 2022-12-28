import { defineGlobals } from 'bridge/global';
import { digits, otp } from 'checkoutstore/screens/otp';
import { get } from 'svelte/store';
import { querySelector, querySelectorAll } from 'utils/doc';
import Analytics from 'analytics';
jest.mock('sessionmanager', () => ({
  getSession: jest.fn(() => ({
    get: jest.fn(),
    bindEvents: jest.fn(),
    setAmount: jest.fn(),
  })),
}));

jest.mock('utils/doc', () => {
  const originalModule = jest.requireActual('utils/doc');
  return {
    __esModule: true,
    ...originalModule,
    querySelector: jest.fn(() => jest.fn()),
    querySelectorAll: jest.fn(() => false),
  };
});

describe('test #handleOTP', () => {
  it('for headless otp it should work to read 6 digit otp ', () => {
    defineGlobals();

    let otpInput = document.createElement('input');
    (querySelector as unknown as jest.Mock).mockReturnValue(otpInput);
    (window as any).handleOTP(
      '117823 is SECRET OTP for txn of INR 1.00 on Axis Bank card XX8305 at Razorpay on 22-11-22 14:45:11. OTP valid for 5 mins. Please do not share this OTP.'
    );
    expect(get(otp)).toBe('117823');
  });
  it('for headless otp it should work to read 4 digit otp ', () => {
    defineGlobals();
    const analytics = (Analytics.track = jest.fn());
    const otpInput = document.createElement('input');
    (querySelector as unknown as jest.Mock).mockReturnValue(otpInput);

    (window as any).handleOTP(
      '0412 is your OTP for your purchase of INR 1 at Razorpay using your OneCard XX7186. SSH! Dont tell this to anyone.'
    );
    expect(analytics).toHaveBeenCalledWith('autofilling_four_digit_otp');

    expect(get(otp)).toBe('0412');
  });
  it('for headless otp it should not work for to read 3 digit otp ', () => {
    defineGlobals();
    const otpInput = document.createElement('input');
    (querySelector as unknown as jest.Mock).mockReturnValue(otpInput);
    (window as any).handleOTP(
      '041 is your OTP for your purchase of INR 1 at Razorpay using your Test card . '
    );

    expect(get(otp)).toBe('');
  });

  it('for headless otp it should not work if already enter by user ', () => {
    defineGlobals();

    const otpInput = document.createElement('input');
    otpInput.value = '1234';
    (querySelector as unknown as jest.Mock).mockReturnValue(otpInput);
    (window as any).handleOTP(
      '0412 is your OTP for your purchase of INR 1 at Razorpay using your Test card . '
    );

    expect(get(otp)).not.toBe('0412');
  });
  it('for razorpay otp it should work if it is of 6 digit ', () => {
    defineGlobals();
    const otpInput1 = document.createElement('input');
    otpInput1.id = 'otp|0';
    const otpInput2 = document.createElement('input');
    otpInput1.id = 'otp|1';
    const otpInput3 = document.createElement('input');
    otpInput1.id = 'otp|2';
    const otpInput4 = document.createElement('input');
    otpInput1.id = 'otp|3';
    const otpInput5 = document.createElement('input');
    otpInput1.id = 'otp|4';
    const otpInput6 = document.createElement('input');
    otpInput1.id = 'otp|5';
    (querySelectorAll as unknown as jest.Mock).mockReturnValue([
      otpInput1,
      otpInput2,
      otpInput3,
      otpInput4,
      otpInput5,
      otpInput6,
    ]);
    (window as any).handleOTP(
      'Use OTP 142944 for accesssing your saved cards on Razorpay for the payment on RAZORPAY. Valid till 14:43:23 IST. Do not share this with anyone'
    );

    expect(get(digits)).toEqual(
      expect.arrayContaining(['1', '4', '2', '9', '4', '4'])
    );
  });
});
