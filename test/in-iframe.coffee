sinon.stub $, 'ajax'
window.preferences =
  methods:
    card: true
    netbanking:
      HDFC: 'HDFC Bank'
      UTIB: 'Axis Bank'
      BARB: 'Bank of Baroda'
      SBIN: 'State Bank of India'
    wallet: 'paytm': true

orig_methods = window.preferences.methods

cc =
  number: '4111111111111111'
  expiry: '11 / 23'
  cvv: '456'
  expiry_month: '11'
  expiry_year: '23'

coOptions =
  'key': 'key_id'
  'amount': '5100'
  'name': 'Daft Punk'
  'description': 'Tron Legacy'
  'method':
    'netbanking': true
    'card': true
    'wallet': true
  'prefill':
    'name': 'Shashank Mehta'
    'email': 'sm@razorpay.com'
    'contact': '9999999999'
  notes: 'address': 'Hello World'

clearSession = ->
  session = getSession()
  if session
    session.close()
    delete sessions[_uid]

openCheckoutForm = (options, data) ->
  clearSession()
  handleMessage
    id: generateUID()
    options: options
    data: data

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

describe 'init options.method', ->
  opts = disableTab = null
  it 'should hide netbanking if method.netbanking == false', ->
    disableTab = 'netbanking'
  it 'should hide card if method.card == false', ->
    disableTab = 'card'
  beforeEach ->
    opts = clone coOptions

  afterEach ->
    opts.method[disableTab] = false
    openCheckoutForm opts
    expect jQuery('.tab-content').length
      .to.be 3
    expect jQuery('#tab-' + disableTab).length
      .to.be 0

describe 'nextRequestRedirect', ->
  it 'should postMessage data to parent if inside iframe', ->
    parent = window.parent
    window.parent = postMessage: jQuery.noop
    nextRequestData = {}
    stub = sinon.stub Razorpay, 'sendMessage'
    discreet.redirect nextRequestData

    msg = stub.getCall(0).args[0]
    expect stub.callCount
      .to.be 1

    expect msg.event
      .to.be 'redirect'
    expect msg.data
      .to.be nextRequestData
    window.parent = parent
    stub.restore()

describe 'payment authorization', ->
  opts = null

  beforeEach ->
    opts = clone coOptions

  describe 'error handler should', ->
    response = error: {}

    beforeEach ->
      openCheckoutForm opts
      session = getSession()
      session.rzp = Razorpay
        key: 'key'
        amount: 100

    it 'display default error discription', ->
      errorHandler.call getSession(), response
      expect jQuery '#error-message:visible'
        .to.have.length 1
      expect jQuery('#fd-t').html().length
        .to.be.ok()

    it 'display custom error description', ->
      str = 'hello error'
      response.error.description = str
      errorHandler.call getSession(), response
      expect jQuery '#error-message:visible'
        .to.have.length 1
      expect jQuery('#fd-t').html()
        .to.be str

    it 'focus related field and apply invalid', ->
      field_el = jQuery 'input[name]:not([type=hidden]):eq(1)'
      response.error.field = field_el.prop 'name'
      errorHandler.call getSession(), response
      expect jQuery '#error-message:visible'
        .to.have.length 1
      expect field_el[0]
        .to.be document.activeElement
      expect field_el.parent().hasClass 'invalid'
        .to.be true

  it 'success handler should hide form', ->
    openCheckoutForm opts
    getSession().rzp = Razorpay
      key: 'key'
      amount: 100
    session = getSession()

    stub = sinon.stub session.modal, 'hide'
    successHandler.call session
    expect stub.callCount
      .to.be 1
    stub.restore()

# TODO
# shouldn't move to next tabs w/o phone,email validation
# submission payload validation -> reconcile with authorize.js
# powerwallets
