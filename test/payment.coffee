payload =
  amount: 1000
  method: 'wallet'
  wallet: 'paytm'

baseUrl = RazorpayConfig.protocol + '://' + RazorpayConfig.hostname + '/' + RazorpayConfig.version;

describe 'Payment::', ->
  data = clone payload
  ajaxstub = sinon.stub $, 'ajax'
  r = Razorpay
    key: 'key'
    amount: 1000

  payment = new Payment data, {paused: true}, r

  describe 'format', ->
    data2 = null

    beforeEach ->
      data2 = clone payload

    it 'basic keys', ->
      params =
        fees: 'abc'
        powerwallet: 'def'
      payment.format data2, params, r

      expect payment.data
        .to.be data2

      expect payment.fees
        .to.be 'abc'

      expect payment.powerwallet
        .to.be 'def'

    it 'notes', ->
      data2.notes =
        foo: 1
        bar: 2

      payment.format data2, {}, r

      expectedNotes = {}

      for key, val of data2
        if /^notes/.test key
          expectedNotes[key] = val

      expect expectedNotes
        .to.eql
          'notes[foo]': 1
          'notes[bar]': 2