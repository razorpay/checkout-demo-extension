import { RazorpayDefaults } from 'common/options';
import { returnAsIs } from 'lib/utils';

RazorpayDefaults.timeout = 0;
RazorpayDefaults.name = '';
RazorpayDefaults.partnership_logo = '';

RazorpayDefaults.nativeotp = true;
RazorpayDefaults.remember_customer = false;
RazorpayDefaults.personalization = false;
RazorpayDefaults.paused = false;
RazorpayDefaults.fee_label = '';
RazorpayDefaults.force_terminal_id = '';
RazorpayDefaults.is_donation_checkout = false;
// This is encrypted data to be passed in all the API calls
// to identify the merchant for keyless auth
RazorpayDefaults.keyless_header = '';

RazorpayDefaults.min_amount_label = ''; // Added for RBL custom label while Partial Amount
RazorpayDefaults.partial_payment = {
  min_amount_label: '',
  full_amount_label: '',
  partial_amount_label: '',
  partial_amount_description: '',
  select_partial: false,
};

RazorpayDefaults.method = {
  netbanking: null,
  card: true,
  credit_card: true,
  debit_card: true,
  cardless_emi: null,
  wallet: null,
  emi: true,
  upi: null,
  upi_intent: true,
  qr: true,
  bank_transfer: true,
  offline_challan: true,
  upi_otm: true,
  cod: true,
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
  coupon_code: '',
  'card[number]': '',
  'card[expiry]': '',
  'card[cvv]': '',
  'billing_address[line1]': '',
  'billing_address[line2]': '',
  'billing_address[postal_code]': '',
  'billing_address[city]': '',
  'billing_address[country]': '',
  'billing_address[state]': '',
  'billing_address[first_name]': '',
  'billing_address[last_name]': '',

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
  ondismiss: returnAsIs,
  onhidden: returnAsIs,
  escape: true,
  animation: global.matchMedia
    ? !global.matchMedia('(prefers-reduced-motion: reduce)')?.matches
    : true,
  backdropclose: false,
  handleback: true,
};

RazorpayDefaults.external = {
  wallets: [],
  handler: returnAsIs,
};

RazorpayDefaults.challan = {
  fields: [],
  disclaimers: [],
  expiry: {},
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
};
