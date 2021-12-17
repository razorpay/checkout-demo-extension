import type { CustomObject, DownTimeSeverity, Method } from './types';

export interface AppInstrument {
  name: string;
  logo: string;
  code: string;
}

export interface Instrument {
  vpa?: string;
  bank?: string;
  provider?: string;
  method?: Method;
  wallet?: any;
  flow?: any;
  app?: string | CustomObject<any>;
  token?: string | undefined;
  downtimeSeverity?: DownTimeSeverity;
  downtimeInstrument?: string | undefined;
  subtitle?: string;
  title?: string;
  code?: string;
}
