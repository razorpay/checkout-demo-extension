describe 'CheckoutBridge should', ->
  spy = null
  message = event: 'evt'
  window.CheckoutBridge = onevt: jQuery.noop

  after ->
    window.CheckoutBridge = null

  afterEach ->
    spy.restore()

  it 'be notified if present', ->
    spy = sinon.stub window, 'notifyBridge'
    Razorpay.sendMessage message
    expect spy.called
      .to.be true

    expect spy.getCall(0).args[0]
      .to.be message

  it 'be called with given event', ->
    spy = sinon.stub CheckoutBridge, 'onevt'
    notifyBridge message
    expect spy.called
      .to.be true

  it 'be called with given event and data', ->
    message.data = 'some': 'data'
    spy = sinon.stub CheckoutBridge, 'onevt'
    notifyBridge message

    expect spy.called
      .to.be true
    
    expect spy.getCall(0).args[0]
      .to.be JSON.stringify message.data

  it 'not be notified if absent', ->
    window.CheckoutBridge = null
    spy = sinon.stub window, 'notifyBridge'
    Razorpay.sendMessage message

    expect spy.called
      .to.not.be true