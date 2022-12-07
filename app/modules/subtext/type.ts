export interface Ungrouped {
  _type: string;
  code: string;
  method: string;
}

export interface CardInstrument {
  _ungrouped: Ungrouped[];
  _type: string;
  code: string;
  method: string;
  id: string;
  types?: string[];
  issuers?: string[];
  networks?: string[];
  iins?: string[];
  section?: string;
  blockTitle?: string;
  countries?: string[];
}

export interface BankInstrument {
  banks: Array<string>;
  id: string;
  method: string;
  _type: string;
}

export interface WalletInstrument {
  _ungrouped: Ungrouped[];
  method: string;
  wallets: string[];
  _type: string;
  id: string;
}

export type SubTextInstrument =
  | WalletInstrument
  | BankInstrument
  | CardInstrument;
