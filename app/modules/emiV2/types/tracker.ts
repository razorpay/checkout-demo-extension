export type SavedCardMeta = {
  card_type: string;
  card_network: string;
  card_issuer: string;
};

export type EmiOptionsMeta = {
  name: string | undefined;
  nc_emi_tag: boolean;
  interest_rate_tag: boolean;
};

export type EmiProviderMeta = {
  provider_name: string;
  credit: boolean;
  debit: boolean;
  cardless: boolean;
  debit_and_cardless: boolean;
  tab_view: boolean;
  default_tab: string;
};

export type EmiTabMeta = {
  provider_name: string;
  tab_name: string;
  eligible?: boolean;
};

export type EmiPlanMeta = {
  nc_emi_tag: boolean;
  tenure: number;
};

export type EmiPlansMeta = {
  saved_card?: SavedCardMeta | string;
  provider_name: string;
  tab_name: string;
  emi_plans?: EmiPlanMeta[];
  emi_plan?: EmiPlanMeta;
  emi_via_cards_screen?: boolean;
  pan_verified_tooltip_rendered?: boolean;
  pan_verified_tooltip_clicked?: boolean;
};

export type payFullAmountMeta = {
  provider_name?: string;
  card_type: string | null;
  tab_name: string;
  emi_plan?: EmiPlanMeta;
};

export type paymentMeta = {
  emi_type: string;
  provider_name?: string;
  tab_name: string;
  mobile_number?: string;
  is_default_mobile_number?: boolean;
  is_eligible?: boolean;
  emi_plans?: EmiPlanMeta;
  status?: string;
  failure_reason?: string;
  emi_via_cards_screen?: boolean;
  saved_card?: SavedCardMeta;
};

export type addCardMeta = {
  card_type: string;
  card_issuer: string;
  card_network: string | undefined;
  provider_name: string;
  tab_name: string;
  emi_plan: EmiPlanMeta;
  pay_full_amount_cta?: boolean;
  error_type?: string;
  error_description?: string;
  change_emi_option_cta?: boolean;
};

export type CVVMeta = {
  saved_card?: SavedCardMeta | string;
  provider_name: string;
  tab_name: string;
  emi_plan: EmiPlanMeta;
};

export type DebitEligibilityChecked = {
  saved_card?: SavedCardMeta | string;
  provider_name: string;
  tab_name: string;
  emi_plan: EmiPlanMeta;
  card_type?: string;
  mobile_number: string;
  is_eligible: boolean;
  is_default_mobile_number: boolean;
  check_eligibility_info_clicked: boolean;
};

export interface OtpMeta {
  emi_type: string;
  otp_screen_time_out: boolean;
  emi_via_cards_screen: boolean;
  saved_card?: SavedCardMeta | string;
  provider_name?: string;
  tab_name?: string;
  card_type?: string;
  emi_plan: EmiPlanMeta | string;
  otp_type: OtpType;
}

export type OtpType = 'native' | 'login';
