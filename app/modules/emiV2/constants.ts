import type { TabLabels } from 'emiV2/types';
import { CARDLESS, CREDIT, DEBIT, DEBIT_AND_CARDLESS } from 'ui/labels/emi';

// Bank Code Constants
const HDFC_BANK_CODE = 'HDFC';
const SBIN_BANK_CODE = 'SBIN';
const ICICI_BANK_CODE = 'ICIC';
const AXIS_BANK_CODE = 'UTIB';
const CITI_BANK_CODE = 'CITI';
const WALNUT369_CODE = 'walnut369';
const ZESTMONEY_CODE = 'zestmoney';
const BAJAJ_CODE = 'bajaj';
const EARLY_SALARY_CODE = 'earlysalary';
const HCIN_CODE = 'hcin';
const HDFC_BANK_DEBIT_CODE = 'HDFC_DC';
const KOTAK_DEBIT_CODE = 'KKBK_DC';
const KOTAK_BANK_CODE = 'KKBK';
const ICICI_BANK_DEBIT_CODE = 'ICIC_DC';
const RBL_BANK_CODE = 'RATN';

export const EmiBanksCode = {
  HDFC_BANK_CODE,
  SBIN_BANK_CODE,
  ICICI_BANK_CODE,
  AXIS_BANK_CODE,
  CITI_BANK_CODE,
  HDFC_BANK_DEBIT_CODE,
  KOTAK_DEBIT_CODE,
  KOTAK_BANK_CODE,
  ICICI_BANK_DEBIT_CODE,
  RBL_BANK_CODE,
};

// Constants
export const Views = {
  PLANS: 'EMI Plans',
  OPTIONS: 'EMI Options',
  CARD_DETAILS: 'Card Details',
};

// Cardless EMI method that follow the tab UI
export const cardlessTabProviders: string[] = [
  BAJAJ_CODE,
  EARLY_SALARY_CODE,
  HCIN_CODE,
];

// Order in which emi options should come
export const bankSortOrder: string[] = [
  HDFC_BANK_CODE,
  ICICI_BANK_CODE,
  AXIS_BANK_CODE,
  CITI_BANK_CODE,
  SBIN_BANK_CODE,
];

// Order in which Other emi options should come
export const otherEMIOptionsSortOrder: string[] = [
  WALNUT369_CODE,
  ZESTMONEY_CODE,
  BAJAJ_CODE,
  EARLY_SALARY_CODE,
];

// Non bank cardless emi providers
export const providersToAvoid = [
  'earlysalary',
  'zestmoney',
  'axio',
  'hcin',
  'walnut369',
  'sezzle',
];

// EMI Tab Labels
export const tabLabels: TabLabels = {
  credit: CREDIT,
  debit: DEBIT,
  cardless: CARDLESS,
  debit_cardless: DEBIT_AND_CARDLESS,
};

// Placeholders for tab values
export const tabValues = {
  CREDIT: 'credit',
  DEBIT: 'debit',
  CARDLESS: 'cardless',
  DEBIT_CARDLESS: 'debit_cardless',
};

// List of Banks for which we need to show the Convenience Fee Text
export const banksWithConvenienveFee: string[] = [
  HDFC_BANK_DEBIT_CODE,
  HDFC_BANK_CODE,
  SBIN_BANK_CODE,
  ICICI_BANK_CODE,
  ICICI_BANK_DEBIT_CODE,
  KOTAK_BANK_CODE,
  KOTAK_DEBIT_CODE,
  AXIS_BANK_CODE,
  RBL_BANK_CODE,
];