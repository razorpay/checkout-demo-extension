import { getLastUpiUxErroredPaymentApp } from 'upi/helper/upiUx';
import { getAllPaymentInstances } from 'payment/history';

jest.mock('payment/history', () => ({
  getAllPaymentInstances: jest.fn(() => []),
}));

const appData = {
  app_name: 'Google Pay',
  package_name: 'com.google.android.apps.nbu.paisa.user',
  app_icon: 'https://cdn.razorpay.com/app/googlepay.svg',
  handles: ['okhdfcbank', 'okicici', 'okaxis', 'oksbi'],
  verify_registration: true,
  shortcode: 'google_pay',
};
describe('Test getLastUpiUxErroredPaymentApp', () => {
  test('Test getLastUpiUxErroredPaymentApp when upi error not occured', () => {
    expect(getLastUpiUxErroredPaymentApp()).toMatchObject({});
  });
  test('Test getLastUpiUxErroredPaymentApp when upi error occured', () => {
    const errorReason = 'automatic';
    (getAllPaymentInstances as any).mockReturnValue([
      {
        data: {
          contact: '+919952398401',
          email: 'abisheksrv@gmail.com',
          amount: 1000000,
          method: 'upi',
          upi: {
            flow: 'intent',
          },
          '_[flow]': 'intent',
          reward_ids: ['reward_H1CkSWntL23Qzt'],
          currency: 'INR',
          description: 'JEE Main & Advanced',
          key_id: 'rzp_live_ILgsfZCZoFIKMb',
          '_[shield][fhash]': 'f09987f571e749bfa6ddecb3fe415aacd4c6797c',
          '_[device_id]':
            '1.7ebcfd54a4021abfebafd3688368fd0bae08dbf4.1666943051041.26386462',
          '_[shield][tz]': 330,
          '_[build]': null,
          '_[checkout_id]': 'KpJK6QP6VElX6a',
          '_[device.id]':
            '1.7ebcfd54a4021abfebafd3688368fd0bae08dbf4.1666943051041.26386462',
          '_[env]': '__S_TRAFFIC_ENV__',
          '_[library]': 'checkoutjs',
          '_[platform]': 'browser',
          '_[referer]': 'http://localhost:8000/',
          '_[request_index]': 0,
        },
        params: {
          feesRedirect: false,
          external: {},
          optional: {
            contact: false,
            email: false,
          },
          additionalInfo: {
            config: {
              action: 'deepLinkIntent',
              app: appData,
            },
            referrer: 'UPI_UX',
          },
        },
        errorReason: 'automatic',
        statusData: {
          error: {
            code: 'BAD_REQUEST_ERROR',
            description:
              'No UPI App on this device. Select other UPI option to proceed.',
            reason: 'intent_no_apps_error',
            metadata: {
              payment_id: 'pay_KpJKzPbWYuxFWM',
            },
          },
          _silent: false,
        },
        status: 'cancel',
      },
    ]);
    expect(getLastUpiUxErroredPaymentApp(errorReason)).toMatchObject(appData);
  });
});
