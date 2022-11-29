import { getProvider } from 'common/apps';

describe('#getProvider', () => {
  test('should return google pay data', () => {
    expect(getProvider('google_pay')).toEqual(
      expect.objectContaining({
        card_logo: 'https://cdn.razorpay.com/card/googlepay.svg',
        code: 'google_pay',
        externalSDK: 'googlepay',
        logo: 'https://cdn.razorpay.com/app/googlepay.svg',
        verify_registration: true,
      })
    );
  });

  test('should return google pay isCompatibleWithSDK function with ios', () => {
    expect(
      getProvider('google_pay').isCompatibleWithSDK({ platform: 'ios' })
    ).toEqual(false);
  });

  test('should return google pay isCompatibleWithSDK function with android', () => {
    expect(
      getProvider('google_pay').isCompatibleWithSDK({ platform: 'android' })
    ).toEqual(true);
  });

  test('should return cred data', () => {
    expect(getProvider('cred')).toEqual(
      expect.objectContaining({
        code: 'cred',
        logo: 'https://cdn.razorpay.com/checkout/cred.png',
        package_name: 'com.dreamplug.androidapp',
        uri: 'credpay',
      })
    );
  });

  test('should return  red isCompatibleWithSDK function with ios', () => {
    expect(
      getProvider('cred').isCompatibleWithSDK({ platform: 'ios' })
    ).toEqual(true);
  });

  test('should return cred isCompatibleWithSDK function with android', () => {
    expect(
      getProvider('cred').isCompatibleWithSDK({ platform: 'android' })
    ).toEqual(true);
  });

  test('should return empty object if key is not present', () => {
    expect(getProvider('phonepe')).toEqual({});
  });
});
