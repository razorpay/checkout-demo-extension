import {
  isCoBrandingEmiProvider,
  isOtherCardEmiProvider,
  isSelectedBankBajaj,
} from 'emiV2/helper/helper';
import { selectedBank } from 'emiV2/store';
import { getEMIStartingAt, isNoCostEMI } from '../helper/label';
import { filterTabsAgainstInstrument, getEmiTabs } from '../helper/tabs';

const testPlans = {
  3: {
    duration: 3,
    interest: 12,
    subvention: 'merchant',
    min_amount: 300000,
    merchant_payback: '1.97',
  },
  6: {
    duration: 6,
    interest: 12,
    subvention: 'customer',
    min_amount: 300000,
    merchant_payback: '3.41',
  },
  9: {
    duration: 9,
    interest: 14,
    subvention: 'customer',
    min_amount: 300000,
    merchant_payback: '5.59',
  },
  12: {
    duration: 12,
    interest: 14,
    subvention: 'customer',
    min_amount: 300000,
    merchant_payback: '7.19',
  },
  18: {
    duration: 18,
    interest: 15,
    subvention: 'customer',
    min_amount: 300000,
    merchant_payback: '10.95',
  },
  24: {
    duration: 24,
    interest: 15,
    subvention: 'customer',
    min_amount: 300000,
    merchant_payback: '14.07',
  },
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
      {
        duration: 6,
        interest: 15,
        subvention: 'customer',
        min_amount: 300000,
        merchant_payback: '4.23',
      },
    ],
    SBI: [
      {
        duration: 3,
        interest: 15,
        subvention: 'customer',
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
};

jest.mock('razorpay', () => ({
  ...jest.requireActual('razorpay'),
  getMerchantMethods: () => merchantMethods,
}));

describe('EMI tiles test', () => {
  test('Show no cost label if subvention is merchant for any plan', () => {
    expect(isNoCostEMI(10000, 'HDFC')).toBe(false);
  });
  test('Starting at label should contain the lowest interest value', () => {
    expect(getEMIStartingAt(testPlans)).toBe(12);
  });
});

describe('EMI tabs test', () => {
  test('Show both cardless and debit card tab if enabled', () => {
    selectedBank.set({
      code: 'HDFC',
      name: 'HDFC Credit Cards',
      debitEmi: true,
      creditEmi: true,
      isCardless: true,
      isNoCostEMI: true,
      startingFrom: 15,
      debitCardlessConfig: {
        meta: {
          flow: 'pan',
        },
        powered_by: {
          method: 'cardless_emi',
          provider: 'flexmoney',
        },
      },
    });
    const expectedTabs = [
      {
        label: 'Credit',
        value: 'credit',
      },
      {
        label: 'Debit',
        value: 'debit',
      },
      {
        label: 'Cardless',
        value: 'cardless',
      },
    ];
    expect(JSON.stringify(getEmiTabs())).toBe(JSON.stringify(expectedTabs));
  });

  test('Should have cardless & debit card option if present', () => {
    selectedBank.set({
      code: 'HDFC',
      name: 'HDFC Credit Cards',
      debitEmi: false,
      creditEmi: true,
      isCardless: true,
      isNoCostEMI: true,
      startingFrom: 15,
      debitCardlessConfig: {
        meta: {
          flow: 'pan',
        },
        powered_by: {
          method: 'cardless_emi',
          provider: 'flexmoney',
        },
      },
    });
    let expectedTabs = [
      {
        label: 'Credit',
        value: 'credit',
      },
      {
        label: 'Debit & Cardless',
        value: 'debit_cardless',
      },
    ];
    expect(JSON.stringify(getEmiTabs())).toBe(JSON.stringify(expectedTabs));
    selectedBank.set({
      code: 'HDFC',
      name: 'HDFC Credit Cards',
      debitEmi: false,
      creditEmi: false,
      isCardless: true,
      isNoCostEMI: true,
      startingFrom: 15,
      debitCardlessConfig: {
        meta: {
          flow: 'pan',
        },
        powered_by: {
          method: 'cardless_emi',
          provider: 'flexmoney',
        },
      },
    });
    expectedTabs = [
      {
        label: 'Debit & Cardless',
        value: 'debit_cardless',
      },
    ];
    expect(JSON.stringify(getEmiTabs())).toBe(JSON.stringify(expectedTabs));
  });

  test('Should show debit&cardless tab if present in preferences', () => {
    selectedBank.set({
      code: 'HDFC',
      name: 'HDFC Credit Cards',
      debitEmi: true,
      creditEmi: true,
      isCardless: false,
      isNoCostEMI: true,
      startingFrom: 15,
    });
    const expectedTabs = [
      {
        label: 'Credit',
        value: 'credit',
      },
      {
        label: 'Debit',
        value: 'debit',
      },
    ];
    expect(JSON.stringify(getEmiTabs())).toBe(JSON.stringify(expectedTabs));
  });

  test('Should show debit&cardless tab if cardless is false', () => {
    selectedBank.set({
      code: 'HDFC',
      name: 'HDFC Credit Cards',
      debitEmi: true,
      creditEmi: true,
      isCardless: false,
      isNoCostEMI: true,
      startingFrom: 15,
      debitCardlessConfig: {
        meta: {
          flow: 'pan',
        },
        powered_by: {
          method: 'cardless_emi',
          provider: 'flexmoney',
        },
      },
    });
    let expectedTabs = [
      {
        label: 'Credit',
        value: 'credit',
      },
      {
        label: 'Debit',
        value: 'debit',
      },
    ];
    expect(JSON.stringify(getEmiTabs())).toBe(JSON.stringify(expectedTabs));

    selectedBank.set({
      code: 'HDFC',
      name: 'HDFC Credit Cards',
      debitEmi: false,
      creditEmi: true,
      isCardless: true,
      isNoCostEMI: true,
      startingFrom: 15,
      debitCardlessConfig: {
        meta: {
          flow: 'pan',
        },
        powered_by: {
          method: 'cardless_emi',
          provider: 'flexmoney',
        },
      },
    });
    expectedTabs = [
      {
        label: 'Credit',
        value: 'credit',
      },
      {
        label: 'Debit & Cardless',
        value: 'debit_cardless',
      },
    ];
    expect(JSON.stringify(getEmiTabs())).toBe(JSON.stringify(expectedTabs));

    selectedBank.set({
      code: 'HDFC',
      name: 'HDFC Credit Cards',
      debitEmi: false,
      creditEmi: true,
      isCardless: true,
      isNoCostEMI: true,
      startingFrom: 15,
    });
    expectedTabs = [
      {
        label: 'Credit',
        value: 'credit',
      },
      {
        label: 'Cardless',
        value: 'cardless',
      },
    ];
    expect(JSON.stringify(getEmiTabs())).toBe(JSON.stringify(expectedTabs));
  });

  test('Tabs if user comes from custom config emi block', () => {
    selectedBank.set({
      code: 'HDFC',
      name: 'HDFC Credit Cards',
      debitEmi: true,
      creditEmi: true,
      isCardless: true,
      isNoCostEMI: true,
      startingFrom: 15,
    });
    const expectedTabs = [
      {
        label: 'Credit',
        value: 'credit',
      },
      {
        label: 'Debit',
        value: 'debit',
      },
    ];
    const instrument = {
      method: 'emi',
    };
    expect(JSON.stringify(getEmiTabs(instrument))).toBe(
      JSON.stringify(expectedTabs)
    );
  });

  test('Tabs filtered with instrument', () => {
    let tabs = [
      {
        label: 'Credit',
        value: 'credit',
      },
      {
        label: 'Debit',
        value: 'debit',
      },
      {
        label: 'Debit&Cardless',
        value: 'debit_cardless',
      },
    ];

    let expectedTabs = [
      {
        label: 'Credit',
        value: 'credit',
      },
      {
        label: 'Debit',
        value: 'debit',
      },
    ];

    let instrument = {
      method: 'emi',
    };

    expect(JSON.stringify(filterTabsAgainstInstrument(tabs, instrument))).toBe(
      JSON.stringify(expectedTabs)
    );

    instrument = {
      method: 'cardless_emi',
    };

    expectedTabs = [
      {
        label: 'Debit&Cardless',
        value: 'debit_cardless',
      },
    ];

    expect(JSON.stringify(filterTabsAgainstInstrument(tabs, instrument))).toBe(
      JSON.stringify(expectedTabs)
    );

    tabs = [
      {
        label: 'Credit',
        value: 'credit',
      },
      {
        label: 'Cardless',
        value: 'cardless',
      },
    ];

    expectedTabs = [
      {
        label: 'Cardless',
        value: 'cardless',
      },
    ];

    expect(JSON.stringify(filterTabsAgainstInstrument(tabs, instrument))).toBe(
      JSON.stringify(expectedTabs)
    );
  });

  test('Tabs if user comes from custom config cardless block', () => {
    selectedBank.set({
      code: 'HDFC',
      name: 'HDFC Credit Cards',
      debitEmi: true,
      creditEmi: true,
      isCardless: true,
      isNoCostEMI: true,
      startingFrom: 15,
    });
    const expectedTabs = [
      {
        label: 'Cardless',
        value: 'cardless',
      },
    ];
    const instrument = {
      method: 'cardless_emi',
    };
    expect(JSON.stringify(getEmiTabs(instrument))).toBe(
      JSON.stringify(expectedTabs)
    );
  });

  test('If selected provider is Bajaj', () => {
    selectedBank.set({
      code: 'HDFC',
    });

    expect(isSelectedBankBajaj()).toBeFalsy();

    selectedBank.set({
      code: 'bajaj',
    });

    expect(isSelectedBankBajaj()).toBeTruthy();
  });
});

describe('Validate: isOtherCardEmiProviders', () => {
  let provider = 'onecard';
  expect(isOtherCardEmiProvider(provider)).toBeTruthy();

  provider = 'bajaj';
  expect(isOtherCardEmiProvider(provider)).toBeTruthy();

  provider = 'HDFC';
  expect(isOtherCardEmiProvider(provider)).toBeFalsy();
});

describe('Validate: isCoBrandingEmiProvider', () => {
  let provider = 'onecard';
  expect(isCoBrandingEmiProvider(provider)).toBe(true);

  provider = 'HDFC';
  expect(isCoBrandingEmiProvider(provider)).toBe(false);
});
