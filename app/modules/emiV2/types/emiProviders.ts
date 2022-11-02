import type { EmiBankPlans } from './emiPlans';
import type { Instrument } from './instrument';

export type EMIBANKS = {
  code: string;
  name: string;
  debitEmi?: boolean;
  creditEmi?: boolean;
  isCardless?: boolean;
  isNoCostEMI?: boolean;
  startingFrom?: number | null;
  icon?: string;
  logo?: string;
  section?: string;
  highlightLabel?: string;
  data?: CardlessEmiCode;
  downtimeConfig?: Downtime.Config;
  callbackOnPay?: (...args: any[]) => void | null;
  debitCardlessConfig?: DebitCardlessProviders | null;
  method?: EmiMethod;
};

export type EmiMethod = 'emi' | 'cardless_emi';

/**
 * While redirecting to instacred user may be asked to
 * enter their PAN or debit card details for bank cardless emi
 * The same flow is being returned from the API response under custom_providers
 */
export type CardlessFlow = 'pan' | 'debit_card';

export type CardlessEmiCode = {
  code: string;
};

export type EMIBankList = EMIBANKS[];

export type EMICategories = {
  [x: string]: string;
};

export type EMIBanksMap = {
  [x: string]: EMIBANKS;
};

export type EMIOptionsMap = {
  [x: string]: EMIBankList;
};

export type CardlessEmiProviders = {
  min_amount: number;
  headless: boolean;
  fee_bearer_customer: boolean;
  code: string;
  logo: string;
  sqLogo: string;
  name: string;
  pushToFirst?: boolean;
};

export type CardlessEmiProvidersList = {
  [x: string]: CardlessEmiProviders;
};

export type InstrumentConfig = {
  emiBankList: EMIBANKS[];
  instrument: Instrument;
  emiBanksProviders: EmiBankPlans;
  cardlessEmiProviders: EMIBanksMap;
};

export type DebitCardlessProviders = {
  meta: {
    flow: CardlessFlow;
  };
  powered_by: {
    method: string;
    provider: string;
  };
};

export type DebitCardlessProvidersMap = {
  [x: string]: DebitCardlessProviders;
};
