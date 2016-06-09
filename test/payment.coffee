payload =
  key_id: 'key',
  amount: 1000
  method: 'wallet'
  wallet: 'paytm'

baseUrl = RazorpayConfig.api + RazorpayConfig.version;
baseRedirectUrl = baseUrl + 'payments/create/'

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
    payment = redirectStub = options = null

    beforeEach ->
      payment = do mockPayment
      options = payment.r.get()
      options.redirect = true
      redirectStub = sinon.stub discreet, 'redirect'

    afterEach ->
      do redirectStub.restore

    it 'popup shouldn\'t open', ->
      payment.checkRedirect.returns true
      Payment.call payment
      expect payment.tryPopup.called
        .to.be false

      # restore spy
      payment.checkRedirect.returns null

    it 'if redirect: false', ->
      options.redirect = false
      expect Payment::checkRedirect.call payment
        .to.not.be.ok()
      expect redirectStub.called
        .to.be false

    it 'if redirect: false', ->
      options.redirect = false
      expect Payment::checkRedirect.call payment
        .to.not.be.ok()
      expect redirectStub.called
        .to.be false

    it 'if redirect: true', ->
      expect Payment::checkRedirect.call payment
        .to.be(true)

      expect 'callback_url' of payment.data
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
      expect Payment::checkRedirect.call payment
        .to.be(true)
      expect payment.data.callback_url
        .to.be 'abc'

    it 'with fees: true', ->
      payment.fees = true
      expect Payment::checkRedirect.call payment
        .to.be(true)
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
      expect '_[source]' of data
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
      options.notes =
        yolo: 'swag'
        '1': 2

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

      expect 'name' of data
        .to.be false

      expect 'notes' of data
        .to.be false

      expect data['notes[yolo]']
        .to.be 'swag'

      expect data['notes[1]']
        .to.be 2

  describe 'generate', ->
    pollSpy = payment = onSpy = null

    beforeEach ->
      payment = do mockPayment
      pollSpy = sinon.stub window, 'pollPaymentData'
      onSpy = sinon.stub $::, 'on'
      onSpy.returns 'xyz'

    afterEach ->
      expect payment.offmessage
        .to.be 'xyz'

      do pollSpy.restore
      do onSpy.restore

    it 'write popup with popup template', ->
      payment.tryAjax = -> true

      templateStub = sinon.stub templates, 'popup'
      templateStub.returns 123

      Payment::generate.call payment
      expect templateStub.called
        .to.be false

      payment.popup =
        write: sinon.stub()
      Payment::generate.call payment

      expect payment.popup.write.callCount
        .to.be 1

      expect payment.popup.write.args[0][0]
        .to.be 123

      expect templateStub.callCount
        .to.be 1

      expect templateStub.args[0][0]
        .to.be payment

      expect pollSpy.called
        .to.be false

      do templateStub.restore

    it 'tryAjax', ->
      payment.message = 'qwer'
      payloadStub = sinon.stub window, 'setPayloadStorage'
      submitStub = sinon.stub window, 'submitForm'

      Payment::generate.call payment
      expect payloadStub.callCount
        .to.be 1

      expect payloadStub.args[0][0]
        .to.be 'qwer'

      expect submitStub.called
        .to.be false

      payment.popup =
        write: noop
        name: 345

      Payment::generate.call payment
      expect payloadStub.callCount
        .to.be 1

      expect submitStub.callCount
        .to.be 1

      expect submitStub.args[0]
        .to.eql [
          baseRedirectUrl + 'checkout',
          payment.data
          'post'
          345
        ]

      expect pollSpy.called
        .to.be false

      expect 'onComplete' of window
        .to.be false

    it 'discreet.isFrame', ->
      discreet.isFrame = true
      expect 'onComplete' of window
        .to.be false
      Payment::generate.call payment

      expect pollSpy.callCount
        .to.be 1

      expect pollSpy.args[0]
        .to.eql [window.onComplete]

      expect payment.complete.called
        .to.be false

      window.onComplete 2

      expect payment.complete.callCount
        .to.be 1

      expect payment.complete.args[0]
        .to.eql [2]

      expect payment.complete.calledOn payment
        .to.be true

      discreet.isFrame = false

  describe 'complete', ->
    payment = null
    beforeEach ->
      payment = do mockPayment

    it 'success', ->
      Payment::complete.call payment, {razorpay_payment_id: 'payid'}
      expect payment.emit.callCount
        .to.be 1

      expect payment.emit.args[0]
        .to.eql ['success', {razorpay_payment_id: 'payid'}]

    it 'error', ->
      Payment::complete.call payment, {error: {description: 'desc'}}
      expect payment.emit.callCount
        .to.be 1

      expect payment.emit.args[0]
        .to.eql ['error', {error: {description: 'desc'}}]

    it 'nothing if already done', ->
      payment.done = true
      Payment::complete.call payment, {error: {description: 'desc'}}
      expect payment.emit.called
        .to.be false
      expect payment.clear.called
        .to.be false

      payment.done = false

  describe 'clear', ->
    payment = null
    beforeEach ->
      payment = do mockPayment

    it 'unbind and cleanup', ->
      payment.popup =
        close: sinon.stub()

      payment.ajax =
        abort: sinon.stub()

      payment.offmessage = sinon.stub()
      clearPollingStub = sinon.stub window, 'clearPollingInterval'

      Payment::clear.call payment
      expect payment.popup.onClose
        .to.not.be.ok()

      expect payment.popup.close.callCount
        .to.be 1

      expect payment.ajax.abort.callCount
        .to.be 1

      expect payment.done
        .to.be true

      expect payment.offmessage.callCount
        .to.be 1

      expect clearPollingStub.callCount
        .to.be 1

      expect payment.r._payment
        .to.be null

      clearPollingStub.restore()

    it 'not throw if popup, offmessage and ajax arent set', ->
      clearPollingStub = sinon.stub window, 'clearPollingInterval'

      expect -> Payment::clear.call payment
        .to.not.throw()

      expect clearPollingStub.callCount
        .to.be 1

      expect payment.done
        .to.be true

      clearPollingStub.restore()