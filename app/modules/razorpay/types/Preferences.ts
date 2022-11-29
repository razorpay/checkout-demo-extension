import type { FollowPath, Paths } from 'types/utils';
import type English from 'i18n/bundles/en';

type BankName = typeof English.banks.long;

interface Theme {
  color: string;
}

interface Options {
  theme: Theme;
  image?: any;
  remember_customer: boolean;
}

interface CardNetworks {
  AMEX: number;
  DICL: number;
  MC: number;
  MAES: number;
  VISA: number;
  JCB: number;
  RUPAY: number;
  BAJAJ: number;
}

interface CardSubtype {
  consumer: number;
  business: number;
  premium: number;
}

interface Netbanking extends BankName {
  [bankCode: string]: string;
}

interface Wallet {
  mobikwik: boolean;
  payzapp: boolean;
  olamoney: boolean;
  airtelmoney: boolean;
  amazonpay: boolean;
  freecharge: boolean;
  jiomoney: boolean;
  phonepe: boolean;
  paypal: boolean;
  [wallet: string]: boolean;
}

interface CardlessEmi {
  [providers: string]: boolean;
  earlysalary: boolean;
  zestmoney: boolean;
  fdrl: boolean;
  hdfc: boolean;
  icic: boolean;
  kkbk: boolean;
  barb: boolean;
}

interface Paylater {
  icic: boolean;
  getsimpl: boolean;
  lazypay: boolean;
}

interface App {
  cred: number;
  twid: number;
  trustly: number;
  poli: number;
}

interface EmiTypes {
  credit: boolean;
  debit: boolean;
}

interface DebitEmiProviders {
  HDFC: number;
}

interface EmiPlans {
  [bankCode: string]: {
    min_amount: number;
    plans: {
      3: number;
      6: number;
      9: number;
      12: number;
      18: number;
      24: number;
    };
  };
}

interface EmiOptions {
  [bankCode: string]: {
    duration: number;
    interest: number;
    subvention: string;
    min_amount: number;
    merchant_payback: string;
  }[];
}

interface Debit {
  [bankCode: string]: string;
}

interface RecurringCard {
  credit: string[];
  prepaid: string[];
  debit: Debit;
}

interface Emandate {
  [bankCode: string]: {
    auth_types: string[];
    name: string;
  };
}

interface Recurring {
  card: RecurringCard;
  emandate: Emandate;
  upi: boolean;
  nach: boolean;
}

interface UpiType {
  collect: number;
  intent: number;
}

interface Methods {
  entity: string;
  intl_bank_transfer: {
    [key: string]: number;
    va_eur: number;
    va_gbp: number;
    va_usd: number;
    va_cad: number;
  };
  card: boolean;
  debit_card: boolean;
  custom_providers: {
    debit_emi_providers: {
      HDFC: {
        meta: { flow: string };
        powered_by: { method: string; provider: string };
      };
    };
  };
  credit_card: boolean;
  prepaid_card: boolean;
  card_networks: CardNetworks;
  card_subtype: CardSubtype;
  amex: boolean;
  netbanking: Netbanking;
  wallet: Wallet;
  emi: boolean;
  upi: boolean;
  cardless_emi: CardlessEmi;
  paylater: Paylater;
  google_pay_cards: boolean;
  app: App;
  gpay: boolean;
  emi_types: EmiTypes;
  debit_emi_providers: DebitEmiProviders;
  nach: boolean;
  cod: boolean;
  offline: boolean;
  bank_transfer: boolean;
  emi_subvention: string;
  emi_plans: EmiPlans;
  emi_options: EmiOptions;
  recurring: Recurring;
  upi_intent: boolean;
  upi_type: UpiType;
  custom_text: any;
  app_meta: {
    [x: string]: any;
    cred: {
      offer: {
        description: string;
      };
    };
  };
}

interface Used {
  name: string;
  instruments: {
    method: string;
    wallets: string[];
  }[];
}

interface Blocks {
  used: Used;
}

interface Display {
  hide: {
    method: string;
  }[];
  blocks: Blocks;
  sequence: string[];
}

interface CheckoutConfig {
  display: Display;
}

interface Upi {
  issuer: string[];
  severity: string;
  begin: number;
}

interface Netbanking2 {
  issuer: string[];
  severity: string;
  begin: number;
}

interface Downtime {
  upi: Upi[];
  netbanking: Netbanking2[];
}

interface DownTimeItem {
  id: string;
  entity: string;
  method: string;
  begin: number;
  end?: any;
  status: string;
  scheduled: boolean;
  severity: string;
  instrument: {
    issuer: string;
    psp: string;
    bank: string;
  };
  created_at: number;
  updated_at: number;
}

interface PaymentDowntime {
  entity: string;
  count: number;
  items: DownTimeItem[];
}

interface Features {
  [x: string]: boolean;
  google_pay: boolean;
  phonepe_intent: boolean;
  one_click_checkout: boolean;
  save_vpa: boolean;
  redirect_to_zestmoney: boolean;
  dcc: boolean;
  show_mor_tnc: boolean;
  one_cc_ga_analytics: boolean;
  one_cc_fb_analytics: boolean;
  one_cc_mandatory_login: boolean;
  one_cc_input_english: boolean;
  one_cc_override_theme: boolean;
  one_cc_consent_default: boolean;
  one_cc_consent_notdefault: boolean;
}

interface Default {
  instruments: {
    instrument: string;
    method: string;
  }[];
  is_customer_identified: boolean;
  user_aggregates_available: boolean;
  versionID: string;
}

interface PreferredMethods {
  default: Default;
}

interface RtbExperiment {
  experiment: boolean;
}

interface OneCC {
  configs: {
    one_click_checkout: boolean;
    one_cc_ga_analytics: boolean;
    one_cc_fb_analytics: boolean;
    cod_intelligence: boolean;
    one_cc_capture_billing_address: boolean;
    one_cc_international_shipping: boolean;
    one_cc_auto_fetch_coupons: boolean;
    one_cc_buy_now_button: boolean;
    one_cc_capture_gstin: boolean;
    one_cc_capture_order_instructions: boolean;
  };
}

interface Address {
  id: string;
  entity_id: string;
  entity_type: string;
  line1: string;
  line2: string;
  city: string;
  zipcode: string;
  state: string;
  country: string;
  type: string;
  primary: boolean;
  deleted_at: any;
  created_at: number;
  updated_at: number;
  contact: string;
  tag: string;
  landmark: string;
  name: string;
  source_id: any;
  source_type: any;
}

export interface Tokens {
  entity: string;
  count: number;
  items: TokenItem[];
}
export interface TokenItem {
  id: string;
  entity: string;
  token: string;
  bank: any;
  wallet: any;
  method: string;
  card: Card;
  recurring: boolean;
  recurring_details: RecurringDetails;
  auth_type: any;
  mrn: any;
  used_at: number;
  created_at: number;
  expired_at: number;
  consent_taken: boolean;
  status: string;
  notes: any[];
  dcc_enabled: boolean;
  billing_address: any;
  compliant_with_tokenisation_guidelines: boolean;
  cvvDigits?: number;
  debitPin?: boolean;
  plans?: boolean;
  vpa?: any;
}

interface Card {
  entity: string;
  name: string;
  last4: string;
  network: string;
  type: string;
  issuer: any;
  international: boolean;
  emi: boolean;
  sub_type: string;
  token_iin: any;
  expiry_month: number | string;
  expiry_year: number | string;
  flows: Flows;
  country: string;
}

interface Flows {
  otp: boolean;
  recurring: boolean;
  iframe: boolean;
}

interface RecurringDetails {
  status: string;
  failure_reason: any;
}

interface Customer {
  addresses: Address[];
  '1cc_consent_banner_views': number;
  tokens: Tokens;
  email: string;
  contact: string;
}

interface ConvenienceFeeConfig {
  checkout_message: string;
  label_on_checkout: string;
  methods: {
    [x: string]: any;
    card: { amount: number; types: { credit: any[]; prepaid: any[] } };
    upi: { amoutn: number };
  };
}

export interface PreferencesObject {
  optional: string[];
  options: Options;
  fee_bearer: boolean;
  version: number;
  language_code: string;
  merchant_key: string;
  merchant_brand_name: string;
  merchant_name: string;
  contact: any;
  mode: string;
  magic: boolean;
  blocked: boolean;
  activated: boolean;
  methods: Methods;
  global: boolean;
  checkout_config: CheckoutConfig;
  downtime: Downtime;
  payment_downtime: PaymentDowntime;
  features: Features;
  org: { isOrgRazorpay: boolean; checkout_logo_url: string };
  preferred_methods: PreferredMethods;
  rtb: boolean;
  rtb_experiment: RtbExperiment;
  force_offer?: boolean;
  offers?: {
    id: string;
    name: string;
    payment_method: string;
    display_text: string;
    type: string;
    original_amount: number;
    amount: number;
    emi_subvention?: boolean;
  }[];
  invoice: {
    order_id: string;
    url: string;
    amount: number;
  };
  '1cc_address_flow_exp': any;
  '1cc_cart_items_exp': string;
  '1cc_city_autopopulate_disable': any;
  '1cc_experiment': any;
  '1cc': OneCC;
  show_donation: boolean;
  customer: Customer;
  merchant_policy: {
    url: string;
    display_name: string;
  };
  feature_overrides: {
    features: {
      name: string;
      config: {
        apps: {
          app_name: string;
          name?: string;
          package_name: string;
          app_icon: string;
          handles: Array<string>;
          verify_registration?: boolean;
          shortcode: string;
          url_schema?: string;
        }[];
      };
    }[];
  };
  experiments: {
    [experiment_id: string]: boolean | string;
  };
  dynamic_wallet_flow?: boolean;
  order: {
    auth_type?: string[];
    bank_account: {
      [x: string]: string;
    };
    bank?: string;
    method: string;
    amount: number;
    amount_due: number;
    amount_paid: number;
    currency: string;
    first_payment_min_amount: any;
    line_items_total: number;
    line_items: any[];
    partial_payment: boolean;
    convenience_fee_config: ConvenienceFeeConfig;
  };
  subscription?: any; // TODO
  line_items_total: number; // TODO confirm
  merchant_currency: string;
  merchant_country: string;
}

export type Preferences = {
  [K in Paths<PreferencesObject>]: FollowPath<PreferencesObject, K>;
};
