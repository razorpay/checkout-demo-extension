import type { EmiPlans } from 'emiV2/types';

export type EMIPayload = {
  [x: string]: string | number | string[];
  method: 'emi' | 'cardless_emi';
  /**
   * Cardless provider Short code
   */
  provider?: string;
  offer_id?: string;
  reward_ids?: Array<string>;
  amount?: number;
  fee?: number;
  token?: string;
};

export type PaymentStatus = 'cancel' | 'success' | 'error';

export type PaymentAction = 'card' | 'cardless' | 'otp_skipped';

export interface PaymentProcessConfiguration {
  action: PaymentAction;
  payloadData?: Partial<EMIPayload>;
  cardlessEligibilityFlow?: boolean;
  tokenisationPopupShown?: boolean;
}

export interface CardlessParams {
  incorrect?: boolean;
  resend?: boolean;
}

export interface CardlessEmiCallbackData {
  ott?: string;
  loan_url?: string;
  lender_branding_url?: string;
  emi_plans?: EmiPlans;
}

export type Rewards = {
  reward_id?: 'string';
};

type PaymentRequest = {
  content: {
    contact: string;
    email: string;
    method: string;
    amount: string;
    provider: string;
    currency: string;
    description: string;
    ott?: string;
    emi_duration?: string;
  };
};

export type PaymentResponse = {
  resend_url: string;
  emi_plans?: {
    [x: string]: EmiPlans;
  };
  error?: {
    description: string;
    reason: string;
  };
};

export interface CardlessEmiPayload {
  request: PaymentRequest;
  response: PaymentResponse;
}
