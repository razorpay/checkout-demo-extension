import type WalletComponent from 'ui/tabs/wallets/index.svelte';
import type Session from 'session';

export type CustomObject<T> = {
  [key: string]: T;
};
export type EmptyObject = CustomObject<never>;
// TODO improve
export type Razorpay = {
  [x: string]: any;
  get: (key?: string) => any;
  metadata: Record<string, string | boolean | number>;
  set: (key: string, value: any) => void;
  _evts: {
    [eventName: string]: (data: any) => void;
  };
  modal: Record<string, any>;
  enableLite?: boolean;
};
export type DownTimeSeverity = 'high' | 'low' | boolean;
export type BaseFunction = (...args: any) => any;
export type Method =
  | 'card'
  | 'netbanking'
  | 'wallet'
  | 'upi'
  | 'emi'
  | 'bank_transfer'
  | 'paylater'
  | 'cardless_emi'
  | 'upi_otm'
  | 'paypal'
  | 'gpay'
  | 'qr'
  | 'nach'
  | 'emandate'
  | 'app'
  | 'fpx';

export type History = {
  isInitialized: boolean;
  config: any;
  previousRoute: () => any;
  pop: (currentView: any) => any;
  push: (nextView: any) => void;
  replace: (newView: any, history: any) => void;
  initialize: (view: any) => void;
  setConfig: (config: any) => void;
  popUntil: (view: any) => void;
};

// TODO update type
export type SessionType = Record<keyof Session, any> & {
  isCorporateBanking: boolean;
  walletTab: WalletComponent;
  body: any; // TODO jquery api
};
