export type InstrumentMethod = 'emi' | 'cardless_emi';

type InstrumentSection = 'custom' | 'generic';

type InstrumentType = 'method' | 'instrument';

export type Instrument = {
  id: string;
  method: InstrumentMethod;
  section: InstrumentSection;
  skipCTAClick: boolean;
  _type: InstrumentType;
  issuers?: string[];
  providers?: string[];
  networks?: string[];
  types?: string[];
  iins?: string[];
  cobranded_partners?: string[];
};
