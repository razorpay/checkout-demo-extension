export type Instruments = {
  code?: string;
  _type?: string;
  method?: string;
};

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

export type SequencedBlockParam = {
  methods: string[];
  translated: {
    display: {
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
