import type { BankCodes } from 'razorpay/types/Preferences';

export interface TranslatedBankType {
  code: string;
  original: string;
  name: string;
  _key: string;
  disabledText?: string;
  logoCode?: string;
  downtimeSeverity?: string;
}

export interface Instrument {
  id: string;
  method: string;
  banks?: (BankCodes | string)[];
  _type: string;
  _ungrouped: {
    method: string;
    bank?: BankCodes | string;
    _type: string;
  }[];
}

export interface transformedBank {
  name: string;
  code: string;
  logo: string;
}
