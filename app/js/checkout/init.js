RazorpayDefaults.handler = function(data) {
  if (this instanceof Razorpay) {
    var callback_url = this.get('callback_url');
    if (callback_url) {
      submitForm(callback_url, data, 'post');
    }
  }
};

RazorpayDefaults.timeout = 0;

RazorpayDefaults.buttontext = 'Pay Now';
RazorpayDefaults.parent = null;

RazorpayDefaults.name = '';

RazorpayDefaults.ecod = false;

RazorpayDefaults.remember_customer = false;
RazorpayDefaults.method = {
  netbanking: true,
  card: true,
  wallet: null,
  emi: true,
  upi: true,
  upi_intent: null
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
  'bank_account[ifsc]': '',
  'aadhaar[number]': '',
  auth_type: ''
};

RazorpayDefaults.feature = {
  cardsaving: true
};

RazorpayDefaults.readonly = {
  contact: false,
  email: false,
  name: false
};

RazorpayDefaults.modal = {
  confirm_close: false,
  ondismiss: noop,
  onhidden: noop,
  escape: true,
  animation: true,
  backdropclose: false
};

RazorpayDefaults.external = {
  wallets: [],
  handler: noop
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
  debit_card: false
};

optionValidations.parent = function(parent) {
  if (!$(parent)[0]) {
    return "parent provided for embedded mode doesn't exist";
  }
};
