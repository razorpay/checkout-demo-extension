import RazorpayConfig from 'common/RazorpayConfig';

export const config = {
  epaylater: {
    name: 'ePayLater',
    display_name: 'ePayLater',
  },
  getsimpl: {
    name: 'Simpl',
    display_name: 'Simpl',
  },
  icic: {
    name: 'ICICI Bank PayLater',
    display_name: 'ICICI',
  },
  hdfc: {
    name: 'FlexiPay by HDFC Bank',
    display_name: 'FlexiPay',
  },
  lazypay: {
    name: 'LazyPay',
    display_name: 'LazyPay',
  },
  kkbk: {
    name: 'kkbk',
    display_name: 'Kotak Mahindra Bank',
  },
} as const;

export const cdnUrl = RazorpayConfig.cdn;

export const prefix = cdnUrl + 'paylater/';
export const sqPrefix = cdnUrl + 'paylater-sq/';

// Order in which the paylater providers should come
export const PAYLATER_ORDER = [
  'getsimpl',
  'lazypay',
  'icic',
  'hdfc',
  'epaylater',
  'kkbk',
] as const;

// Generate provider config
export const defaultConfig = {
  min_amount: 300000,
};
