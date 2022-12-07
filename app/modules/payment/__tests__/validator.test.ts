import { validateData, formatPayload, formatPayment } from 'payment/validator';
import { GOOGLE_PAY_PACKAGE_NAME } from 'upi/constants';
import { throwMessage } from 'utils/_';
import type { PaymentData } from 'payment/types';

jest.mock('utils/_', () => ({
  ...jest.requireActual('utils/_'),
  __esModule: true,
  throwMessage: jest.fn(),
}));

jest.mock('fingerprint', () => ({
  ...jest.requireActual('fingerprint'),
  __esModule: true,
  getDeviceId: () => '795b675d7',
  getFingerprint: () => '1.7ebcfd54a',
}));

jest.mock('razorpay', () => ({
  ...jest.requireActual('razorpay'),
  __esModule: true,
  getOption: jest.fn((opt) => {
    if (opt === 'key') {
      return 'rzp_test_1DP5mmOlF5G5ag';
    } else if (opt === '_.integration') {
      return 'woocommerce';
    } else if (opt === 'recurring') {
      return true;
    }
  }),
}));

const paymentData: Record<string, any> = {
  data: {
    contact: '+919952398401',
    email: 'abisheksrv@gmail.com',
    method: 'card',
    'card[number]': '4111111111111111',
    'card[cvv]': '234',
    'card[name]': 91,
    'card[expiry]': '0224',
    amount: 60000,
    currency: 'INR',
    description: 'JEE Main & Advanced',
    default_dcc_currency: 'GBP',
    '_[shield][fhash]': '795b675d7fdd97b84ae209be041cbc552cc57e9b',
    '_[device_id]':
      '1.7ebcfd54a4021abfebafd3688368fd0bae08dbf4.1666943051041.26386462',
    '_[shield][tz]': 330,
    '_[build]': null,
    '_[checkout_id]': 'Kgy8zaTVWC46wF',
    '_[device.id]':
      '1.7ebcfd54a4021abfebafd3688368fd0bae08dbf4.1666943051041.26386462',
    '_[env]': '__S_TRAFFIC_ENV__',
    '_[library]': 'checkoutjs',
    '_[platform]': 'browser',
    '_[referer]': 'http://localhost:8000/',
    '_[request_index]': 1,
  },
  feesRedirect: true,
  gpay: undefined,
};

describe('Test formatPayment', () => {
  it('Test formatPayment', async () => {
    formatPayment(paymentData as unknown as PaymentData);
    expect(throwMessage).toHaveBeenCalledTimes(1);
    expect(throwMessage).toHaveBeenCalledWith(
      'Error in integration. Card holder name is not valid, Please contact Razorpay for assistance'
    );
  });
});
describe('Test validateData', () => {
  it('Should throw error message if card holder name is invalid', async () => {
    validateData(paymentData.data);
    expect(throwMessage).toHaveBeenCalledTimes(1);
    expect(throwMessage).toHaveBeenCalledWith(
      'Error in integration. Card holder name is not valid, Please contact Razorpay for assistance'
    );
  });
  it('Should return if card holder name is empty', async () => {
    paymentData.data['card[name]'] = '';
    validateData(paymentData.data);
    expect(throwMessage).not.toHaveBeenCalled();
  });
  it('Should not throw error message if card holder name is valid', async () => {
    paymentData.data['card[name]'] = 'Guru';
    validateData(paymentData.data);
    expect(throwMessage).not.toHaveBeenCalled();
  });
});
describe('Test formatPayload', () => {
  it('Should return the formatted payload data for wallet payment method', async () => {
    const data = {
      contact: '+919952398401',
      email: 'abisheksrv@gmail.com',
      method: 'wallet',
      wallet: 'amazonpay',
      amount: 5000,
      reward_ids: ['reward_GJA4xprDUWGKLR'],
      currency: 'INR',
      description: 'JEE Main & Advanced',
      key_id: 'rzp_live_ILgsfZCZoFIKMb',
      '_[shield][fhash]': '795b675d7fdd97b84ae209be041cbc552cc57e9b',
      '_[device_id]':
        '1.7ebcfd54a4021abfebafd3688368fd0bae08dbf4.1666943051041.26386462',
      '_[shield][tz]': 330,
      '_[build]': null,
      '_[checkout_id]': 'KjvitWb6Yo87cv',
      '_[device.id]':
        '1.7ebcfd54a4021abfebafd3688368fd0bae08dbf4.1666943051041.26386462',
      '_[env]': '__S_TRAFFIC_ENV__',
      '_[library]': 'checkoutjs',
      '_[platform]': 'browser',
      '_[referer]': 'http://localhost:8000/',
      '_[request_index]': 0,
    };
    const payloadData = {
      ...paymentData,
      data,
      avoidPopup: true,
    };
    const resultData: Record<string, any> = {
      ...data,
    };
    resultData.view = 'html';
    resultData['_[integration]'] = 'woocommerce';
    resultData['_[source]'] = 'checkoutjs';
    resultData.recurring = 1;
    expect(Object.keys(formatPayload(data, payloadData)).sort()).toEqual(
      Object.keys(resultData).sort()
    );
  });
  it('Should return the formatted payload data for UPI intent payment instrument', async () => {
    const data = {
      contact: '+919952398401',
      email: 'abisheksrv@gmail.com',
      amount: 5000,
      method: 'upi',
      upi: {
        flow: 'intent',
      },
      '_[flow]': 'intent',
      currency: 'INR',
      description: 'JEE Main & Advanced',
      key_id: 'rzp_live_ILgsfZCZoFIKMb',
      '_[shield][fhash]': 'f09987f571e749bfa6ddecb3fe415aacd4c6797c',
      '_[device_id]':
        '1.7ebcfd54a4021abfebafd3688368fd0bae08dbf4.1666943051041.26386462',
      '_[shield][tz]': 330,
      '_[build]': null,
      '_[checkout_id]': 'Kjw4VvN1dmV1Vt',
      '_[device.id]':
        '1.7ebcfd54a4021abfebafd3688368fd0bae08dbf4.1666943051041.26386462',
      '_[env]': '__S_TRAFFIC_ENV__',
      '_[library]': 'checkoutjs',
      '_[platform]': 'browser',
      '_[referer]': 'http://localhost:8000/',
      '_[request_index]': 0,
    } as const;
    const payloadData = {
      ...paymentData,
      data,
      gpay: true,
    };
    const resultData: Record<string, any> = {
      ...data,
    };
    resultData.view = 'html';
    resultData['_[integration]'] = 'woocommerce';
    resultData['_[flow]'] = 'intent';
    resultData['_[app]'] = GOOGLE_PAY_PACKAGE_NAME;
    resultData.recurring = 1;
    expect(Object.keys(formatPayload(data, payloadData)).sort()).toEqual(
      Object.keys(resultData).sort()
    );
  });
  it('Should return the formatted payload data for card payment method', async () => {
    const resultData = { ...paymentData.data };
    delete resultData.default_dcc_currency;
    resultData.view = 'html';
    resultData.key_id = 'rzp_test_1DP5mmOlF5G5ag';
    resultData['_[integration]'] = 'woocommerce';
    resultData['card[expiry_month]'] = '02';
    resultData['card[expiry_year]'] = '24';
    resultData.recurring = 1;
    delete resultData['card[expiry]'];
    expect(
      Object.keys(formatPayload(paymentData.data, paymentData)).sort()
    ).toEqual(Object.keys(resultData).sort());
  });
});
