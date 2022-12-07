export type Flow = {
  flow: 'intent' | 'collect' | 'qr';
};

export type PaymentRequestData = {
  contact: string;
  email: string;
  method: string;
  'card[number]'?: string;
  'card[cvv]'?: string;
  'card[name]'?: string | number;
  'card[expiry]'?: string;
  wallet?: string;
  bank?: string;
  amount: number;
  currency: string;
  description?: string;
  default_dcc_currency?: string;
  upi?: Flow;
  reward_ids?: string[];
  '_[shield][fhash]': string;
  '_[device_id]': string;
  '_[shield][tz]': number;
  '_[build]': null;
  '_[checkout_id]': string;
  '_[device.id]': string;
  '_[env]': string;
  '_[library]': string;
  '_[platform]': string;
  '_[referer]': string;
  '_[request_index]': number;
  '_[flow]'?: string;
};

export type Optional = {
  contact: boolean;
  email: boolean;
};

export type PaymentData = {
  data: PaymentRequestData;
  feesRedirect?: boolean;
  gpay?: undefined | boolean;
  tez?: undefined | string;
  avoidPopup?: boolean;
  payment_id?: string | string;
  trackingFunction?: string;
  _time?: string;
  iframe?: undefined;
  isExternalAmazonPayPayment?: undefined;
  isExternalGooglePayPayment?: undefined;
  message?: undefined;
  microapps?: undefined;
  nativeotp?: undefined;
  optional?: Optional;
  offmessage?: () => {};
};
