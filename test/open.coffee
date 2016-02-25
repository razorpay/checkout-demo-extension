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