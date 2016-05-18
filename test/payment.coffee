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
    data2 = clone payload
    params =
      fees: 'abc'
      powerwallet: 'def'

    payment.format data2, params, r

    expect payment.data
      .to.be data2