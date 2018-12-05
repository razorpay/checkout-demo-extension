import { RazorpayDefaults } from 'common/options';

RazorpayDefaults.timeout = 0;
RazorpayDefaults.name = '';
RazorpayDefaults.ecod = false;

RazorpayDefaults.remember_customer = false;
RazorpayDefaults.method = {
  netbanking: null,
  card: true,
  wallet: null,
  emi: true,
  upi: true,
  upi_intent: null,
  qr: false,
};

RazorpayDefaults.prefill = {
  amount: '',
  wallet: '',
  method: '',
  name: '',
  contact: '',
  email: '',
  vpa: '',
  'card[number]': '',
  'card[expiry]': '',
  'card[cvv]': '',

  /* eMandate options */
  bank: '',
  'bank_account[name]': '',
  'bank_account[account_number]': '',
  'bank_account[account_type]': '',
  'bank_account[ifsc]': '',
  'aadhaar[vid]': '',
  auth_type: '',
};

RazorpayDefaults.features = {
  cardsaving: true,
};

RazorpayDefaults.readonly = {
  contact: false,
  email: false,
  name: false,
};

RazorpayDefaults.hidden = {
  contact: false,
  email: false,
};

RazorpayDefaults.modal = {
  confirm_close: false,
  ondismiss: _Func.noop,
  onhidden: _Func.noop,
  escape: true,
  animation: true,
  backdropclose: false,
};

RazorpayDefaults.external = {
  wallets: [],
  handler: _Func.noop,
};

RazorpayDefaults.theme = {
  upi_only: false,
  color: '',
  backdrop_color: 'rgba(0,0,0,0.6)',
  image_padding: true,
  image_frame: true,
  close_button: true,
  close_method_back: false,
  hide_topbar: false,
  branding: '',
  emi_mode: false,
  debit_card: false,
};
