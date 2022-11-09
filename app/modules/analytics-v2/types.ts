import type { ContextProperties } from './constants';

type ContextKeys = keyof typeof ContextProperties;
export type ContextValues = typeof ContextProperties[ContextKeys];

export interface Method {
  name?: string;
}

export interface Instrument {
  name?: string;
  saved?: boolean;
  personalisation?: boolean;
  network?: string;
  vpa?: string;
  issuer?: string;
  type?: string;
  isCardless?: boolean;
  isNoCostEMI?: boolean;
  creditEmi?: boolean;
  debitEmi?: boolean;
}

export interface Block {
  name?: string;
  category?: string;
}

export type MethodAndInstrument = {
  method: Method;
  instrument: Instrument;
};
