RazorpayDefaults.handler = function(data) {
  if (this instanceof Razorpay) {
    var callback_url = this.get('callback_url');
    if(callback_url) {
      submitForm(callback_url, data, 'post');
    }
  }
}

RazorpayDefaults.buttontext = 'Pay Now';
RazorpayDefaults.parent = null;

RazorpayDefaults.display_currency =
RazorpayDefaults.display_amount =
RazorpayDefaults.name =
RazorpayDefaults.image = '';

RazorpayDefaults.remember_customer = false;
RazorpayDefaults.method = {
  netbanking: true,
  card: true,
  wallet: null,
  emi: true,
  upi: false
}
RazorpayDefaults.prefill = {
  method: '',
  name: '',
  contact: '',
  email: '',
  vpa: '',
  'card[number]': '',
  'card[expiry]': '',
  'card[cvv]': ''
}

RazorpayDefaults.modal = {
  confirm_close: false,
  ondismiss: noop,
  onhidden: noop,
  escape: true,
  animation: true,
  backdropclose: false
}

RazorpayDefaults.external = {
  wallets: [],
  handler: noop
}

RazorpayDefaults.theme = {
  upi_only: false,
  color: '',
  backdrop_color: 'rgba(0,0,0,0.6)',
  image_padding: true,
  close_button: true,
  hide_topbar: false
}

discreet.currencies = {
  'USD': '$',
  'AUD': 'A$',
  'CAD': 'C$',
  'HKD': 'HK$',
  'NZD': 'NZ$',
  'SGD': 'SG$',
  'CZK': 'Kč',
  'NOK': 'kr',
  'DKK': 'kr',
  'SEK': 'kr',
  'EUR': '€',
  'GBP': '£',
  'HUF': 'Ft',
  'JPY': '¥',
  'PLN': 'zł',
  'SFR': 'Fr',
  'CHF': 'Fr'
}

optionValidations.display_currency = function(currency) {
  if(!(currency in discreet.currencies) && currency !== Razorpay.defaults.display_currency){
    return 'This dislpay currency is not supported';
  }
}

optionValidations.display_amount = function(amount) {
  amount = String(amount).replace(/([^0-9\.])/g,'');
  if (!amount && amount !== Razorpay.defaults.display_amount) {
    return '';
  }
}

optionValidations.parent = function(parent) {
  if (!$(parent)[0]) {
    return 'parent provided for embedded mode doesn\'t exist';
  }
}