import { hiddenMethods } from 'checkoutstore/screens/home';
import {
  filterCardlessProvidersAgainstCustomBlock,
  filterEmiBanksAgainstCustomBlock,
  filterHiddenEmiProviders,
  hideRestrictedProviders,
  isEmiMethodHidden,
} from 'emiV2/helper/configurability';
import { getAmount, getMerchantMethods } from 'razorpay';
import { getAllProviders, getBankEmiOptions } from 'emiV2/helper/emiOptions';

const emi_options = {
  HDFC: [
    {
      duration: 3,
      interest: 15,
      subvention: 'merchant',
      min_amount: 300000,
      merchant_payback: '2.45',
    },
  ],
  SBIN: [
    {
      duration: 3,
      interest: 15,
      subvention: 'customer',
      min_amount: 300000,
      merchant_payback: '2.45',
    },
  ],
  KKBK: [
    {
      duration: 3,
      interest: 15,
      subvention: 'customer',
      min_amount: 300000,
      merchant_payback: '2.45',
    },
  ],
};

let bankEMIOPtions = [
  {
    code: 'HDFC',
    creditEmi: true,
    isCardless: true,
  },
  {
    code: 'SBIN',
    creditEmi: true,
    isCardless: false,
  },
  {
    code: 'FDRL',
    creditEmi: false,
    isCardless: true,
  },
];

let CardlessOptions = [
  {
    code: 'zestmoney',
  },
  {
    code: 'earlysalary',
  },
  {
    code: 'bajaj',
  },
];

let cardlessProviders = {
  fdrl: {},
  hdfc: {},
  zestmoney: {},
  earlysalary: {},
};

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
    ],
    ICIC: [
      {
        duration: 3,
        interest: 15,
        subvention: 'customer',
        min_amount: 500000,
        merchant_payback: '2.45',
      },
    ],
  },
  cardless_emi: {
    hdfc: true,
    walnut369: true,
    fdrl: true,
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

describe('Custom config instruments', () => {
  test('method: emi', () => {
    let expected;
    let instrument;
    let payload;
    expected = [
      {
        code: 'HDFC',
        creditEmi: true,
        isCardless: true,
      },
      {
        code: 'SBIN',
        creditEmi: true,
        isCardless: false,
      },
    ];
    instrument = {
      method: 'emi',
    };
    payload = {
      emiBankList: bankEMIOPtions,
      instrument,
      emiBanksProviders: emi_options,
      cardlessEmiProviders: cardlessProviders,
    };
    expect(JSON.stringify(filterEmiBanksAgainstCustomBlock(payload))).toBe(
      JSON.stringify(expected)
    );
    expected = [
      {
        code: 'HDFC',
        creditEmi: true,
        isCardless: true,
      },
    ];
    instrument = {
      method: 'emi',
      issuers: ['HDFC'],
    };
    payload.instrument = instrument;
    expect(JSON.stringify(filterEmiBanksAgainstCustomBlock(payload))).toBe(
      JSON.stringify(expected)
    );
  });

  test('method: cardless_emi', () => {
    let expected;
    let instrument;
    let payload;
    expected = [
      {
        code: 'zestmoney',
      },
      {
        code: 'earlysalary',
      },
    ];
    instrument = {
      method: 'cardless_emi',
    };
    expect(
      JSON.stringify(
        filterCardlessProvidersAgainstCustomBlock(CardlessOptions, instrument)
      )
    ).toBe(JSON.stringify(expected));
    expected = [
      {
        code: 'zestmoney',
      },
    ];
    instrument = {
      method: 'cardless_emi',
      providers: ['zestmoney'],
    };
    expect(
      JSON.stringify(
        filterCardlessProvidersAgainstCustomBlock(CardlessOptions, instrument)
      )
    ).toBe(JSON.stringify(expected));
    expected = [
      {
        code: 'HDFC',
        creditEmi: true,
        isCardless: true,
      },
      {
        code: 'FDRL',
        creditEmi: false,
        isCardless: true,
      },
    ];
    instrument = {
      method: 'cardless_emi',
    };
    payload = {
      emiBankList: bankEMIOPtions,
      instrument,
      emiBanksProviders: emi_options,
    };
    expect(JSON.stringify(filterEmiBanksAgainstCustomBlock(payload))).toBe(
      JSON.stringify(expected)
    );
    expected = [
      {
        code: 'HDFC',
        creditEmi: true,
        isCardless: true,
      },
    ];
    instrument = {
      method: 'cardless_emi',
      providers: ['hdfc'],
    };
    payload = {
      emiBankList: bankEMIOPtions,
      instrument,
      emiBanksProviders: emi_options,
    };
    expect(JSON.stringify(filterEmiBanksAgainstCustomBlock(payload))).toBe(
      JSON.stringify(expected)
    );
  });
});

describe('Validate: hideRestrictedProviders', () => {
  beforeEach(() => {
    hiddenMethods.set([]);
  });
  test('Provider should not include bajaj/onecard if emi method is restricted', () => {
    hiddenMethods.set(['emi']);
    let expected = [
      {
        code: 'zestmoney',
      },
      {
        code: 'earlysalary',
      },
    ];
    expect(JSON.stringify(hideRestrictedProviders(CardlessOptions))).toBe(
      JSON.stringify(expected)
    );
  });

  test('Provider should not include cardless provider if cardless emi method is restricted', () => {
    hiddenMethods.set(['cardless_emi']);
    let expected = [
      {
        code: 'bajaj',
      },
    ];
    expect(JSON.stringify(hideRestrictedProviders(CardlessOptions))).toBe(
      JSON.stringify(expected)
    );
  });
});

describe('Validate: isEmiMethodHidden', () => {
  beforeEach(() => {
    hiddenMethods.set([]);
  });

  test('Provided method is hidden', () => {
    let method = 'emi';
    expect(isEmiMethodHidden(method)).toBe(false);

    hiddenMethods.set(method);
    expect(isEmiMethodHidden(method)).toBe(true);

    method = 'cardless_emi';
    expect(isEmiMethodHidden(method)).toBe(false);

    hiddenMethods.set(method);
    expect(isEmiMethodHidden(method)).toBe(true);
  });
});

describe('Validate: Hidden config providers filtering', () => {
  beforeEach(() => {
    hiddenMethods.set([]);
  });

  getMerchantMethods.mockReturnValue(merchantMethods);
  let amount = 1000000;
  getAmount.mockReturnValue(amount);

  test('if emi method is hidden only cardless emi bank and cardless emi providers should be returned', () => {
    hiddenMethods.set(['emi']);
    // Icici bank will be filtered out from the function as it is only credit emi provider
    let expectedBankProviders = [
      {
        code: 'HDFC',
        name: 'HDFC Bank',
        debitEmi: false,
        creditEmi: false,
        isCardless: true,
        isNoCostEMI: true,
        startingFrom: null,
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
        code: 'FDRL',
        name: 'Federal Bank',
        isCardless: true,
        icon: 'https://cdn.razorpay.com/bank/FDRL.gif',
        debitCardlessConfig: null,
        method: 'cardless_emi',
        debitEmi: false,
        creditEmi: false,
        startingFrom: null,
      },
    ];

    const expectedCardlessProviders = [
      {
        data: {
          code: 'walnut369',
        },
        icon: 'https://cdn.razorpay.com/cardless_emi-sq/walnut369.svg',
        code: 'walnut369',
        name: 'axio',
        method: 'cardless_emi',
        isNoCostEMI: false,
      },
    ];

    const emiProviders = getBankEmiOptions(amount);
    expect(JSON.stringify(emiProviders)).toBe(
      JSON.stringify(expectedBankProviders)
    );
    const cardlessProvider = getAllProviders(amount);
    expect(JSON.stringify(cardlessProvider)).toBe(
      JSON.stringify(expectedCardlessProviders)
    );
  });

  test('if cardless emi method is hidden only bank emi providers should be returned', () => {
    hiddenMethods.set(['cardless_emi']);

    // FDRL bank should be filtered out from bank emi provider since it's only cardless emi provider
    let expectedBankProviders = [
      {
        code: 'HDFC',
        name: 'HDFC Bank',
        debitEmi: false,
        creditEmi: true,
        isCardless: false,
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
        code: 'ICIC',
        name: 'ICICI Bank',
        debitEmi: false,
        creditEmi: true,
        isCardless: false,
        isNoCostEMI: false,
        startingFrom: 15,
        icon: 'https://cdn.razorpay.com/bank/ICIC.gif',
        downtimeConfig: {
          downtimeInstrument: 'ICIC',
          severe: '',
        },
        debitCardlessConfig: null,
        method: 'emi',
      },
    ];

    const emiProviders = getBankEmiOptions(amount);
    expect(JSON.stringify(emiProviders)).toBe(
      JSON.stringify(expectedBankProviders)
    );
    const cardlessProvider = getAllProviders(amount);
    expect(JSON.stringify(cardlessProvider)).toBe(JSON.stringify([]));
  });
});

describe('Validate: filterHiddenEmiProviders', () => {
  const emiBanks = [
    {
      code: 'HDFC',
      name: 'HDFC bank',
      creditEmi: true,
      debitEmi: true,
      isCardless: true,
      startingFrom: 10,
    },
    {
      code: 'ICIC',
      name: 'ICICI bank',
      creditEmi: true,
      debitEmi: false,
      isCardless: true,
      startingFrom: 12,
    },
  ];

  beforeEach(() => {
    hiddenMethods.set([]);
  });

  test('Only cardless emi should be enabled on the provider -> isCardless should be true and debit/credit emi should be false', () => {
    hiddenMethods.set(['emi']);
    let expected = [
      {
        code: 'HDFC',
        name: 'HDFC bank',
        creditEmi: false,
        debitEmi: false,
        isCardless: true,
        startingFrom: null,
      },
      {
        code: 'ICIC',
        name: 'ICICI bank',
        creditEmi: false,
        debitEmi: false,
        isCardless: true,
        startingFrom: null,
      },
    ];
    expect(JSON.stringify(filterHiddenEmiProviders(emiBanks))).toBe(
      JSON.stringify(expected)
    );
  });

  test('Only credit/debit emi should be enabled on the provider => isCardless should be false', () => {
    hiddenMethods.set(['cardless_emi']);
    let expected = [
      {
        code: 'HDFC',
        name: 'HDFC bank',
        creditEmi: true,
        debitEmi: true,
        isCardless: false,
        startingFrom: 10,
      },
      {
        code: 'ICIC',
        name: 'ICICI bank',
        creditEmi: true,
        debitEmi: false,
        isCardless: false,
        startingFrom: 12,
      },
    ];
    expect(JSON.stringify(filterHiddenEmiProviders(emiBanks))).toBe(
      JSON.stringify(expected)
    );
  });
});
