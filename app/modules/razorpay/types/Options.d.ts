import type { FollowPath, Paths } from 'types/utils';

export interface RecurringToken {
  max_amount: number;
  expire_by: number;
}

export interface PartialPayment {
  min_amount_label: string;
  full_amount_label: string;
  partial_amount_label: string;
  partial_amount_description: string;
  select_partial: boolean;
}

export interface Method {
  netbanking?: any;
  card: boolean;
  credit_card: boolean;
  debit_card: boolean;
  cardless_emi?: any;
  wallet?: any;
  emi: boolean;
  upi?: any;
  upi_intent: boolean;
  qr: boolean;
  bank_transfer: boolean;
  offline_challan: boolean;
  upi_otm: boolean;
  cod: boolean;
}

export interface Prefill {
  amount: string;
  wallet: string;
  provider: string;
  method: string;
  name: string;
  contact: string;
  email: string;
  vpa: string;
  coupon_code: string;
  'card[number]': string;
  'card[expiry]': string;
  'card[cvv]': string;
  'billing_address[line1]': string;
  'billing_address[line2]': string;
  'billing_address[postal_code]': string;
  'billing_address[city]': string;
  'billing_address[country]': string;
  'billing_address[state]': string;
  'billing_address[first_name]': string;
  'billing_address[last_name]': string;
  bank: string;
  'bank_account[name]': string;
  'bank_account[account_number]': string;
  'bank_account[account_type]': string;
  'bank_account[ifsc]': string;
  auth_type: string;
}

export interface Features {
  cardsaving: boolean;
}

export interface Readonly {
  contact: boolean;
  email: boolean;
  name: boolean;
}

export interface Hidden {
  contact: boolean;
  email: boolean;
}

export interface Modal {
  confirm_close: boolean;
  escape: boolean;
  animation: boolean;
  backdropclose: boolean;
  handleback: boolean;
}

export interface External {
  wallets: any[];
}

export interface Challan {
  fields: any[];
  disclaimers: any[];
  expiry: any;
}

export interface Theme {
  upi_only: boolean;
  color: string;
  backdrop_color: string;
  image_padding: boolean;
  image_frame: boolean;
  close_button: boolean;
  close_method_back: boolean;
  hide_topbar: boolean;
  branding: string;
  debit_card: boolean;
}

export interface _ {
  integration?: any;
  integration_version?: any;
  integration_parent_version?: any;
  integration_type?: any;
}

interface Instrument {
  method: string;
  banks?: string[];
  issuers?: string[];
  types?: string[];
  wallets?: string[];
}

interface Blocks {
  [blockCode: string]: {
    name: string;
    instruments: Instrument[];
  };
}

export interface Display {
  blocks: Blocks;
  hide: Blocks;
  sequence: string[];
  preferences: {
    show_default_blocks: boolean;
  };
}

export interface Config {
  display: Display;
}

export interface OptionObject {
  [experiments: `experiments.${string}`]: string | boolean;
  key: string;
  account_id: string;
  image: string;
  amount: number;
  currency: string;
  order_id: string;
  invoice_id: string;
  subscription_id: string;
  auth_link_id: string;
  payment_link_id: string;
  notes?: any;
  callback_url: string;
  redirect: boolean;
  description: string;
  customer_id: string;
  recurring?: number | string;
  payout?: any;
  contact_id: string;
  signature: string;
  retry: boolean;
  target: string;
  subscription_card_change?: any;
  display_currency: string;
  display_amount: string;
  recurring_token: RecurringToken;
  checkout_config_id: string;
  send_sms_hash: boolean;
  show_address: boolean;
  show_coupons: boolean;
  one_click_checkout: boolean;
  force_cod: boolean;
  mandatory_login: boolean;
  enable_ga_analytics: boolean;
  enable_fb_analytics: boolean;
  customer_cart: any;
  timeout: number;
  name: string;
  partnership_logo: string;
  nativeotp: boolean;
  remember_customer: boolean;
  personalization: boolean;
  paused: boolean;
  fee_label: string;
  force_terminal_id: string;
  is_donation_checkout: boolean;
  keyless_header: string;
  min_amount_label: string;
  partial_payment: PartialPayment;
  method: Method;
  prefill: Prefill;
  features: Features;
  readonly: Readonly;
  hidden: Hidden;
  modal: Modal;
  external: External;
  challan: Challan;
  theme: Theme;
  disable_emi_ux: boolean;
  disable_redesign_v15: boolean;
  config: Config;
  _: _;
}

export type Option = {
  [K in Paths<OptionObject>]: FollowPath<OptionObject, K>;
};
