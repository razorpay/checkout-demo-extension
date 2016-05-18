payload =
  key_id: 'key',
  amount: 1000
  method: 'wallet'
  wallet: 'paytm'

baseUrl = RazorpayConfig.protocol + '://' + RazorpayConfig.hostname + '/' + RazorpayConfig.version;

r = Razorpay
  key: 'key'
  amount: 1000

mockPayment = (payment) ->
  unless payment
    payment =
      data: clone payload
      r: r
      ajax: null
      done: false
      fees: false
      powerwallet: false
      popup: null
      payment_id: ''

  for methodName, methodFunc of Payment::
    if typeof methodFunc is 'function'
      payment[methodName] = sinon.stub()

  payment

describe 'Payment::', ->
  payment = data = r2 = null

  describe 'on', ->
    payment = do mockPayment
    stub = sinon.stub payment.r, 'on'

    mockListener = ->
    bindStub = sinon.stub window, 'bind'
    bindStub.returns mockListener

    Payment::on.call payment, 'some', noop

    expect stub.callCount
      .to.be 1

    expect stub.args[0]
      .to.eql ['some', mockListener, 'payment']

    expect bindStub.callCount
      .to.be 1

    expect bindStub.args[0]
      .to.eql [noop, payment]

    bindStub.restore()
    stub.restore()

  describe 'emit', ->
    payment = do mockPayment
    stub = sinon.stub payment.r, 'emit'

    Payment::emit.call payment, 'some', noop

    expect stub.callCount
      .to.be 1

    expect stub.args[0]
      .to.eql ['payment.some', noop]

    stub.restore()

  describe 'off', ->
    payment = do mockPayment
    stub = sinon.stub payment.r, 'off'

    Payment::off.call payment

    expect stub.callCount
      .to.be 1

    expect stub.args[0]
      .to.eql ['payment']

    stub.restore()

  describe 'redirect', ->
    baseRedirectUrl = discreet.makeUrl() + 'payments/create/'
    payment = redirectStub = options = null

    beforeEach ->
      payment = do mockPayment
      options = payment.r.get()
      options.redirect = true
      redirectStub = sinon.stub discreet, 'redirect'

    afterEach ->
      do redirectStub.restore

    it 'if redirect: false', ->
      options.redirect = false
      Payment::checkRedirect.call payment
      expect redirectStub.called
        .to.be false

    it 'if redirect: true', ->
      Payment::checkRedirect.call payment

      expect 'callback_url' in payment.data
        .to.be false

      expect redirectStub.callCount
        .to.be 1
      expect redirectStub.args[0][0]
        .to.eql
          url: baseRedirectUrl + 'checkout'
          content: payment.data
          method: 'post'

    it 'if redirect: true, and callback_url specified', ->
      options.callback_url = 'abc'
      Payment::checkRedirect.call payment
      expect payment.data.callback_url
        .to.be 'abc'

    it 'with fees: true', ->
      payment.fees = true
      Payment::checkRedirect.call payment
      expect redirectStub.args[0][0]
        .to.eql
          url: baseRedirectUrl + 'fees'
          content: payment.data
          method: 'post'

  describe 'format', ->
    beforeEach ->
      data = clone payload
      payment = do mockPayment

    it 'basic keys', ->
      params =
        fees: 'abc'
        powerwallet: 'def'
      Payment::format.call payment, data, params

      log 'set payment.data'
      expect payment.data
        .to.be data

      log 'set payment.fees'
      expect payment.fees
        .to.be 'abc'

      log 'set payment.powerwallet'
      expect payment.powerwallet
        .to.be 'def'

      log 'set data._.source to checkoutjs if powerwallet specified'
      expect data['_[source]']
        .to.be 'checkoutjs'

    it 'notes', ->
      data.notes =
        foo: 1
        bar: 2
        nested: {}

      Payment::format.call payment, data, {}

      expectedNotes = {}

      for key, val of data
        if /^notes/.test key
          expectedNotes[key] = val

      log 'expand notes'
      expect expectedNotes
        .to.eql
          'notes[foo]': 1
          'notes[bar]': 2

      log 'set data._.source to checkoutjs if powerwallet specified'
      expect '_[source]' in data
        .to.be false

    it 'fill data from options', ->
      data =
        signature: 'foo'

      options = r.get()
      options.currency = 'INR'
      options.signature = 'qwer'
      options.description = 'zxcv'
      options.order_id = '1911'
      options.name = 'name'

      r2 = Razorpay options
      options = r2.get()

      Payment::format.call payment, data, {}

      expect data.amount
        .to.be options.amount

      expect data.key_id
        .to.be options.key

      expect data.currency
        .to.be options.currency

      expect data.signature
        .to.be 'foo'

      expect data.description
        .to.be options.description

      expect data.order_id
        .to.be options.order_id

      expect 'name' in data
        .to.be false

  describe 'generate', ->
    payment = null
    beforeEach ->
      payment = do mockPayment