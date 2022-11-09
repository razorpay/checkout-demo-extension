import { isOneClickCheckout, getOption } from 'razorpay';
import * as contextModule from 'sentry/context';
import { getSavedAddresses } from 'one_click_checkout/address/store';
import { getCustomerDetails } from 'one_click_checkout/common/helpers/customer';

jest.mock('razorpay', () => {
  return {
    __esModule: true,
    isOneClickCheckout: jest.fn(),
    getOption: jest.fn(),
  };
});

jest.mock('analytics/base-analytics', () => {
  return {
    __esModule: true,
    Track: {
      id: 'mock_checkout',
    },
  };
});

jest.mock('one_click_checkout/common/helpers/customer', () => {
  return {
    __esModule: true,
    getCustomerDetails: jest.fn(),
  };
});

jest.mock('one_click_checkout/address/store', () => {
  return {
    __esModule: true,
    getSavedAddresses: jest.fn(),
  };
});

const common_options = {
  order_id: 'order_test',
  callback_url: 'https://mock-callback.razorpay.com/callback',
  redirect: true,
};

describe('createContext() method', () => {
  it('should create context', () => {
    (getOption as unknown as jest.Mock).mockReturnValue(common_options);
    (getCustomerDetails as jest.Mock).mockReturnValue({});
    (getSavedAddresses as jest.Mock).mockReturnValue([]);
    (isOneClickCheckout as jest.Mock).mockReturnValue(true);

    const context = contextModule.createContext();

    expect(context).toEqual({
      options: common_options,
      checkout_id: 'mock_checkout',
      order_id: 'order_test',
      logged_in: false,
      one_click_checkout: true,
      has_saved_address: false,
      has_saved_cards: false,
    });
  });

  it('should delete prefill if exists', () => {
    (getOption as unknown as jest.Mock).mockReturnValue({
      ...common_options,
      'prefill.name': 'Test',
      'prefill.contact': '+91999999999',
      'prefill.email': 'goutam@test.com',
    });
    (getCustomerDetails as jest.Mock).mockReturnValue({});
    (getSavedAddresses as jest.Mock).mockReturnValue([]);
    (isOneClickCheckout as jest.Mock).mockReturnValue(true);

    const context = contextModule.createContext();

    expect(context).toEqual({
      options: {
        ...common_options,
        'prefill.name': '****',
        'prefill.contact': '+***********',
        'prefill.email': '******@****.***',
      },
      checkout_id: 'mock_checkout',
      order_id: 'order_test',
      logged_in: false,
      one_click_checkout: true,
      has_saved_address: false,
      has_saved_cards: false,
    });
  });

  it('should have saved address and cards if user logged in', () => {
    (getOption as unknown as jest.Mock).mockReturnValue(common_options);
    (getCustomerDetails as jest.Mock).mockReturnValue({
      contact: '+919353231953',
      customer_id: undefined,
      haveSavedCard: true,
      logged: true,
      tokens: {
        count: 1,
        entity: 'collection',
        items: [
          {
            auth_type: null,
            bank: null,
            billing_address: null,
            card: {
              country: 'IN',
              downtimeSeverity: false,
              emi: false,
              entity: 'card',
              expiry_month: 2,
              expiry_year: 2026,
              flows: {
                recurring: true,
                iframe: false,
              },
              international: false,
              issuer: '',
              last4: '0008',
              name: 'A',
              network: 'MasterCard',
              networkCode: 'mastercard',
              sub_type: 'consumer',
              token_iin: null,
              type: 'debit',
            },
            compliant_with_tokenisation_guidelines: false,
            consent_taken: false,
            created_at: 1622787457,
            cvvDigits: 3,
            dcc_enabled: true,
            debitPin: false,
            entity: 'token',
            expired_at: 1772303399,
            id: 'token_HIseR9oUT4i2Gv',
            method: 'card',
            mrn: null,
            notes: [],
            plans: '',
            recurring: false,
            recurring_details: {
              failure_reason: null,
              status: 'not_applicable',
            },
            status: null,
            token: 'knea15HEIbkq3A',
            used_at: 1643292410,
            wallet: null,
          },
        ],
      },
    });
    (getSavedAddresses as jest.Mock).mockReturnValue([
      {
        city: 'Bengaluru',
        contact: '+919353231953',
        country: 'in',
        formattedLine1: '18, Meera Mansion',
        formattedLine2: 'Mallikarjunappa Lane, Ballapurpet, Nagarathpete',
        formattedLine3: 'Bengaluru, Karnataka, India, 560002',
        id: 'J2x8zdEPZYK2La',
        landmark: '',
        line1: '18, Meera Mansion',
        line2: 'Mallikarjunappa Lane, Ballapurpet, Nagarathpete',
        name: 'Goutam',
        serviceability: false,
        source_type: null,
        state: 'Karnataka',
        tag: '',
        type: 'shipping_address',
        zipcode: '560002',
      },
    ]);
    (isOneClickCheckout as jest.Mock).mockReturnValue(true);

    const context = contextModule.createContext();

    expect(context).toEqual({
      options: common_options,
      checkout_id: 'mock_checkout',
      order_id: 'order_test',
      logged_in: true,
      one_click_checkout: true,
      has_saved_address: true,
      has_saved_cards: true,
    });
  });
});

describe('getContext() method', () => {
  it('should return context object', () => {
    (getOption as unknown as jest.Mock).mockReturnValue(common_options);
    (getCustomerDetails as jest.Mock).mockReturnValue({});
    (getSavedAddresses as jest.Mock).mockReturnValue([]);
    (isOneClickCheckout as jest.Mock).mockReturnValue(true);

    const context = contextModule.getContext();

    expect(context).toEqual({
      options: common_options,
      checkout_id: 'mock_checkout',
      order_id: 'order_test',
      logged_in: false,
      one_click_checkout: true,
      has_saved_address: false,
      has_saved_cards: false,
    });
  });
});

describe('setContext() method', () => {
  it('should call sentry.setContext', () => {
    const Sentry = {
      setContext: jest.fn(),
    };

    window.Sentry = Sentry;

    contextModule.setContext();
    expect(window.Sentry.setContext).toHaveBeenCalled();
  });
});
