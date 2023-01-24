import { customer } from 'checkoutstore/customer';
import { selectedInstrument } from 'checkoutstore/screens/home';
import { selectedUPIAppForPay } from 'checkoutstore/screens/upi';
import {
  getInstrumentDataAfterSubmitClick,
  checkValidFlow,
  isRazorpayFrame,
  createIframe,
} from 'payment/utils';
import FLOWS from 'config/FLOWS';

jest.mock('checkoutstore/screens/home', () => {
  const { writable } = jest.requireActual('svelte/store');
  const originalModule = jest.requireActual('checkoutstore/screens/home');
  const secondModule = jest.requireActual('checkoutstore/customer');
  return {
    __esModule: true,
    ...originalModule,
    ...secondModule,
    selectedInstrument: writable(),
    customer: writable(),
  };
});

const paymentData = {
  contact: '+919952398401',
  email: 'abisheksrv@gmail.com',
  method: 'wallet',
  wallet: 'paypal',
  amount: 60000,
  reward_ids: ['reward_H1CkSWntL23Qzt'],
  currency_request_id: 'Kh4Lk20wOfHln6',
  dcc_currency: 'USD',
  currency: 'INR',
  description: 'JEE Main & Advanced',
  key_id: 'rzp_live_ILgsfZCZoFIKMb',
  '_[shield][fhash]': '795b675d7fdd97b84ae209be041cbc552cc57e9b',
  '_[device_id]':
    '1.7ebcfd54a4021abfebafd3688368fd0bae08dbf4.1666943051041.26386462',
  '_[shield][tz]': 330,
  '_[build]': null,
  '_[checkout_id]': 'Kh4K7F7TPaPBRo',
  '_[device.id]':
    '1.7ebcfd54a4021abfebafd3688368fd0bae08dbf4.1666943051041.26386462',
  '_[env]': '__S_TRAFFIC_ENV__',
  '_[library]': 'checkoutjs',
  '_[platform]': 'browser',
  '_[referer]': 'http://localhost:8000/',
  '_[request_index]': 1,
};
const paymentFlowList = [
  [FLOWS.DISABLE_WALLET_AMOUNT_CHECK, true],
  [FLOWS.POPUP_IFRAME, false],
  ['', false],
];
const frameData = [
  ['api.razorpay.com', true],
  ['api-dark.razorpay.com', false],
];
describe('Test createIframe', () => {
  test('should check the iframe element attributes and parent element attributes', () => {
    const modalEle = document.createElement('div');
    modalEle.setAttribute('id', 'modal');
    const containerEle = document.createElement('div');
    containerEle.setAttribute('id', 'container');
    document.body.appendChild(modalEle);
    document.body.appendChild(containerEle);
    expect(createIframe(true)).not.toBeUndefined();
    const iFrameEle: HTMLIFrameElement = createIframe(true);
    const attribute = {
      class: 'mchild iframe-flow',
      frameborder: '0',
      id: 'iframeFlow',
      height: '546px',
      width: '344px',
    };
    for (const property in attribute) {
      expect(iFrameEle.getAttribute(property)).toBe(
        attribute[property as keyof typeof attribute]
      );
    }
    expect(iFrameEle.style.display).toBe('');
    expect(Object.keys((iFrameEle as any).window).sort()).toEqual([
      'destroy',
      'focus',
      'hide',
    ]);
    expect((iFrameEle.parentElement as HTMLElement).getAttribute('id')).toBe(
      'container'
    );
    (iFrameEle as any).window.focus();
    expect(modalEle.style.display).toBe('none');
    (iFrameEle as any).window.destroy();
    expect(modalEle.style.display).toBe('');
    (iFrameEle as any).window.hide();
    expect(modalEle.style.display).toBe('');
    expect(iFrameEle.style.display).toBe('none');
  });
});
describe('Test isRazorpayFrame', () => {
  test.each(frameData)(
    'should check valid frame URL',
    (fieldHostName, result) => {
      const windowLocation = JSON.stringify(window.location);
      delete (window as any).location;
      Object.defineProperty(window, 'location', {
        value: {
          ...JSON.parse(windowLocation),
          protocol: 'https:',
          hostname: fieldHostName,
        },
        configurable: true,
      });
      expect(isRazorpayFrame()).toBe(result);
    }
  );
});
describe('Test checkValidFlow', () => {
  test.each(paymentFlowList)(
    'for wallet payment, should check valid payment flow',
    (flow, result) => {
      expect(checkValidFlow(paymentData, flow)).toBe(result);
    }
  );
  test('for wallet payment, when wallet & provider not exist', () => {
    delete (paymentData as any).provider;
    delete (paymentData as any).wallet;
    expect(checkValidFlow(paymentData, FLOWS.POPUP_IFRAME)).toBe(false);
  });
});
describe('Instrument Detail for Submit Event', () => {
  test('for wallet payment', () => {
    //@ts-ignore
    selectedInstrument.set({
      _ungrouped: [
        {
          _type: 'method',
          code: 'wallet',
          method: 'wallet',
        },
      ],
      _type: 'method',
      code: 'wallet',
      method: 'wallet',
      id: 'b740feb2_rzp.cluster_1_3_wallet_true',
    });
    const data = {
      contact: '+918111111111',
      email: 'test@razorpay.com',
      method: 'wallet',
      wallet: 'phonepe',
      amount: 550000,
    };
    const expectedResult = {
      method: { name: 'wallet' },
      instrument: { name: 'phonepe', personalisation: false, saved: false },
    };
    const value = getInstrumentDataAfterSubmitClick(data);
    expect(value).toStrictEqual(expectedResult);
  });
  test('for card with card number', () => {
    //@ts-ignore
    selectedInstrument.set({
      _ungrouped: [
        {
          _type: 'method',
          code: 'card',
          method: 'card',
        },
      ],
      _type: 'method',
      code: 'card',
      method: 'card',
      id: 'b740feb2_rzp.cluster_1_0_card_true',
    });
    const data = {
      contact: '+918111111111',
      email: 'test@razorpay.com',
      method: 'card',
      'card[number]': '4111111111111111',
      'card[expiry]': '11 / 23',
      'card[cvv]': '123',
      'card[name]': 'QARazorpay',
      amount: 550000,
    };
    const expectedResult = {
      method: {
        name: 'card',
      },
      instrument: {
        issuer: '',
        personalisation: false,
        saved: false,
        network: '',
        type: '',
        consent_given: false,
      },
    };
    const value = getInstrumentDataAfterSubmitClick(data);
    expect(value).toStrictEqual(expectedResult);
  });
  test('for card with card token from personalization', () => {
    //@ts-ignore
    selectedInstrument.set({
      block: {
        code: 'rzp.preferred',
        _type: 'block',
        title: 'Preferred Payment Methods',
      },
      consent_taken: false,
      id: 'KFUcmVQkdqQSg7',
      issuers: ['ICIC'],
      meta: { preferred: true },
      method: 'card',
      networks: ['Visa'],
      section: 'p13n',
      skipCTAClick: false,
      token_id: 'token_HMpQW2ILsIXGxA',
      types: ['debit'],
    });
    customer.set({
      contact: '+918111111111',
      customer_id: undefined,
      haveSavedCard: true,
      logged: true,

      tokens: {
        entity: 'collection',
        count: 4,
        items: [
          {
            id: 'token_HMpQW2ILsIXGxA',
            token: 'DlK0TQeEFlUtcH',
            method: 'card',
            card: {
              entity: 'card',
              last4: '7369',
              network: 'Visa',
              type: 'debit',
              issuer: 'ICIC',
              networkCode: 'visa',
            },
          },
          {
            id: 'token_EGADb8swOCgtto',
            token: 'GdRdKb81MWAp3e',
            method: 'card',
            card: {
              entity: 'card',
              name: 'Siddharth Goswami',
              last4: '0176',
              network: 'MasterCard',
              type: 'debit',
              issuer: 'HDFC',
              networkCode: 'mastercard',
            },
          },
        ],
      },
    });
    const data = {
      contact: '+918111111111',
      email: 'test@razorpay.com',
      amount: 550000,
      'card[cvv]': '123',
      method: 'card',
      token: 'DlK0TQeEFlUtcH',
    };
    const expectedResult = {
      method: {
        name: 'card',
      },
      instrument: {
        issuer: 'ICIC',
        personalisation: true,
        saved: true,
        network: 'Visa',
        type: 'debit',
        consent_given: false,
      },
    };
    const value = getInstrumentDataAfterSubmitClick(data);
    expect(value).toStrictEqual(expectedResult);
  });
  test('for upi collect payment using customer token', () => {
    //@ts-ignore
    selectedInstrument.set({
      _ungrouped: [
        {
          _type: 'method',
          code: 'upi',
          method: 'upi',
        },
      ],
      _type: 'method',
      code: 'upi',
      method: 'upi',
      id: 'b740feb2_rzp.cluster_1_1_upi_true',
    });
    customer.set({
      contact: '+918111111111',
      customer_id: undefined,
      haveSavedCard: true,
      logged: true,

      tokens: {
        entity: 'collection',
        count: 4,
        items: [
          {
            id: 'token_GpaXi2JbdnNQo4',
            entity: 'token',
            token: '8NHRLBA1JXAzVN',
            method: 'upi',
            vpa: {
              username: 'testupi@provider',
              handle: 'ybl',
              name: 'TEST USER',
              status: 'valid',
            },
          },
        ],
      },
    });
    const data = {
      contact: '+918111111111',
      email: 'test@razorpay.com',
      method: 'upi',
      token: '8NHRLBA1JXAzVN',
      upi: {
        flow: 'collect',
      },
      '_[flow]': 'directpay',
      amount: 550000,
    };
    const expectedResult = {
      method: {
        name: 'upi',
      },
      instrument: {
        name: 'PhonePe',
        personalisation: false,
        saved: true,
        type: 'collect',
        vpa: '@ybl',
      },
    };
    const value = getInstrumentDataAfterSubmitClick(data);
    expect(value).toStrictEqual(expectedResult);
  });
  test('for upi intent payment flow', () => {
    const data = {
      contact: '+919999999999',
      email: 'testuser@gmail.com',
      amount: 100,
      method: 'upi',
      upi: {
        flow: 'intent',
      },
      '_[flow]': 'intent',
    };
    selectedUPIAppForPay.set({
      app: {
        app_name: 'Google Pay',
        package_name: 'com.google.android.apps.nbu.paisa.user',
        app_icon: 'https://cdn.razorpay.com/app/googlepay.svg',
        handles: ['okhdfcbank', 'okicici', 'okaxis', 'oksbi'],
        verify_registration: true,
        shortcode: 'google_pay',
      },
      downtimeConfig: {
        downtimeInstrument: 'google_pay',
        severe: '',
      },
      position: {
        row: 0,
        column: 0,
      },
    });
    const expectedResult = {
      method: {
        name: 'upi',
      },
      instrument: {
        name: 'Google Pay',
        personalisation: false,
        saved: false,
        type: 'intent',
      },
    };
    const value = getInstrumentDataAfterSubmitClick(data);
    expect(value).toStrictEqual(expectedResult);
  });
  test('for upi collect payment using manual VAP entry', () => {
    const data = {
      contact: '+919999999999',
      email: 'testuser@gmail.com',
      method: 'upi',
      vpa: '9999999999@ybl',
      save: 1,
      upi: {
        flow: 'collect',
      },
      '_[flow]': 'directpay',
      amount: 100,
      reward_ids: ['reward_HjZx7uZEX7QJrv'],
    };
    selectedUPIAppForPay.set({
      app: {
        app_name: 'Google Pay',
        package_name: 'com.google.android.apps.nbu.paisa.user',
        app_icon: 'https://cdn.razorpay.com/app/googlepay.svg',
        handles: ['okhdfcbank', 'okicici', 'okaxis', 'oksbi'],
        verify_registration: true,
        shortcode: 'google_pay',
      },
      downtimeConfig: {
        downtimeInstrument: 'google_pay',
        severe: '',
      },
      position: {
        row: 0,
        column: 0,
      },
    });
    const expectedResult = {
      method: {
        name: 'upi',
      },
      instrument: {
        name: 'PhonePe',
        personalisation: false,
        saved: false,
        type: 'collect',
        vpa: '@ybl',
      },
    };
    const value = getInstrumentDataAfterSubmitClick(data);
    expect(value).toStrictEqual(expectedResult);
  });
  test('should return empty object if we do not passed the data to getInstrumentDataAfterSubmitClick', () => {
    expect(getInstrumentDataAfterSubmitClick()).toMatchObject({});
  });
});
