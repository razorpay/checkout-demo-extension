payload =
  key_id: 'abc'
  amount: 1000
  currency: 'INR'
  method: 'wallet'
  wallet: 'paytm'

baseUrl = RazorpayConfig.protocol + '://' + RazorpayConfig.hostname + '/' + RazorpayConfig.version;

describe 'Request::', ->
  stub = sinon.stub $, 'ajax'
  
  it 'make ajax url', ->
    request = Request data: payload
    expect request.makeUrl()
      .to.be baseUrl + 'payments/create/ajax'

  it 'make fees url', ->
    request = Request
      data: payload
      fees: true
    expect request.makeUrl()
      .to.be baseUrl + 'payments/create/fees'

    request = Request
      data: payload
      fees: true
      redirect: true
    expect request.makeUrl()
      .to.be baseUrl + 'payments/create/fees'

  it 'make redirect url', ->
    request = Request
      data: payload
      options: redirect: true
    expect request.makeUrl()
      .to.be baseUrl + 'payments/create/checkout'


describe 'ajax callback', ->
  request = Request data: payload
  complete = secondfactor = next = null

  beforeEach ->
    window.onComplete = null
    complete = sinon.stub Request::, 'complete'
    secondfactor = sinon.stub Request::, 'secondfactor'
    next = sinon.stub Request::, 'nextRequest'

  afterEach ->
    do complete.restore
    do secondfactor.restore
    do next.restore

  describe 'immediate', ->
    result = null
    it 'success', ->
      result = {razorpay_payment_id: 'abc'}
    it 'error', ->
      result = {error: 2}
    afterEach ->
      ajaxCallback.call request, 
      expect complete.callCount
        .to.be 1
      expect complete.getCall(0).args[0]
        .to.be result
      expect secondfactor.called
        .to.be false
      expect next.called
        .to.be false