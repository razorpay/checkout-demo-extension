import { RazorpayDefaults } from 'common/options';

RazorpayDefaults.timeout = 0;
RazorpayDefaults.name = '';
RazorpayDefaults.partnership_logo = '';

RazorpayDefaults.nativeotp = true;
RazorpayDefaults.remember_customer = false;
RazorpayDefaults.personalization = false;
RazorpayDefaults.paused = false;
RazorpayDefaults.fee_label = 'Gateway Charges';

RazorpayDefaults.min_amount_label = ''; // Added for RBL custom label while Partial Amount
RazorpayDefaults.partial_payment = {
  min_amount_label: 'Minimum first amount',
  full_amount_label: 'Pay in full',
  partial_amount_label: 'Make payment in parts',
  partial_amount_description: 'Pay some now and the remaining later',
  select_partial: false,
};

RazorpayDefaults.method = {
  netbanking: null,
  card: true,
  cardless_emi: null,
  wallet: null,
  emi: true,
  upi: null,
  upi_intent: true,
  qr: true,
  bank_transfer: true,
};

RazorpayDefaults.prefill = {
  amount: '',
  wallet: '',
  provider: '',
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
  handleback: true,
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
  debit_card: false,
};

RazorpayDefaults._ = {
  integration: null, // Used for passing the integration mode. eg.: flutter, woocommerce
  integration_version: null, // Used for passing the integration version. eg.: 1.0.2
  integration_parent_version: null, // Used for passing the version of the platform eg.: Magento version for Magento integration
};

RazorpayDefaults.config = {
  display: {}, // Display config for Payment Method Configurability
  restrictions: {}, // Restricted payment instruments
};
