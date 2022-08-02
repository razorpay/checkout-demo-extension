import { get, writable } from 'svelte/store';
import { selectedInstrument, phone } from 'checkoutstore/screens/home';
import { shouldRememberCustomer } from 'checkoutstore/index.js';
import {
  getOption,
  getPreferences,
  getMerchantOption,
  isRecurringOrPreferredPayment,
  isContactOptional,
} from 'razorpay';

jest.mock('razorpay', () => ({
  get: jest.fn(),
  getPreferences: jest.fn(),
  getOptionalObject: jest.fn(),
}));

jest.mock('razorpay/index.js', () => ({
  isRecurringOrPreferredPayment: jest.fn(),
  getMerchantOption: jest.fn((x) => {
    if (x === 'remember_customer') {
      return true;
    }
    return false;
  }),

  getOption: jest.fn((x) => {
    if (x === 'features.cardsaving') {
      return false;
    }
    return true;
  }),
  isContactOptional: jest.fn(),
}));

const instrument = {
  _ungrouped: [
    {
      iin: '403575',
      method: 'card',
      _type: 'instrument',
    },
    {
      iin: '405988',
      method: 'card',
      _type: 'instrument',
    },
  ],
  iins: ['403575', '405988'],
  method: 'card',
  _type: 'instrument',
  id: '56185641_rzp.restrict_allow_0_0_card_false',
  skipCTAClick: false,
  section: 'custom',
};

jest.mock('checkoutstore/screens/home', () => {
  const { writable } = jest.requireActual('svelte/store');
  const originalModule = jest.requireActual('checkoutstore/screens/home');
  return {
    ...originalModule,
    __esModule: true,
    selectedInstrument: writable(instrument),
    phone: writable(''),
  };
});

let cookieEnabled;
cookieEnabled = jest.spyOn(window.navigator, 'cookieEnabled', 'get');

describe('otp request conditions', () => {
  describe('if recurring or preffered method , request otp', () => {
    beforeEach(() => {
      isRecurringOrPreferredPayment.mockImplementation(() => true);
    });
    test('isRecurringOrPreferredPayment', () => {
      expect(shouldRememberCustomer()).toBeTruthy();
    });
  });

  describe('if merchant passed remember customer as true', () => {
    beforeEach(() => {
      isRecurringOrPreferredPayment.mockReturnValueOnce(false);
      isContactOptional.mockReturnValueOnce(false);
      cookieEnabled.mockReturnValue(true);
    });

    test('remember_customer', () => {
      expect(shouldRememberCustomer('netbanking')).toBeTruthy();
    });
  });

  describe('dont request otp for following cases', () => {
    describe('if cookie is disabled or not supported', () => {
      beforeEach(() => {
        isRecurringOrPreferredPayment.mockImplementation(() => false);
        cookieEnabled.mockReturnValue(false);
      });

      test('navigator', () => {
        expect(shouldRememberCustomer('netbanking')).toBeFalsy();
      });
    });

    describe('card method and card saving disabled', () => {
      beforeEach(() => {
        isRecurringOrPreferredPayment.mockImplementation(() => false);
        cookieEnabled.mockReturnValue(true);
      });

      test('card method and !getOption("features.cardsaving")', () => {
        expect(shouldRememberCustomer('card')).toBeFalsy();
      });
    });

    describe('if contact is optional and phone details dont exists', () => {
      beforeEach(() => {
        isRecurringOrPreferredPayment.mockImplementation(() => false);
        isContactOptional.mockImplementation(() => true);
        cookieEnabled.mockReturnValue(true);
      });

      test('isContactOptional() && !get(phone', () => {
        expect(isContactOptional()).toBeTruthy();
        expect(get(phone)).toBeFalsy();
        expect(shouldRememberCustomer('netbanking')).toBeFalsy();
      });
    });
  });

  describe('if instrument contains iins, dont request otp', () => {
    beforeEach(() => {
      isRecurringOrPreferredPayment.mockImplementation(() => false);
    });

    test('testing if instrument has iins', () => {
      const currentInstrument = get(selectedInstrument);
      expect(currentInstrument).toMatchObject(instrument);
      const hasIins = Boolean(currentInstrument.iins);
      expect(hasIins).toBe(true);

      expect(shouldRememberCustomer()).toBeFalsy();
    });
  });

  describe('recurring', () => {
    beforeEach(() => {
      isRecurringOrPreferredPayment.mockImplementation(() => false);
      cookieEnabled.mockReturnValue(true);
      isContactOptional.mockImplementation(() => false);
      return import('checkoutstore/screens/home').then((module) => {
        module.selectedInstrument.set(writable([]));
      });
    });

    test('recurring always returns true', () => {
      expect(shouldRememberCustomer('netbanking')).toBeTruthy();
    });
  });
});
