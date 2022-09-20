import { getAmount, getMerchantMethods } from 'razorpay';
import {
  getAllProviders,
  getBankEmiOptions,
  isDebitEmiProvider,
} from '../helper/emiOptions';

const merchantMethods = {
  emi_options: {
    HDFC: [
      {
        duration: 3,
        interest: 15,
        subvention: 'merchant',
        min_amount: 300000,
        merchant_payback: '2.45',
      },
      {
        duration: 6,
        interest: 15,
        subvention: 'customer',
        min_amount: 300000,
        merchant_payback: '4.23',
      },
    ],
    SBIN: [
      {
        duration: 3,
        interest: 15,
        subvention: 'customer',
        min_amount: 500000,
        merchant_payback: '2.45',
      },
      {
        duration: 6,
        interest: 15,
        subvention: 'customer',
        min_amount: 500000,
        merchant_payback: '4.23',
      },
    ],
    BAJAJ: [
      {
        duration: 3,
        interest: 15,
        subvention: 'merchant',
        min_amount: 400000,
        merchant_payback: '2.45',
      },
      {
        duration: 6,
        interest: 15,
        subvention: 'customer',
        min_amount: 400000,
        merchant_payback: '4.23',
      },
    ],
  },
  cardless_emi: {
    hdfc: true,
    walnut369: true,
    zestmoney: true,
    bajaj: true,
  },
  custom_providers: {
    debit_emi_providers: {
      HDFC: {
        meta: {
          flow: 'pan',
        },
        powered_by: {
          method: 'cardless_emi',
          provider: 'flexmoney',
        },
      },
    },
  },
};

jest.mock('razorpay', () => ({
  ...jest.requireActual('razorpay'),
  getMerchantMethods: jest.fn(),
  getAmount: jest.fn(),
}));

describe('Emi Options list test', () => {
  test('Should return bank emi options', () => {
    getMerchantMethods.mockReturnValue(merchantMethods);
    let amount = 1000000;
    getAmount.mockReturnValue(amount);
    let expectedEmiBanks = [
      {
        code: 'HDFC',
        name: 'HDFC Bank',
        debitEmi: false,
        creditEmi: true,
        isCardless: true,
        isNoCostEMI: true,
        startingFrom: 15,
        icon: 'https://cdn.razorpay.com/bank/HDFC.gif',
        downtimeConfig: {
          downtimeInstrument: 'HDFC',
          severe: '',
        },
        debitCardlessConfig: {
          meta: {
            flow: 'pan',
          },
          powered_by: {
            method: 'cardless_emi',
            provider: 'flexmoney',
          },
        },
        method: 'emi',
      },
      {
        code: 'SBIN',
        name: 'State Bank of India',
        debitEmi: false,
        creditEmi: true,
        isCardless: false,
        isNoCostEMI: false,
        startingFrom: 15,
        icon: 'https://cdn.razorpay.com/bank/SBIN.gif',
        downtimeConfig: {
          downtimeInstrument: 'SBIN',
          severe: '',
        },
        debitCardlessConfig: null,
        method: 'emi',
      },
    ];
    expect(JSON.stringify(getBankEmiOptions(amount))).toBe(
      JSON.stringify(expectedEmiBanks)
    );
    amount = 400000;
    getAmount.mockReturnValue(amount);
    expectedEmiBanks = [
      {
        code: 'HDFC',
        name: 'HDFC Bank',
        debitEmi: false,
        creditEmi: true,
        isCardless: true,
        isNoCostEMI: true,
        startingFrom: 15,
        icon: 'https://cdn.razorpay.com/bank/HDFC.gif',
        downtimeConfig: {
          downtimeInstrument: 'HDFC',
          severe: '',
        },
        debitCardlessConfig: {
          meta: {
            flow: 'pan',
          },
          powered_by: {
            method: 'cardless_emi',
            provider: 'flexmoney',
          },
        },
        method: 'emi',
      },
    ];
    expect(JSON.stringify(getBankEmiOptions(amount))).toBe(
      JSON.stringify(expectedEmiBanks)
    );
    amount = 100000;
    getAmount.mockReturnValue(amount);
    expectedEmiBanks = [];
    expect(JSON.stringify(getBankEmiOptions(amount))).toBe(
      JSON.stringify(expectedEmiBanks)
    );
  });
  test('Should return Cardless EMI providers', () => {
    let amount = 1000000;
    getAmount.mockReturnValue(amount);
    let expctedProviders = [
      {
        data: { code: 'walnut369' },
        section: undefined,
        highlightLabel: undefined,
        icon: 'https://cdn.razorpay.com/cardless_emi-sq/walnut369.svg',
        code: 'walnut369',
        name: 'Axio',
        method: 'cardless_emi',
        isNoCostEMI: false,
      },
      {
        data: { code: 'zestmoney' },
        section: undefined,
        highlightLabel: undefined,
        icon: 'https://cdn.razorpay.com/cardless_emi-sq/zestmoney.svg',
        code: 'zestmoney',
        name: 'ZestMoney',
        method: 'cardless_emi',
        isNoCostEMI: false,
      },
      {
        data: { code: 'bajaj' },
        section: undefined,
        highlightLabel: undefined,
        icon: 'https://cdn.razorpay.com/cardless_emi-sq/bajaj.svg',
        code: 'bajaj',
        name: 'Bajaj Finserv',
        method: 'emi',
        isNoCostEMI: true,
      },
    ];
    expect(JSON.stringify(getAllProviders(amount))).toBe(
      JSON.stringify(expctedProviders)
    );
    amount = 100000;
    getAmount.mockReturnValue(amount);
    expctedProviders = [
      {
        data: { code: 'walnut369' },
        section: undefined,
        highlightLabel: undefined,
        icon: 'https://cdn.razorpay.com/cardless_emi-sq/walnut369.svg',
        code: 'walnut369',
        name: 'Axio',
        method: 'cardless_emi',
        isNoCostEMI: false,
      },
      {
        data: { code: 'zestmoney' },
        section: undefined,
        highlightLabel: undefined,
        icon: 'https://cdn.razorpay.com/cardless_emi-sq/zestmoney.svg',
        code: 'zestmoney',
        name: 'ZestMoney',
        method: 'cardless_emi',
        isNoCostEMI: false,
      },
    ];
    expect(JSON.stringify(getAllProviders(amount))).toBe(
      JSON.stringify(expctedProviders)
    );
  });

  test('Should return Insta Cred providers details from custom providers', () => {
    let selectedBank = 'HDFC';
    let expected = {
      meta: {
        flow: 'pan',
      },
      powered_by: {
        method: 'cardless_emi',
        provider: 'flexmoney',
      },
    };
    let debitCardlessConfig = isDebitEmiProvider(selectedBank);
    expect(JSON.stringify(debitCardlessConfig)).toBe(JSON.stringify(expected));
    selectedBank = 'ICIC';
    debitCardlessConfig = isDebitEmiProvider(selectedBank);
    expect(JSON.stringify(debitCardlessConfig)).toBe('null');
  });

  test('Validate No bank emi', () => {
    const mockMethods = {
      cardless_emi: {
        hdfc: true,
      },
    };
    let amount = 1000000;
    getAmount.mockReturnValue(amount);
    getMerchantMethods.mockReturnValue(mockMethods);
    let expected = JSON.stringify([
      {
        code: 'HDFC',
        name: 'HDFC Bank',
        isCardless: true,
        icon: 'https://cdn.razorpay.com/bank/HDFC.gif',
        debitCardlessConfig: null,
        method: 'cardless_emi',
      },
    ]);
    expect(JSON.stringify(getBankEmiOptions(amount))).toBe(expected);
  });

  test('Validate No bank/cardless emi options', () => {
    const mockMethods = {
      cardless_emi: {
        axio: true,
      },
    };
    let amount = 1000000;
    getAmount.mockReturnValue(amount);
    getMerchantMethods.mockReturnValue(mockMethods);
    expect(JSON.stringify(getBankEmiOptions(amount))).toBe(JSON.stringify([]));
  });

  let mockPrefs = {
    cardless_emi: {
      hdfc: true,
      walnut369: true,
      zestmoney: true,
    },
    custom_providers: {
      debit_emi_providers: {
        HDFC: {
          meta: {
            flow: 'pan',
          },
          powered_by: {
            method: 'cardless_emi',
            provider: 'flexmoney',
          },
        },
      },
    },
  };
  test('If no bank emi is available should return cardless providers', () => {
    let amount = 1000000;
    getMerchantMethods.mockReturnValue(mockPrefs);
    getAmount.mockReturnValue(amount);
    let expctedProviders = [
      {
        data: { code: 'walnut369' },
        section: undefined,
        highlightLabel: undefined,
        icon: 'https://cdn.razorpay.com/cardless_emi-sq/walnut369.svg',
        code: 'walnut369',
        name: 'Axio',
        method: 'cardless_emi',
        isNoCostEMI: false,
      },
      {
        data: { code: 'zestmoney' },
        section: undefined,
        highlightLabel: undefined,
        icon: 'https://cdn.razorpay.com/cardless_emi-sq/zestmoney.svg',
        code: 'zestmoney',
        name: 'ZestMoney',
        method: 'cardless_emi',
        isNoCostEMI: false,
      },
    ];
    expect(JSON.stringify(getAllProviders(amount))).toBe(
      JSON.stringify(expctedProviders)
    );
  });

  test('Should be empty if no providers exist', () => {
    mockPrefs = {};
    getMerchantMethods.mockReturnValue(mockPrefs);
    let expctedProviders = [];
    expect(JSON.stringify(getAllProviders(10000))).toBe(
      JSON.stringify(expctedProviders)
    );
  });
});
