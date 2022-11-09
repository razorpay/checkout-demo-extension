import { EMITracker } from 'emiV2/events/analyticsV2';
import type { Instrument } from 'analytics-v2/types';
import type { EMIBANKS, EMIOptionsMap } from 'emiV2/types';

/**
 * method that returns the formatted Instrument.
 * @param {EMIBANKS} emiOption
 * @param {type} string
 *
 * @returns {Instrument}
 */
export const getFormattedInstrument = (
  emiOption: EMIBANKS,
  type: string
): Instrument => {
  const { name, isNoCostEMI, isCardless, method, creditEmi, debitEmi } =
    emiOption;
  const instrument: Instrument = {
    name,
    type,
    isNoCostEMI,
    isCardless: method === 'cardless_emi' || !!isCardless,
  };
  if (typeof emiOption.creditEmi !== 'undefined') {
    instrument.creditEmi = creditEmi;
  }
  if (typeof emiOption.debitEmi !== 'undefined') {
    instrument.debitEmi = debitEmi;
  }

  return instrument;
};

/**
 * method that returns the formatted instrument list shown on L1 screen.
 * @param {EMIBANKS[]} instrumentList
 * @param {type} string
 *
 * @returns {Instrument[]}
 */
export const getFormattedInstrumentList = (
  instrumentList: EMIBANKS[],
  type: string
): Instrument[] =>
  instrumentList
    ?.slice(0, 5)
    ?.map((emiOption: EMIBANKS) => getFormattedInstrument(emiOption, type));

/**
 * trigger analyticsV2 event when EMI options shown on L1 screen.
 * @param {EMIBANKS} bank
 */
export const triggerAnalyticsOnShown = (emiOptions: EMIOptionsMap) => {
  const { bank = [], other = [] } = emiOptions;

  EMITracker.EMI_PROVIDERS_SHOWN({
    bank: getFormattedInstrumentList(bank as EMIBANKS[], 'bank'),
    other: getFormattedInstrumentList(other as EMIBANKS[], 'other'),
  });
};

/**
 * trigger analyticsV2 event when we select the EMI option on L1 screen.
 * @param {EMIBANKS} bank
 */
export const triggerAnalyticsOnSelect = (bank: EMIBANKS, type: string) => {
  EMITracker.EMI_PROVIDER_SELECTED({
    instrument: getFormattedInstrument(bank, type),
  });
};
