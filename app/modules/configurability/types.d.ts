import type { Method } from 'types/types';
import type { Ungrouped } from 'home/analytics/helpers';

export type Instruments = {
  code?: string;
  _type?: string;
  method?: string;
  flows?: string[];
  app?: string;
  apps?: string[];
  id?: string;
  issuers?: Array<string>;
  method?: string;
  networks?: Array<string>;
  token_id?: string;
  types?: Array<string>;
  _type?: string;
  _ungrouped?: Array<Ungrouped>;
};

export type PartialInstrumentKey = 'code' | '_type' | 'method';

export type Config = {
  name?: string;
  instruments?: Instruments[];
};

export type Block = {
  title?: string;
  instruments?: Instruments[];
} & Instruments;

type HideInstruments = Instruments & {
  apps?: string[];
  issuers?: string[];
  banks?: string[];
  wallets?: string[];
  networks?: string[];
  types?: string[];
};

export type Ungrouped = {
  _ungrouped: Instruments[];
} & Instruments;

export type Display = {
  blocks: Block[];
  sequence: string[];
  preferences: {
    show_default_blocks: boolean;
  };
  hide: {
    methods: string[];
    instruments: HideInstruments[];
  };
};

export type SequencedBlockParam = {
  methods: string[];
  translated: {
    display: Display;
  };
};

export type InstrumentsConfigMethod =
  | 'card'
  | 'netbanking'
  | 'wallet'
  | 'upi'
  | 'cardless_emi'
  | 'paylater'
  | 'app';

export type Restrictions = {
  allow: Block[];
};

export type Options = {
  display: Display;
  restrictions: Restrictions | null;
};

export type Hide = {
  method: Method;
  wallets?: string[];
  issuers?: string[];
  networks?: string[];
  types?: string[];
  flow?: string;
};

export type InstrumentCreators = {
  [type in 'default' | 'upi']: (instrument: Instruments) => Instruments;
};
export type AllHiddenInstrument = Array<Instruments | undefined> | [];
