options =
  key: 'key'
  amount: 100

describe 'Razorpay.open', ->
  it 'should open new Razorpay instance', ->
    spy = sinon.spy Razorpay::, 'open'
    expect Razorpay.open options
      .to.be.a Razorpay

    expect spy.called
      .to.be true

    spy.restore()

describe 'Razorpay close method should', ->
  cf = rzp = spy = null
  beforeEach ->
    rzp = Razorpay.open options
    cf = rzp.checkoutFrame

  afterEach ->
    spy.restore()

  it 'send close message to frame', ->
    spy = sinon.stub cf, 'postMessage'
    rzp.close()

    expect spy.callCount
      .to.be 1

    spyCall = spy.getCall(0)
    expect spyCall.thisValue
      .to.be cf

    expect spyCall.args[0]
      .to.eql event: 'close'

  it 'be followable by re-open', ->
    rzp.close()
    rzp.checkoutFrame.hasLoaded = true
    spy = sinon.stub cf, 'postMessage'
    rzp.open()

    expect spy.callCount
      .to.be 1

    spyCall = spy.getCall(0)
    expect spyCall.thisValue
      .to.be cf

    # expect spyCall.args[0]
    #   .to.eql event: 'open'