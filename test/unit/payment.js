var payload = {
  key_id: 'key',
  amount: 1000,
  method: 'wallet',
  wallet: 'paytm'
};

var baseUrl = RazorpayConfig.api + RazorpayConfig.version;

var baseRedirectUrl = baseUrl + 'payments/create/';

var r = Razorpay({
  key: 'key',
  amount: 1000
});

function mockPayment(payment) {
  var methodFunc, methodName, ref;
  if (!payment) {
    payment = {
      data: clone(payload),
      r: r,
      ajax: null,
      done: false,
      fees: false,
      powerwallet: false,
      popup: null,
      payment_id: ''
    };
  }
  ref = Payment.prototype;
  for (methodName in ref) {
    methodFunc = ref[methodName];
    if (typeof methodFunc === 'function') {
      payment[methodName] = sinon.stub();
    }
  }
  return payment;
};

describe('Payment.prototype', function() {
  var data, payment, r2;

  describe('on', function() {
    payment = mockPayment();
    var stub = sinon.stub(payment.r, 'on');
    var mockListener = function() {};
    var bindStub = sinon.stub(window, 'bind');
    bindStub.returns(mockListener);

    Payment.prototype.on.call(payment, 'some', noop);
    expect(stub.callCount).to.be(1);
    expect(stub.args[0]).to.eql(['some', mockListener, 'payment']);
    expect(bindStub.callCount).to.be(1);
    expect(bindStub.args[0]).to.eql([noop, payment]);

    bindStub.restore();
    stub.restore();
  })

  describe('emit', function() {
    payment = mockPayment();
    var stub = sinon.stub(payment.r, 'emit');
    Payment.prototype.emit.call(payment, 'some', noop);
    expect(stub.callCount).to.be(1);
    expect(stub.args[0]).to.eql(['payment.some', noop]);
    stub.restore();
  })

  describe('off', function() {
    payment = mockPayment();
    var stub = sinon.stub(payment.r, 'off');
    Payment.prototype.off.call(payment);
    expect(stub.callCount).to.be(1);
    expect(stub.args[0]).to.eql(['payment']);
    stub.restore()
  })

  describe('redirect', function() {
    var options, redirectStub;
    payment = null;

    beforeEach(function() {
      payment = mockPayment();
      options = payment.r.get();
      options.redirect = true;
      redirectStub = sinon.stub(discreet, 'redirect');
    })

    afterEach(function() {
      redirectStub.restore();
    })

    it('if redirect: false', function() {
      options.redirect = false;
      expect(Payment.prototype.checkRedirect.call(payment)).to.not.be.ok();
      expect(redirectStub.called).to.be(false);
    })

    it('if redirect: false', function() {
      options.redirect = false;
      expect(Payment.prototype.checkRedirect.call(payment)).to.not.be.ok();
      expect(redirectStub.called).to.be(false);
    })

    it('if redirect: true', function() {
      expect(Payment.prototype.checkRedirect.call(payment)).to.be(true);
      expect('callback_url' in payment.data).to.be(false);
      expect(redirectStub.callCount).to.be(1);
      expect(redirectStub.args[0][0]).to.eql({
        url: baseRedirectUrl + 'checkout',
        content: payment.data,
        method: 'post'
      })
    })

    it('if redirect: true, and callback_url specified', function() {
      options.callback_url = 'abc';
      expect(Payment.prototype.checkRedirect.call(payment)).to.be(true);
      expect(payment.data.callback_url).to.be('abc');
    })

    it('with fees: true', function() {
      payment.fees = true;
      expect(Payment.prototype.checkRedirect.call(payment)).to.be(true);
      expect(redirectStub.args[0][0]).to.eql({
        url: baseRedirectUrl + 'fees',
        content: payment.data,
        method: 'post'
      })
    })
  })

  describe('format', function() {
    beforeEach(function() {
      payment = mockPayment();
    })

    it('notes', function() {
      data = payment.data;
      data.notes = {
        foo: 1,
        bar: 2,
        nested: {}
      }

      Payment.prototype.format.call(payment, data, {});
      var expectedNotes = {};
      for (var key in data) {
        var val = data[key];
        if (/^notes/.test(key)) {
          expectedNotes[key] = val;
        }
      }
      log('expand notes');
      expect(expectedNotes).to.eql({
        'notes[foo]': 1,
        'notes[bar]': 2
      });
      log('set data._.source to checkoutjs if powerwallet specified');
      expect('_[source]' in data).to.be(false);
    })

    it('fill data from options', function() {
      data = payment.data = {
        signature: 'foo'
      };
      var options = r.get();
      options.currency = 'INR';
      options.signature = 'qwer';
      options.description = 'zxcv';
      options.order_id = '1911';
      options.name = 'name';
      options.notes = {
        yolo: 'swag',
        '1': 2
      };
 
      r2 = Razorpay(options);
      options = r2.get();
      Payment.prototype.format.call(payment);
      expect(data.amount).to.be(options.amount);
      expect(data.key_id).to.be(options.key);
      expect(data.currency).to.be(options.currency);
      expect(data.signature).to.be('foo');
      expect(data.description).to.be(options.description);
      expect(data.order_id).to.be(options.order_id);
      expect('name' in data).to.be(false);
      expect('notes' in data).to.be(false);
      expect(data['notes[yolo]']).to.be('swag');
      expect(data['notes[1]']).to.be(2);
    })
  })

  describe('generate', function() {
    var onSpy, pollSpy;
    payment = null;

    beforeEach(function() {
      payment = mockPayment();
      pollSpy = sinon.stub(window, 'pollPaymentData');
      onSpy = sinon.stub($.prototype, 'on');
      onSpy.returns('xyz');
    })

    afterEach(function() {
      expect(payment.offmessage).to.be('xyz');
      pollSpy.restore();
      onSpy.restore();
    })

    it('discreet.isFrame', function() {
      discreet.isFrame = true;
      expect('onComplete' in window).to.be(false);
      Payment.prototype.generate.call(payment);
      expect(pollSpy.callCount).to.be(1);
      expect(pollSpy.args[0]).to.eql([window.onComplete]);
      expect(payment.complete.called).to.be(false);
      window.onComplete(2);
      expect(payment.complete.callCount).to.be(1);
      expect(payment.complete.args[0]).to.eql([2]);
      expect(payment.complete.calledOn(payment)).to.be(true);
      discreet.isFrame = false;
    })
  })

  describe('complete', function() {
    payment = null;
    beforeEach(function() {
      payment = mockPayment();
    })

    it('success', function() {
      Payment.prototype.complete.call(payment, {
        razorpay_payment_id: 'payid'
      });
      expect(payment.emit.callCount).to.be(1);
      expect(payment.emit.args[0]).to.eql([
        'success', {
          razorpay_payment_id: 'payid'
        }
      ])
    })

    it('error', function() {
      Payment.prototype.complete.call(payment, {
        error: {
          description: 'desc'
        }
      });
      expect(payment.emit.callCount).to.be(1);
      expect(payment.emit.args[0]).to.eql([
        'error', {
          error: {
            description: 'desc'
          }
        }
      ])
    })

    it('nothing if already done', function() {
      payment.done = true;
      Payment.prototype.complete.call(payment, {
        error: {
          description: 'desc'
        }
      })
      expect(payment.emit.called).to.be(false);
      expect(payment.clear.called).to.be(false);
      payment.done = false;
    })
  })

  describe('clear', function() {
    payment = null;
    beforeEach(function() {
      payment = mockPayment();
    })

    it('unbind and cleanup', function() {
      payment.popup = {
        close: sinon.stub()
      };
      payment.ajax = {
        abort: sinon.stub()
      };
      payment.offmessage = sinon.stub();
      var clearPollingStub = sinon.stub(window, 'clearPollingInterval');
      Payment.prototype.clear.call(payment);
      expect(payment.popup.onClose).to.not.be.ok();
      expect(payment.popup.close.callCount).to.be(1);
      expect(payment.ajax.abort.callCount).to.be(1);
      expect(payment.done).to.be(true);
      expect(payment.offmessage.callCount).to.be(1);
      expect(clearPollingStub.callCount).to.be(1);
      expect(payment.r._payment).to.be(null);
      clearPollingStub.restore();
    })

    it('not throw if popup, offmessage and ajax arent set', function() {
      var clearPollingStub;
      clearPollingStub = sinon.stub(window, 'clearPollingInterval');
      expect(function() {
        Payment.prototype.clear.call(payment);
      }).to.not["throw"]();
      expect(clearPollingStub.callCount).to.be(1);
      expect(payment.done).to.be(true);
      clearPollingStub.restore();
    })
  })
})
