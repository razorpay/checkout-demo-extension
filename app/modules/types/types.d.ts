export type CustomObject<T> = {
  [key: string]: T;
};
export type EmptyObject = CustomObject<never>;
export type Razorpay = any;
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
