import * as OtpService from 'common/otpservice';

describe('common/otpservice', () => {
  test('getCount', function () {
    OtpService.markOtpSent('visa');
    expect(OtpService.getCount('visa')).toBe(1);
    expect(OtpService.getCount('mastercard')).toBe(0);
    OtpService.resetCount('visa');
    expect(OtpService.getCount('visa')).toBe(0);
    expect(OtpService.getCount('')).toBe(0);
  });

  test('canSendOtp', function () {
    expect(OtpService.canSendOtp('razorpay')).toBe(true);
    OtpService.markOtpSent('razorpay');
    expect(OtpService.canSendOtp('razorpay')).toBe(true);
    expect(OtpService.canSendOtp('')).toBeFalsy();

    OtpService.markOtpSent('visa');
    expect(OtpService.canSendOtp('visa')).toBe(true);
    OtpService.markOtpSent('razorpay');
    OtpService.markOtpSent('razorpay');
    OtpService.markOtpSent('razorpay');
    expect(OtpService.canSendOtp('razorpay')).toBe(false);
  });

  test('getPaymentData', function () {
    OtpService.setPaymentData('pay_12345', { time: 16578908, success: true });
    expect(OtpService.getPaymentData('pay_12345')).toEqual(
      expect.objectContaining({ time: 16578908, success: true })
    );
  });
});
