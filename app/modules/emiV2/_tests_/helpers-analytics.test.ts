import {
  triggerAnalyticsOnSelect,
  triggerAnalyticsOnShown,
  getFormattedInstrumentList,
  getFormattedInstrument,
} from 'emiV2/events/helpers';
import { EMITracker } from 'emiV2/events/analyticsV2';
import type { EMIBANKS, EMIOptionsMap } from 'emiV2/types';

jest.mock('emiV2/events/analyticsV2', () => {
  const originalModule = jest.requireActual('emiV2/events/analyticsV2');

  return {
    __esModule: true,
    ...originalModule,
    EMITracker: {
      EMI_PROVIDERS_SHOWN: jest.fn(),
      EMI_PROVIDER_SELECTED: jest.fn(),
    },
  };
});

const emiOptions = {
  bank: [
    {
      code: 'HDFC',
      name: 'HDFC Bank',
      debitEmi: false,
      creditEmi: true,
      isCardless: false,
      isNoCostEMI: false,
      startingFrom: 15,
      icon: 'https://cdn.razorpay.com/bank/HDFC.gif',
      downtimeConfig: {
        downtimeInstrument: 'HDFC',
        severe: '',
      },
      debitCardlessConfig: null,
      method: 'emi',
    },
    {
      code: 'ICIC',
      name: 'ICICI Bank',
      debitEmi: false,
      creditEmi: true,
      isCardless: false,
      isNoCostEMI: false,
      startingFrom: 14.99,
      icon: 'https://cdn.razorpay.com/bank/ICIC.gif',
      downtimeConfig: {
        downtimeInstrument: 'ICIC',
        severe: '',
      },
      debitCardlessConfig: null,
      method: 'emi',
    },
  ],
  other: [
    {
      data: {
        code: 'onecard',
      },
      icon: 'https://cdn.razorpay.com/cardless_emi-sq/onecard.png',
      code: 'onecard',
      name: 'OneCard',
      method: 'emi',
      isNoCostEMI: false,
      creditEmi: true,
      startingFrom: 16,
    },
  ],
};

describe('test triggerAnalyticsOnShown method', () => {
  it('should trigger respective EMI analytics events during render on EMI L1 screen.', () => {
    const { bank, other } = emiOptions;
    triggerAnalyticsOnShown(emiOptions as EMIOptionsMap);
    expect(EMITracker.EMI_PROVIDERS_SHOWN).toHaveBeenCalledTimes(1);
    expect(EMITracker.EMI_PROVIDERS_SHOWN).toHaveBeenCalledWith({
      bank: getFormattedInstrumentList(bank as EMIBANKS[], 'bank'),
      other: getFormattedInstrumentList(other as EMIBANKS[], 'other'),
    });
  });
  it('should trigger respective EMI analytics events during render on EMI on L1 screen.', () => {
    const emiOptionList = {
      bank: [...emiOptions.bank],
      other: [],
    };

    const { bank, other } = emiOptionList;
    triggerAnalyticsOnShown(emiOptionList as EMIOptionsMap);
    expect(EMITracker.EMI_PROVIDERS_SHOWN).toHaveBeenCalledTimes(1);
    expect(EMITracker.EMI_PROVIDERS_SHOWN).toHaveBeenCalledWith({
      bank: getFormattedInstrumentList(bank as EMIBANKS[], 'bank'),
      other: getFormattedInstrumentList(other as EMIBANKS[], 'other'),
    });
  });
});
describe('test triggerAnalyticsOnSelect method', () => {
  it('should trigger respective EMI analytics events on select of EMI option.', () => {
    const selectedEMIProvider = {
      code: 'ICIC',
      name: 'ICICI Bank',
      debitEmi: false,
      creditEmi: true,
      isCardless: false,
      isNoCostEMI: false,
      startingFrom: 14.99,
      icon: 'https://cdn.razorpay.com/bank/ICIC.gif',
      downtimeConfig: {
        downtimeInstrument: 'ICIC',
        severe: '',
      },
      debitCardlessConfig: null,
      method: 'emi',
    };
    const providerType = 'bank';
    triggerAnalyticsOnSelect(selectedEMIProvider as EMIBANKS, providerType);
    expect(EMITracker.EMI_PROVIDER_SELECTED).toHaveBeenCalledTimes(1);
    expect(EMITracker.EMI_PROVIDER_SELECTED).toHaveBeenCalledWith({
      instrument: getFormattedInstrument(
        selectedEMIProvider as EMIBANKS,
        providerType
      ),
    });
  });
});
