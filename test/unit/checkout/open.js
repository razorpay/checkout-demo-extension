var options = {
  key: 'key',
  amount: 100
}

describe('Razorpay.open', function() {
  it('should open new Razorpay instance', function() {
    var spy = sinon.spy(Razorpay.prototype, 'open');
    expect(Razorpay.open(options)).to.be.a(Razorpay);
    expect(spy.called).to.be(true);
    spy.restore();
  })
})

describe('Razorpay close method should', function() {
  var cf, rzp, spy;

  beforeEach(function() {
    rzp = Razorpay.open(options);
    cf = rzp.checkoutFrame;
  })

  afterEach(function() {
    spy.restore();
  })

  it('send close message to frame', function() {
    spy = sinon.stub(cf, 'postMessage');
    rzp.close();
    expect(spy.callCount).to.be(1);
    var spyCall = spy.getCall(0);
    expect(spyCall.thisValue).to.be(cf);
    expect(spyCall.args[0]).to.eql({
      event: 'close'
    })
  })

  it('be followable by re-open', function() {
    rzp.close();
    rzp.checkoutFrame.hasLoaded = true;
    spy = sinon.stub(cf, 'postMessage');
    rzp.open();
    expect(spy.callCount).to.be(1);
    var spyCall = spy.getCall(0);
    expect(spyCall.thisValue).to.be(cf);
  })
})
