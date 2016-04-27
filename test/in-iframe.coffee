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

expectVisibleTab = (tab) -> -> expect(jQuery('#tab-' + tab)).toBeVisible()

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
      .to.be 2
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

describe 'init options.method', ->
  opts = disable = null

  beforeEach ->
    opts = clone coOptions
    delete opts.method
    window.payment_methods = clone orig_methods

  afterEach ->
    openCheckoutForm opts
    countVisible = 3 - disable.length
    expect jQuery('#tabs').hasClass('tabs-' + countVisible)
      .to.be true
    expect(jQuery('#tabs li').length)
      .to.be countVisible
    disable.forEach (meth) ->
      expect jQuery '#tab-' + meth
        .to.be.empty()

    for m2 of window.payment_methods
      if disable.indexOf(m2) < 0
        expect jQuery('#tab-' + m2 + ':visible')
          .to.have.length 1
    window.payment_methods = orig_methods

  it 'should enable all options by default and show card initially', ->
    disable = []

  for m of window.payment_methods
    # disable 1 tab, m is disabled one
    it 'should hide ' + m + ' if specified false', do (m) ->
      ->
        disableVal = if m is 'wallet' then [] else false
        window.payment_methods[m] = disableVal
        disable = [m]

    # disable 2 tabs, m is enabled one
    it 'should show only ' + m + ' if rest specified false', do (m) ->
      ->
        disable = []
        all_methods = Object.keys window.payment_methods
        all_methods.forEach (disabledTab) ->
          unless disabledTab is m
            disable.push disabledTab
            disableVal = if disabledTab is 'wallet' then [] else false
            window.payment_methods[disabledTab] = disableVal

# Tests on Credit Card page
describe 'Razorpay card tab', ->
  $name = $email = $contact = null
  beforeEach ->
    openCheckoutForm coOptions
    $name = jQuery '.input[name="card[name]"]'
    $email = jQuery '.input[name="email"]'
    $contact = jQuery '.input[name="contact"]'

  it 'should load modal and prefill fields', ->
    expect jQuery '#modal:visible'
      .to.have.length 1
    expect $name.val()
      .to.be coOptions.prefill.name
    expect $email.val()
      .to.be coOptions.prefill.email
    expect $contact.val()
      .to.be coOptions.prefill.contact

describe 'Razorpay card tab submit', ->
  extra = stub = nostub = $ccNumber = 
  $ccExpiry = $ccCVV = $name = $email = 
  $contact = $nbLink = $nbBank = $ccForm = 
  $ccSubmit = customOptions =
  [
    (o) -> o.method.netbanking = false
    (o) -> o.method.wallet = {}
    jQuery.noop
  ].forEach (operation) ->

    launch = ->
      # For opening the modal
      operation customOptions
      openCheckoutForm customOptions
      $ccNumber = jQuery '.input[name="card[number]"]'
      $ccExpiry = jQuery '.input[name="card[expiry]"]'
      $ccCVV = jQuery '.input[name="card[cvv]"]'
      $name = jQuery '.input[name="card[name]"]'
      $email = jQuery '.input[name="email"]'
      $contact = jQuery '.input[name="contact"]'
      $ccSubmit = jQuery '#submitbtn'
      $ccForm = jQuery '#form'

    addAllCC = ->
      $ccNumber.sendkeys cc.number
      $ccExpiry.val cc.expiry
      $ccCVV.sendkeys cc.cvv

    beforeEach ->
      extra = jQuery.noop
      customOptions = clone coOptions

    afterEach ->
      sendclick $ccSubmit[0]
      do extra

      if stub
        expect stub.called
          .to.be true
        do stub.restore

      if nostub
        expect nostub.called
          .to.be false
        do nostub.restore

    describe 'with all details in place', ->
      field = value = null
      afterEach ->
        launch()
        do addAllCC
        stub = sinon.stub Razorpay.payment, 'authorize'
        if field
          extra = ->
            expect stub.getCall(0).args[0].data[field]
              .to.be value

      it 'should submit with all details in place', launch

      describe ': in submitted data', ->
        it 'should pass email', ->
          field = 'email'
          value = customOptions.prefill.email

        it 'should pass contact', ->
          field = 'contact'
          value = customOptions.prefill.contact

        it 'should pass card[name]', ->
          field = 'card[name]'
          value = customOptions.prefill.name

        it 'should pass card[number]', ->
          field = 'card[number]'
          value = cc.number

        it 'should pass card[cvv]', ->
          field = 'card[cvv]'
          value = cc.cvv

        it 'should pass card[expiry_month]', ->
          field = 'card[expiry_month]'
          value = cc.expiry_month

        it 'should pass card[expiry_year]', ->
          field = 'card[expiry_year]'
          value = cc.expiry_year

        it 'should pass notes[address]', ->
          field = 'notes[address]'
          value = coOptions.notes.address

    describe 'validation error', ->
      afterEach ->
        nostub = sinon.stub Razorpay.payment, 'authorize'

      it 'should not submit without cc card', ->
        launch()
        $ccExpiry.val cc.expiry
        $ccCVV.val cc.cvv

      it 'should not submit without cc expiry', ->
        launch()
        $ccNumber.sendkeys cc.number
        $ccCVV.sendkeys cc.cvv
        
      it 'should not submit without cc cvv', ->
        launch()
        $ccCVV.val('').sendkeys '0'

      it 'should not submit without name', ->
        customOptions.prefill.name = ''
        launch()
        addAllCC()

      it 'should not submit without email', ->
        customOptions.prefill.email = ''
        launch()
        addAllCC()

      it 'should not submit without contact', ->
        customOptions.prefill.contact = ''
        launch()
        addAllCC()

    describe 'and getFormData method should return', ->
      co = data = null
      beforeEach ->
        launch()
        addAllCC()
        data = getFormData()

      it 'contact', ->
        expect data.contact
          .to.be coOptions.prefill.contact

      it 'email', ->
        expect data.email
          .to.be coOptions.prefill.email

      it 'name', ->
        expect data['card[name]']
          .to.be coOptions.prefill.name

      it 'card number', ->
        expect data['card[number]']
          .to.be cc.number

      it 'card expiry month', ->
        expect data['card[expiry_month]']
          .to.be cc.expiry_month

      it 'card expiry year', ->
        expect data['card[expiry_year]']
          .to.be cc.expiry_year

      it 'card cvv', ->
        expect data['card[cvv]']
          .to.be cc.cvv

      it 'not bank', ->
        expect data.bank
          .to.not.be.ok()

describe 'Razorpay open netbanking page and submit method', ->
  opts = stub = nostub = 
  $nbBank = $nbSubmit = null

  launch = (operation) ->
    clearSession()
    operation opts
    openCheckoutForm opts
    $nbBank = jQuery 'select[name="bank"]'
    sendclick jQuery('#tabs li[data-target="tab-netbanking"]')[0]

  beforeEach ->
    opts = clone coOptions

  afterEach ->
    sendclick jQuery('#submitbtn')[0]
    if stub
      expect stub.called
        .to.be true
      do stub.restore
    
    if nostub
      expect nostub.called
        .to.not.be true
      do nostub.restore

  [
    (o) -> o.method.card = false
    (o) -> o.method.wallet = {}
    jQuery.noop
  ].forEach (operation) ->
    beforeEach ->
      launch operation
      
    it 'should show netbanking form on clicking', ->
      expect jQuery('#tab-netbanking').hasClass('shown')
        .to.be true

    it 'should select bank', ->
      netb_bank = jQuery '#netb-banks input[type=radio]'
      do netb_bank[0].click
      expect jQuery('select').val()
        .to.be netb_bank.val()

    it 'should submit with all details in place', ->
      $nbBank.val 'SBIN'
      stub = sinon.stub Razorpay.payment, 'authorize'

    it 'should not submit without bank selected', ->
      nostub = sinon.stub Razorpay.payment, 'authorize'

    it 'should not submit without email', ->
      $nbBank.val 'SBIN'
      jQuery('.input[name="email"]').val ''
      nostub = sinon.stub Razorpay.payment, 'authorize'

    it 'should not submit without contact', ->
      $nbBank.val 'SBIN'
      jQuery('.input[name="contact"]').val ''
      nostub = sinon.stub Razorpay.payment, 'authorize'

describe 'Razorpay netbanking getFormData method', ->
  opts = data = null
  [
    (o) -> o.method.card = false
    (o) -> o.method.wallet = {}
    jQuery.noop
  ].forEach (operation) ->
    beforeEach ->
      opts = clone coOptions
      operation opts
      openCheckoutForm opts
      sendclick jQuery('#tabs li[data-target="tab-netbanking"]')[0]
      jQuery('select[name="bank"]').val 'SBIN'
      data = getFormData()

    describe '', ->
      it 'should return contact', ->
        expect data.contact
          .to.be coOptions.prefill.contact

      it 'should return email', ->
        expect data.email
          .to.be coOptions.prefill.email

      it 'should not return name', ->
        expect data['card[name]']
          .to.not.be.ok()

      it 'should not return card number', ->
        expect data['card[number]']
          .to.not.be.ok()

      it 'should not return card expiry month', ->
        expect data['card[expiry_month]']
          .to.not.be.ok()

      it 'should not return card expiry year', ->
        expect data['card[expiry_year]']
          .to.not.be.ok()

      it 'should not return card cvv', ->
        expect data['card[cvv]']
          .to.not.be.ok()

      it 'should return bank', ->
        expect data.bank
          .to.be 'SBIN'