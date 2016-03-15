options = 
  'key': 'key_id'
  'amount': '40000'
  'name': 'Merchant Name'

request = data:
  key1: 'value1'
  key2: 'value2'
  notes:
    note1: 'one'
    note2: 'two'

describe 'Razorpay.payment.validate', ->
  it 'should raise if invalid data', ->
    spy = sinon.stub window, 'err'
    data = clone request.data
    delete data.key_id
    Razorpay.payment.validate data

    expect spy.called
      .to.be true

    spy.restore()

describe 'Razorpay.payment.authorize should', ->
  beforeEach ->
    Razorpay.configure key: 'key1'

  afterEach ->
    Razorpay.defaults.key = ''
    Razorpay.defaults.amount = ''

  it 'return razorpay object', ->
    expect Razorpay.payment.authorize data: amount: 1000
      .to.be.a Razorpay

  it 'should invoke rzp.authorizePayment', ->
    spy = sinon.stub Razorpay::, 'authorizePayment'
    Razorpay.payment.authorize data: amount: 2000
    expect spy.called
      .to.be true

    spy.restore()

describe 'getMethods', ->
  it 'should set Razorpay.payment.methods and call back', ->
    methods = {}
    stub = sinon.stub()
    spy = sinon.stub $, 'jsonp', (options) ->
      options.success methods

    Razorpay.payment.getMethods stub
    expect stub.called
      .to.be true

    spy.restore()
    
describe 'onMessage should invoke onComplete,', ->
  it 'but not if on origin', ->
    spy = sinon.stub discreet, 'onComplete'
    onMessage {}
    expect spy.called
      .to.be false