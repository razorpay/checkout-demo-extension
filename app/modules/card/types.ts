import type { Tokens, TokenItem } from 'razorpay/types/Preferences';

export type TokenisationOverlayProps = {
  onPositiveClick: () => void;
  onNegativeClick: () => void;
};

export type CurrenciesPayload = {
  iin?: string | undefined;
  tokenId?: string | undefined;
  cardNumber?: string | undefined;
  walletCode?: string | undefined;
  amount?: number | undefined;
  provider?: string | undefined;
};

export type RecurringDetails = {
  status: string;
  failure_reason: string | null;
};

export type AVSBillingAddressData = {
  city: string;
  country: string;
  line1: string;
  line2: string;
  postal_code: string;
  state: string;
} | null;

export type AVSEntityParam = {
  currentView: string;
  iin: string;
  selectedCard: TokenItem | null;
  selectedCardFromHome: TokenItem | null;
};

export type Meta = {
  preferred: boolean;
};

export type Ungrouped = {
  id: string;
  issuer: string;
  meta: Meta;
  method: string;
  network: string;
  token_id: string;
  type: string;
};

export type Instrument = {
  id: string;
  issuers: Array<string>;
  method: string;
  networks: Array<string>;
  token_id: string;
  types: Array<string>;
  _ungrouped: Array<Ungrouped>;
};

export type SelectedCardTokenIdParam = {
  selectedCard: TokenItem | null;
  currentView: string;
  tokens: Tokens;
  selectedInstrument: Instrument;
};

export type UpdateAVSFormDataParam = {
  direct: boolean;
  lastView: undefined;
  selectedCard: TokenItem | null;
  selectedCardFromHome: TokenItem | null;
};

export type ExperimentParam = {
  overrideFn: () => boolean;
};
