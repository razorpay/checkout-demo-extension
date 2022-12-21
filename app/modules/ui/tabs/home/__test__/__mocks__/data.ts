const cardData = {
  last4: '4111',
  network: 'MasterCard',
  type: 'debit',
  issuer: 'ICIC',
  emi: false,
  expiry_month: '01',
  expiry_year: '2099',
};

export const blockData1 = [
  {
    code: 'rzp.cluster',
    _type: 'block',
    instruments: [
      {
        _type: 'method',
        code: 'card',
        method: 'card',
        id: '1d5e83cc_rzp.cluster_1_0_card_true',
      },
      {
        _type: 'method',
        code: 'upi',
        method: 'upi',
        id: '1d5e83cc_rzp.cluster_1_1_upi_true',
      },
      {
        _type: 'method',
        code: 'netbanking',
        method: 'netbanking',
        id: '1d5e83cc_rzp.cluster_1_2_netbanking_true',
      },
      {
        _type: 'method',
        code: 'wallet',
        method: 'wallet',
        id: '1d5e83cc_rzp.cluster_1_3_wallet_true',
      },
      {
        _type: 'method',
        code: 'cardless_emi',
        method: 'cardless_emi',
        id: '1d5e83cc_rzp.cluster_1_4_cardless_emi_true',
      },
    ],
  },
] as any;

const blockData2 = [
  {
    code: 'rzp.cluster',
    _type: 'block',
    instruments: [
      {
        _type: 'method',
        code: 'upi',
        method: 'upi',
        id: '1d5e83cc_rzp.cluster_1_1_upi_true',
      },
    ],
  },
] as any;

const blockData3 = [
  {
    code: 'rzp.preferred',
    _type: 'block',
    title: 'Preferred Payment Methods',
    instruments: [
      {
        method: 'upi',
        flows: ['qr'],
        id: 'KohZMooBNmKdPf',
        meta: {
          preferred: true,
        },
        skipCTAClick: false,
        section: 'p13n',
        blockTitle: 'Preferred Payment Methods',
      },
      {
        method: 'upi',
        flows: ['collect'],
        vpas: ['88888888884@ybl'],
        id: 'Kod0lsbYfmndnB',
        token_id: 'token_Jym38Npy82wptA',
        meta: {
          preferred: true,
        },
      },
    ],
  },
  {
    code: 'rzp.cluster',
    _type: 'block',
    instruments: [
      {
        _type: 'method',
        code: 'card',
        method: 'card',
        id: '1d5e83cc_rzp.cluster_1_0_card_true',
      },
      {
        _type: 'method',
        code: 'upi',
        method: 'upi',
        id: '1d5e83cc_rzp.cluster_1_1_upi_true',
      },
    ],
  },
] as any;

export const cardInstrumentData = {
  instrument: {
    _ungrouped: [
      {
        method: 'card',
        _type: 'method',
      },
    ],
    method: 'card',
    _type: 'method',
    id: '1d5e83cc_block.banks_1_0_card_true',
  },
};

export const upiCollectData = {
  _ungrouped: [
    {
      vpa: '8888888888@ybl',
      flow: 'collect',
      method: 'upi',
      id: 'Kob9DrAUT2nabc',
      meta: {
        preferred: true,
      },
      token_id: 'token_Kob9EborNPDabc',
    },
  ],
  method: 'upi',
  flows: ['collect'],
  vpas: ['8888888888@ybl'],
  id: 'Kob9DrAUT2nabc',
  token_id: 'token_Kob9EborNPDabc',
  meta: {
    preferred: true,
  },
};

export const upiInstrumentData = {
  _ungrouped: [
    {
      app: 'net.one97.paytm',
      flow: 'intent',
      method: 'upi',
      vendor_vpa: '@paytm',
      meta: {
        preferred: true,
      },
    },
  ],
  method: 'upi',
  flows: ['intent'],
  apps: ['net.one97.paytm'],
  vendor_vpa: '@paytm',
  meta: {
    preferred: true,
  },
  id: '1d5e83cc_rzp.preferred_0_1_upi_false',
};

export const preferredInstrument = {
  method: 'upi',
  flows: ['qr'],
  id: 'KohZMooBNmKdPf',
  meta: {
    preferred: true,
  },
  skipCTAClick: false,
  section: 'p13n',
  blockTitle: 'Preferred Payment Methods',
};
const cardEventdata = {
  block: {
    code: 'rzp.preferred',
    _type: 'block',
    title: 'Preferred Payment Methods',
  },
  consent_taken: false,
  id: 'KHQYLuZRaoYX8e',
  issuers: ['ICIC'],
  meta: { preferred: true },
  method: 'card',
  networks: ['Visa'],
  section: 'p13n',
  skipCTAClick: false,
  token_id: 'token_HMpQW2ILsIXGxA',
  types: ['debit'],
};

const upiEventdata = {
  block: {
    code: 'rzp.preferred',
    _type: 'block',
    title: 'Preferred Payment Methods',
  },
  flows: ['collect'],
  id: 'b740feb2_rzp.preferred_0_0_upi_true',
  meta: { preferred: true },
  method: 'upi',
  section: 'p13n',
  skipCTAClick: false,
  token_id: 'token_GpaXi2JbdnNQo4',
  vpas: ['testupi@ybl'],
};

const walletEventdata = {
  block: {
    code: 'rzp.preferred',
    _type: 'block',
    title: 'Preferred Payment Methods',
  },
  id: 'b740feb2_rzp.preferred_0_0_wallet_true',
  meta: { preferred: true },
  method: 'wallet',
  section: 'p13n',
  skipCTAClick: false,
  wallets: ['FreeCharge'],
};

const netbankingEventdata = {
  block: {
    code: 'rzp.preferred',
    _type: 'block',
    title: 'Preferred Payment Methods',
  },
  id: 'b740feb2_rzp.preferred_0_0_netbanking_true',
  meta: { preferred: true },
  method: 'netbanking',
  section: 'p13n',
  skipCTAClick: false,
  banks: ['SBIN'],
};
export const savecardInstrument = {
  _ungrouped: [
    {
      token_id: 'token_HMpQW2ILsIXGxA',
      type: 'debit',
      issuer: 'ICIC',
      network: 'Visa',
      method: 'card',
      id: 'DlK0TQeEFlUtcH',
      meta: {
        preferred: true,
      },
    },
  ],
  method: 'card',
  types: ['debit'],
  issuers: ['ICIC'],
  networks: ['Visa'],
  id: 'DlK0TQeEFlUtcH',
  token_id: 'token_HMpQW2ILsIXGxA',
  meta: {
    preferred: true,
  },
  consent_taken: true,
};

export const singleBlock = {
  block: {
    code: 'rzp.cluster',
    _type: 'block',
    instruments: [
      {
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
        id: '1d5e83cc_rzp.cluster_1_0_card_true',
      },
      {
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
        id: '1d5e83cc_rzp.cluster_1_1_upi_true',
      },
      {
        _ungrouped: [
          {
            _type: 'method',
            code: 'netbanking',
            method: 'netbanking',
          },
        ],
        _type: 'method',
        code: 'netbanking',
        method: 'netbanking',
        id: '1d5e83cc_rzp.cluster_1_2_netbanking_true',
      },
    ],
  },
};

export const getAvailableMethodsTestCases = [
  {
    name: 'Should return All available Methods instead of Pay later',
    input: blockData1,
    output: ['card', 'upi', 'netbanking', 'wallet', 'cardless_emi'],
  },
  {
    name: 'Should return UPI only',
    input: blockData2,
    output: ['upi'],
  },
];

export const getSectionsDisplayedTestCases = [
  {
    name: 'Should return Preferred and Generic',
    input: blockData3,
    output: ['p13n', 'generic'],
  },
  {
    name: 'Should return [] if empty array pass ',
    input: [],
    output: [],
  },
  {
    name: 'Should return Generic',
    input: blockData2,
    output: ['generic'],
  },
];

export const getInstrumentMetaTestCases = [
  {
    name: 'If no blocks is there it should return empty object',
    input: preferredInstrument,
    block: [],
    output: {},
  },
  {
    name: 'for valid block it should return valid data',
    input: preferredInstrument,
    block: blockData3,
    output: {
      indexOfBlock: 1,
      indexInBlock: 1,
      indexInInstruments: 1,
      block: {
        code: 'rzp.preferred',
        title: 'Preferred Payment Methods',
      },
    },
  },
];

export const getOrderedBlockDataTestCases = [
  {
    name: 'if no data pass should return empty object',
    input: null,
    output: {},
  },
  {
    name: 'if no data pass should return empty object',
    input: blockData2,
    output: {
      'rzp.cluster': {
        order: 1,
        category: 'generic',
        name: 'Pay via UPI',
        custom: false,
        instruments: {
          1: {
            order: 1,
            method: 'upi',
          },
        },
      },
    },
  },
];

export const addConsentDetailsToInstrumentTestCases = [
  {
    name: 'Should return false when card consent is false',
    input: {
      instrument: {
        consent_taken: true,
      },
      card: {
        consent_taken: false,
      },
    },
  },
  {
    name: 'Should return true when card consent is true',
    input: {
      instrument: {
        consent_taken: true,
      },
      card: {
        consent_taken: false,
      },
    },
  },
];

export const getInstrumentDetailsTestCases = [
  {
    name: 'verify event data for card',
    input: cardEventdata,
    output: {
      issuer: 'ICIC',
      personalisation: true,
      saved: true,
      type: 'debit',
      network: 'Visa',
    },
  },
  {
    name: 'verify event data for upi',
    input: upiEventdata,
    output: {
      name: 'PhonePe',
      personalisation: true,
      saved: true,
      type: 'collect',
      vpa: '@ybl',
    },
  },
  {
    name: 'verify event data for wallet',
    input: walletEventdata,
    output: {
      name: 'FreeCharge',
      personalisation: true,
      saved: false,
    },
  },
  {
    name: 'verify event data for netbanking',
    input: netbankingEventdata,
    output: {
      name: 'SBIN',
      personalisation: true,
      saved: false,
    },
  },
];

export const getBlockTitleTestCases = [
  {
    name: 'Should return Two methods names and More if more than 3 methods',
    input: blockData1[0].instruments,
    output: 'Cards, UPI & More',
  },
  {
    name: 'Should return methods name only if less than 3 methods ',
    input: blockData3[1].instruments,
    output: 'Cards and UPI',
  },
  {
    name: 'Should return Pay Via method if 1 method',
    input: blockData2[0].instruments,
    output: 'Pay via UPI',
  },
];

export const getBanktextTestCases = [
  {
    name: 'Should return ICIC Bank with card number',
    input: cardData,
    banks: {
      HSBC: 'HSBC',
      ICIC: 'ICICI Bank',
      ICIC_C: 'ICICI Bank - Corporate Banking',
      IBKL: 'IDBI',
      IDFB: 'IDFC FIRST Bank',
      IDIB: 'Indian Bank',
      YESB: 'Yes Bank',
    },
    output: 'ICICI Debit card - 4111',
  },
  {
    name: 'Should return Without Bank Name ',
    input: cardData,
    banks: {},
    output: ' Debit card - 4111',
  },
];
