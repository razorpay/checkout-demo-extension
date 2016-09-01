/*
  Testing options passed via handleMessage
  mostly DOM based testing
 */

var methods = {
  card: true,
  netbanking: {
    HDFC: 'HDFC Bank',
    UTIB: 'Axis Bank',
    BARB: 'Bank of Baroda',
    SBIN: 'State Bank of India'
  },
  wallet: {
    'mobikwik': true
  }
};

window.preferences = {
  methods: methods
};

var options = {
  'key': 'key_id',
  'amount': '5100'
};

function clearSession() {
  var session;
  session = getSession();
  if (session) {
    session.close();
    delete sessions[_uid];
  }
};

function openCheckoutForm(options, data) {
  clearSession();
  handleMessage({
    id: generateUID(),
    options: options,
    data: data
  })
}

describe('display_currency', function() {
  var opts = clone(options);
  opts.display_currency = 'USD';
  opts.display_amount = '123.435';
  openCheckoutForm(opts);
  expect(jQuery('#form [type=submit] .pay-btn').text().trim()).to.be('PAY \u00A0$' + opts.display_amount);
})
