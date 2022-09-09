import type { EMIBANKS } from './emiProviders';

export type EmiOptions = {
  [x: string]: EmiPlan[];
};

export type EmiPlan = {
  duration: number;
  interest: number | string;
  merchant_payback?: string;
  min_amount: number;
  subvention?: string;
  amount_per_month?: number;
  processing_fee?: number;
  stamp_duty?: number;
  processing_fee_disclaimer?: string;
  offer_id?: string;
};

export type EmiPlans = EmiPlan[];

type CardlessUrl = {
  resend_otp?: string;
};

export type CardlessEMIStore = {
  plans?: {
    [x: string]: EmiPlans;
  };
  providerCode: string;
  contact: string;
  ott?: string;
  loan_url?: string;
  lenderBranding?: string;
  urls?: {
    [x: string]: CardlessUrl;
  };
};

// Payload to be sent to add card screen to validate the card
export type EMIPayload = {
  bank: EMIBANKS;
  plan?: EmiPlan;
  tab: string;
};

export type EmiPlanObject = {
  [x: string]: EmiPlan;
};

export type EmiBankPlans = {
  [x: string]: {
    [x: string]: EmiPlan;
  };
};
