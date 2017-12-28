sinon.stub($, 'ajax');

window.preferences = {
  methods: {
    card: true,
    netbanking: {
      HDFC: 'HDFC Bank',
      UTIB: 'Axis Bank',
      BARB: 'Bank of Baroda',
      SBIN: 'State Bank of India'
    },
    wallet: {
      paytm: true
    }
  }
};

Razorpay.payment.getPrefs = function(_, callback) {
  callback(window.preferences);
};

var orig_methods = window.preferences.methods;

var cc = {
  number: '4111111111111111',
  expiry: '11 / 23',
  cvv: '456',
  expiry_month: '11',
  expiry_year: '23'
};

var coOptions = {
  key: 'key_id',
  amount: '5100',
  name: 'Daft Punk',
  description: 'Tron Legacy',
  method: {
    netbanking: true,
    card: true,
    wallet: true
  },
  prefill: {
    name: 'Shashank Mehta',
    email: 'sm@razorpay.com',
    contact: '9999999999'
  },
  notes: {
    address: 'Hello World'
  }
};

function clearSession() {
  var session = getSession();
  if (session) {
    session.close();
    delete sessions[_uid];
  }
}

function openCheckoutForm(options, data) {
  clearSession();
  handleMessage({
    id: generateUID(),
    options: options,
    data: data
  });
}

describe('CheckoutBridge should', function() {
  var spy;
  var message = {
    event: 'evt'
  };

  window.CheckoutBridge = {
    onevt: jQuery.noop
  };

  after(function() {
    window.CheckoutBridge = null;
  });

  afterEach(function() {
    spy.restore();
  });

  it('be notified if present', function() {
    spy = sinon.stub(window, 'notifyBridge');
    Razorpay.sendMessage(message);
    expect(spy.called).to.be(true);
    expect(spy.getCall(0).args[0]).to.be(message);
  });

  it('be called with given event', function() {
    spy = sinon.stub(CheckoutBridge, 'onevt');
    notifyBridge(message);
    expect(spy.called).to.be(true);
  });

  it('be called with given event and data', function() {
    message.data = {
      some: 'data'
    };
    spy = sinon.stub(CheckoutBridge, 'onevt');
    notifyBridge(message);
    expect(spy.called).to.be(true);
    expect(spy.getCall(0).args[0]).to.be(JSON.stringify(message.data));
  });

  it('not be notified if absent', function() {
    window.CheckoutBridge = null;
    spy = sinon.stub(window, 'notifyBridge');
    Razorpay.sendMessage(message);
    expect(spy.called).to.not.be(true);
  });
});

describe('init options.method', function() {
  var disableTab, opts;

  it('should hide netbanking if method.netbanking == false', function() {
    disableTab = 'netbanking';
  });

  it('should hide card if method.card == false', function() {
    disableTab = 'card';
  });

  beforeEach(function() {
    opts = clone(coOptions);
  });

  afterEach(function() {
    opts.method[disableTab] = false;
    openCheckoutForm(opts);
    expect(jQuery('.tab-content').length).to.be(3);
    expect(jQuery('#tab-' + disableTab).length).to.be(0);
  });
});

describe('nextRequestRedirect', function() {
  it('should postMessage data to parent if inside iframe', function() {
    var msg, nextRequestData, parent, stub;
    parent = window.parent;
    window.parent = {
      postMessage: jQuery.noop
    };
    nextRequestData = {};
    stub = sinon.stub(Razorpay, 'sendMessage');
    discreet.redirect(nextRequestData);
    msg = stub.getCall(0).args[0];
    expect(stub.callCount).to.be(1);
    expect(msg.event).to.be('redirect');
    expect(msg.data).to.be(nextRequestData);
    window.parent = parent;
    stub.restore();
  });
});
