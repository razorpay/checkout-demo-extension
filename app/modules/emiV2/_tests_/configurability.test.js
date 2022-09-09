import {
  filterBanksAgainstInstrument,
  filterCardlessAgainstInstrument,
} from 'emiV2/helper/emiOptions';

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
    expect(JSON.stringify(filterBanksAgainstInstrument(payload))).toBe(
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
    expect(JSON.stringify(filterBanksAgainstInstrument(payload))).toBe(
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
        filterCardlessAgainstInstrument(CardlessOptions, instrument)
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
        filterCardlessAgainstInstrument(CardlessOptions, instrument)
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
    expect(JSON.stringify(filterBanksAgainstInstrument(payload))).toBe(
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
    expect(JSON.stringify(filterBanksAgainstInstrument(payload))).toBe(
      JSON.stringify(expected)
    );
  });
});
