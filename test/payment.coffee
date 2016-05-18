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

  describe 'format', ->
    beforeEach ->
      data = clone payload
      payment = do mockPayment

    it 'basic keys', ->
      params =
        fees: 'abc'
        powerwallet: 'def'
      Payment::format.call payment, data, params

      expect payment.data
        .to.be data

      expect payment.fees
        .to.be 'abc'

      expect payment.powerwallet
        .to.be 'def'

    it 'notes', ->
      data.notes =
        foo: 1
        bar: 2

      Payment::format.call payment, data, {}

      expectedNotes = {}

      for key, val of data
        if /^notes/.test key
          expectedNotes[key] = val

      expect expectedNotes
        .to.eql
          'notes[foo]': 1
          'notes[bar]': 2
