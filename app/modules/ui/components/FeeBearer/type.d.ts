export interface Shield {
  fhash: string;
  tz: string;
}

export interface MetaData {
  shield: Shield;
  device_id: string;
  checkout_id: string;
  env: string;
  library: string;
  platform: string;
  referer: string;
}

export interface Input {
  contact: string;
  email: string;
  method: string;
  bank: string;
  amount: number;
  currency: string;
  description: string;
  dcc_currency: string;
  convenience_fee: any; // TODO handle for DFB case
  _: MetaData;
  fee: number;
  tax: number;
}

export interface Display {
  originalAmount: number;
  original_amount: number;
  fees: number;
  razorpay_fee: number;
  tax: number;
  amount: number;
  currency: string;
}

export interface FeeBearerResponse {
  input: Input;
  display: Display;
}
