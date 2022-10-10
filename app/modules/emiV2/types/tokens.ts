import type { EmiPlans } from './emiPlans';

type Flows = {
  otp: boolean;
  recurring: boolean;
  iframe: boolean;
};

export type Customer = {
  contact: string;
  haveSavedCard: boolean;
  tokens: {
    count: number;
    entity: string;
    items: Tokens[];
  };
};

export type Card = {
  entity: string;
  name: string;
  last4: string;
  network: string;
  type: string;
  issuer: string;
  international: boolean;
  emi: boolean;
  expiry_month: number;
  expiry_year: number;
  flows: Flows;
  networkCode: string;
  downtimeSeverity: boolean;
  isNoCostEMI?: boolean;
  startingFrom?: number;
  cobranding_partner?: string;
};

export type Tokens = {
  id: string;
  entity: string;
  token: string;
  bank?: string | null;
  wallet?: boolean;
  method: string;
  consent_taken: boolean;
  card: Card;
  vpa?: string;
  recurring: boolean;
  auth_type?: string;
  mrn?: string;
  used_at: number;
  created_at: number;
  expired_at: number;
  plans: EmiPlans;
  cvvDigits: number;
  debitPin: boolean;
};

export type CardFeatures = {
  cobranding_partner?: string | null;
  country?: string;
  flows: {
    recurring?: boolean;
    iframe?: boolean;
    emi: boolean;
  };
  issuer: string;
  network?: string;
  type: string;
};
