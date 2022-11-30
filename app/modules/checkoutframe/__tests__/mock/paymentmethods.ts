export const allMethodsExpectedValue = [
  'card',
  'upi',
  'netbanking',
  'wallet',
  'upi_otm',
  'gpay',
  'emi',
  'cardless_emi',
  'qr',
  'paylater',
  'paypal',
  'bank_transfer',
  'offline_challan',
  'nach',
  'app',
  'emandate',
  'cod',
  'international',
  'intl_bank_transfer',
  'fpx',
];

export const emiBanks = {
  HDFC: {
    code: 'HDFC',
    name: 'HDFC Credit Cards',
    plans: {
      '3': {
        duration: 3,
        interest: 16,
        subvention: 'customer',
        min_amount: 300000,
        merchant_payback: '2.61',
      },
    },
    min_amount: 300000,
  },
  HDFC_DC: {
    code: 'HDFC_DC',
    name: 'HDFC Debit Cards',
    plans: {
      '3': {
        duration: 3,
        interest: 16,
        subvention: 'customer',
        min_amount: 500000,
        merchant_payback: '2.61',
      },
      '6': {
        duration: 6,
        interest: 16,
        subvention: 'customer',
        min_amount: 500000,
        merchant_payback: '4.51',
      },
      '9': {
        duration: 9,
        interest: 16,
        subvention: 'customer',
        min_amount: 500000,
        merchant_payback: '6.35',
      },
      '12': {
        duration: 12,
        interest: 16,
        subvention: 'customer',
        min_amount: 500000,
        merchant_payback: '8.15',
      },
      '18': {
        duration: 18,
        interest: 16,
        subvention: 'customer',
        min_amount: 500000,
        merchant_payback: '11.62',
      },
    },
    min_amount: 500000,
  },
  KKBK: {
    code: 'KKBK',
    name: 'Kotak Mahindra Bank',
    plans: {
      '3': {
        duration: 3,
        interest: 12,
        subvention: 'customer',
        min_amount: 300000,
        merchant_payback: '1.97',
      },
      '6': {
        duration: 6,
        interest: 13,
        subvention: 'customer',
        min_amount: 300000,
        merchant_payback: '3.68',
      },
      '9': {
        duration: 9,
        interest: 14,
        subvention: 'customer',
        min_amount: 300000,
        merchant_payback: '5.59',
      },
      '12': {
        duration: 12,
        interest: 14,
        subvention: 'customer',
        min_amount: 300000,
        merchant_payback: '7.19',
      },
      '18': {
        duration: 18,
        interest: 15,
        subvention: 'customer',
        min_amount: 300000,
        merchant_payback: '10.95',
      },
      '24': {
        duration: 24,
        interest: 15,
        subvention: 'customer',
        min_amount: 300000,
        merchant_payback: '14.07',
      },
    },
    min_amount: 300000,
  },
  UTIB: {
    code: 'UTIB',
    name: 'Axis Bank',
    plans: {
      '3': {
        duration: 3,
        interest: 13,
        subvention: 'customer',
        min_amount: 300000,
        merchant_payback: '2.13',
      },
      '6': {
        duration: 6,
        interest: 13,
        subvention: 'customer',
        min_amount: 300000,
        merchant_payback: '3.68',
      },
      '9': {
        duration: 9,
        interest: 14,
        subvention: 'customer',
        min_amount: 300000,
        merchant_payback: '5.59',
      },
      '12': {
        duration: 12,
        interest: 14,
        subvention: 'customer',
        min_amount: 300000,
        merchant_payback: '7.19',
      },
      '18': {
        duration: 18,
        interest: 15,
        subvention: 'customer',
        min_amount: 300000,
        merchant_payback: '10.95',
      },
      '24': {
        duration: 24,
        interest: 15,
        subvention: 'customer',
        min_amount: 300000,
        merchant_payback: '14.07',
      },
    },
    min_amount: 300000,
  },
  RATN: {
    code: 'RATN',
    name: 'RBL Bank',
    plans: {
      '3': {
        duration: 3,
        interest: 13,
        subvention: 'customer',
        min_amount: 100000,
        merchant_payback: '2.13',
      },
      '6': {
        duration: 6,
        interest: 14,
        subvention: 'customer',
        min_amount: 100000,
        merchant_payback: '3.96',
      },
      '9': {
        duration: 9,
        interest: 15,
        subvention: 'customer',
        min_amount: 100000,
        merchant_payback: '5.97',
      },
      '12': {
        duration: 12,
        interest: 15,
        subvention: 'customer',
        min_amount: 100000,
        merchant_payback: '7.67',
      },
      '18': {
        duration: 18,
        interest: 15,
        subvention: 'customer',
        min_amount: 100000,
        merchant_payback: '10.95',
      },
      '24': {
        duration: 24,
        interest: 15,
        subvention: 'customer',
        min_amount: 100000,
        merchant_payback: '14.07',
      },
    },
    min_amount: 100000,
  },
  SCBL: {
    code: 'SCBL',
    name: 'Standard Chartered Bank',
    plans: {
      '3': {
        duration: 3,
        interest: 11.88,
        subvention: 'customer',
        min_amount: 250000,
        merchant_payback: '1.95',
      },
      '6': {
        duration: 6,
        interest: 13,
        subvention: 'customer',
        min_amount: 250000,
        merchant_payback: '3.68',
      },
      '9': {
        duration: 9,
        interest: 14,
        subvention: 'customer',
        min_amount: 250000,
        merchant_payback: '5.59',
      },
      '12': {
        duration: 12,
        interest: 14,
        subvention: 'customer',
        min_amount: 250000,
        merchant_payback: '7.19',
      },
    },
    min_amount: 250000,
  },
  BARB: {
    code: 'BARB',
    name: 'Bank of Baroda',
    plans: {
      '3': {
        duration: 3,
        interest: 13,
        subvention: 'customer',
        min_amount: 250000,
        merchant_payback: '2.13',
      },
      '6': {
        duration: 6,
        interest: 14,
        subvention: 'customer',
        min_amount: 250000,
        merchant_payback: '3.96',
      },
      '9': {
        duration: 9,
        interest: 14,
        subvention: 'customer',
        min_amount: 250000,
        merchant_payback: '5.59',
      },
      '12': {
        duration: 12,
        interest: 15,
        subvention: 'customer',
        min_amount: 250000,
        merchant_payback: '7.67',
      },
      '18': {
        duration: 18,
        interest: 15,
        subvention: 'customer',
        min_amount: 250000,
        merchant_payback: '10.95',
      },
      '24': {
        duration: 24,
        interest: 16,
        subvention: 'customer',
        min_amount: 250000,
        merchant_payback: '14.90',
      },
    },
    min_amount: 250000,
  },
  SBIN: {
    code: 'SBIN',
    name: 'State Bank of India',
    plans: {
      '3': {
        duration: 3,
        interest: 14,
        subvention: 'customer',
        min_amount: 300000,
        merchant_payback: '2.29',
      },
      '6': {
        duration: 6,
        interest: 14,
        subvention: 'customer',
        min_amount: 300000,
        merchant_payback: '3.96',
      },
      '9': {
        duration: 9,
        interest: 14,
        subvention: 'customer',
        min_amount: 250000,
        merchant_payback: '5.59',
      },
      '12': {
        duration: 12,
        interest: 14,
        subvention: 'customer',
        min_amount: 250000,
        merchant_payback: '7.19',
      },
    },
    min_amount: 250000,
  },
  YESB: {
    code: 'YESB',
    name: 'Yes Bank',
    plans: {
      '3': {
        duration: 3,
        interest: 14,
        subvention: 'customer',
        min_amount: 150000,
        merchant_payback: '2.29',
      },
      '6': {
        duration: 6,
        interest: 14,
        subvention: 'customer',
        min_amount: 150000,
        merchant_payback: '3.96',
      },
      '9': {
        duration: 9,
        interest: 14,
        subvention: 'customer',
        min_amount: 150000,
        merchant_payback: '5.59',
      },
      '12': {
        duration: 12,
        interest: 15,
        subvention: 'customer',
        min_amount: 150000,
        merchant_payback: '7.67',
      },
      '18': {
        duration: 18,
        interest: 15,
        subvention: 'customer',
        min_amount: 150000,
        merchant_payback: '10.95',
      },
      '24': {
        duration: 24,
        interest: 15,
        subvention: 'customer',
        min_amount: 150000,
        merchant_payback: '14.07',
      },
    },
    min_amount: 150000,
  },
  CITI: {
    code: 'CITI',
    name: 'CITI Bank',
    plans: {
      '3': {
        duration: 3,
        interest: 13,
        subvention: 'customer',
        min_amount: 250000,
        merchant_payback: '2.13',
      },
      '6': {
        duration: 6,
        interest: 13,
        subvention: 'customer',
        min_amount: 250000,
        merchant_payback: '3.68',
      },
      '9': {
        duration: 9,
        interest: 15,
        subvention: 'customer',
        min_amount: 250000,
        merchant_payback: '5.97',
      },
      '12': {
        duration: 12,
        interest: 15,
        subvention: 'customer',
        min_amount: 250000,
        merchant_payback: '7.67',
      },
      '18': {
        duration: 18,
        interest: 15,
        subvention: 'customer',
        min_amount: 250000,
        merchant_payback: '10.95',
      },
      '24': {
        duration: 24,
        interest: 15,
        subvention: 'customer',
        min_amount: 250000,
        merchant_payback: '14.07',
      },
    },
    min_amount: 250000,
  },
  AMEX: {
    code: 'AMEX',
    name: 'American Express',
    plans: {
      '3': {
        duration: 3,
        interest: 14,
        subvention: 'customer',
        min_amount: 500000,
        merchant_payback: '2.29',
      },
      '6': {
        duration: 6,
        interest: 14,
        subvention: 'customer',
        min_amount: 500000,
        merchant_payback: '3.96',
      },
      '9': {
        duration: 9,
        interest: 14,
        subvention: 'customer',
        min_amount: 500000,
        merchant_payback: '5.59',
      },
      '12': {
        duration: 12,
        interest: 14,
        subvention: 'customer',
        min_amount: 500000,
        merchant_payback: '7.19',
      },
      '18': {
        duration: 18,
        interest: 14,
        subvention: 'customer',
        min_amount: 500000,
        merchant_payback: '10.27',
      },
      '24': {
        duration: 24,
        interest: 14,
        subvention: 'customer',
        min_amount: 500000,
        merchant_payback: '13.22',
      },
    },
    min_amount: 500000,
  },
  INDB: {
    code: 'INDB',
    name: 'Indusind Bank',
    plans: {
      '3': {
        duration: 3,
        interest: 13,
        subvention: 'customer',
        min_amount: 200000,
        merchant_payback: '2.13',
      },
      '6': {
        duration: 6,
        interest: 13,
        subvention: 'customer',
        min_amount: 200000,
        merchant_payback: '3.68',
      },
      '9': {
        duration: 9,
        interest: 14,
        subvention: 'customer',
        min_amount: 200000,
        merchant_payback: '5.59',
      },
      '12': {
        duration: 12,
        interest: 14,
        subvention: 'customer',
        min_amount: 200000,
        merchant_payback: '7.19',
      },
      '18': {
        duration: 18,
        interest: 15,
        subvention: 'customer',
        min_amount: 200000,
        merchant_payback: '10.95',
      },
      '24': {
        duration: 24,
        interest: 15,
        subvention: 'customer',
        min_amount: 200000,
        merchant_payback: '14.07',
      },
    },
    min_amount: 200000,
  },
  HSBC: {
    code: 'HSBC',
    name: 'HSBC Credit Cards',
    plans: {
      '3': {
        duration: 3,
        interest: 12.5,
        subvention: 'customer',
        min_amount: 200000,
        merchant_payback: '2.05',
      },
      '6': {
        duration: 6,
        interest: 12.5,
        subvention: 'customer',
        min_amount: 200000,
        merchant_payback: '3.55',
      },
      '9': {
        duration: 9,
        interest: 13.5,
        subvention: 'customer',
        min_amount: 200000,
        merchant_payback: '5.40',
      },
      '12': {
        duration: 12,
        interest: 13.5,
        subvention: 'customer',
        min_amount: 200000,
        merchant_payback: '6.94',
      },
      '18': {
        duration: 18,
        interest: 13.5,
        subvention: 'customer',
        min_amount: 200000,
        merchant_payback: '9.93',
      },
    },
    min_amount: 200000,
  },
  onecard: {
    code: 'onecard',
    name: 'OneCard',
    plans: {
      '3': {
        duration: 3,
        interest: 16,
        subvention: 'customer',
        min_amount: 250000,
        merchant_payback: '2.61',
      },
      '6': {
        duration: 6,
        interest: 16,
        subvention: 'customer',
        min_amount: 250000,
        merchant_payback: '4.51',
      },
      '9': {
        duration: 9,
        interest: 16,
        subvention: 'customer',
        min_amount: 250000,
        merchant_payback: '6.35',
      },
      '12': {
        duration: 12,
        interest: 16,
        subvention: 'customer',
        min_amount: 250000,
        merchant_payback: '8.15',
      },
      '18': {
        duration: 18,
        interest: 16,
        subvention: 'customer',
        min_amount: 250000,
        merchant_payback: '11.62',
      },
      '24': {
        duration: 24,
        interest: 16,
        subvention: 'customer',
        min_amount: 250000,
        merchant_payback: '14.90',
      },
    },
    min_amount: 250000,
  },
  ICIC: {
    code: 'ICIC',
    name: 'ICICI Bank',
    plans: {
      '3': {
        duration: 3,
        interest: 14.99,
        subvention: 'customer',
        min_amount: 150000,
        merchant_payback: '2.45',
      },
      '6': {
        duration: 6,
        interest: 14.99,
        subvention: 'customer',
        min_amount: 150000,
        merchant_payback: '4.23',
      },
      '9': {
        duration: 9,
        interest: 14.99,
        subvention: 'customer',
        min_amount: 150000,
        merchant_payback: '5.97',
      },
      '12': {
        duration: 12,
        interest: 14.99,
        subvention: 'customer',
        min_amount: 150000,
        merchant_payback: '7.67',
      },
      '18': {
        duration: 18,
        interest: 14.99,
        subvention: 'customer',
        min_amount: 150000,
        merchant_payback: '10.94',
      },
      '24': {
        duration: 24,
        interest: 14.99,
        subvention: 'customer',
        min_amount: 150000,
        merchant_payback: '14.06',
      },
    },
    min_amount: 150000,
  },
};

export const expectedEMIBankText =
  'HDFC Credit Cards, HDFC Debit Cards, Kotak Mahindra Bank, Axis Bank, RBL Bank, Standard Chartered Bank, Bank of Baroda, State Bank of India, Yes Bank, CITI Bank, American Express, Indusind Bank, HSBC Credit Cards, OneCard, and ICICI Bank';
