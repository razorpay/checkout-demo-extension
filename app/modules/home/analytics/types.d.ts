type MetaType = {
  preferred: boolean;
};

type Ungrouped = {
  bank?: string;
  meta?: MetaType;
  issuer?: string;
  network?: string;
  type?: string;
  token_id?: string;
  vendor_vpa?: string;
  app?: string;
  id?: string;
  flow?: string;
  vpa?: string;
  method?: string;
};

// TODO: the InstrumentType need to updated respective to all the methods
export type InstrumentType = {
  section: string;
  blockTitle?: string;
  banks?: Array<string>;
  id?: string;
  meta?: MetaType;
  networks?: Array<string>;
  issuers?: Array<string>;
  types?: Array<string>;
  method: string;
  skipCTAClick?: boolean;
  token_id?: string;
  consent_taken?: string;
  flows?: string[];
  apps?: string[];
  _type?: string;
  vpas?: string[];
  vendor_vpa?: string;
  _ungrouped?: Array<Ungrouped>;
};
