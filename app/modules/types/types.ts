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
