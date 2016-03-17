getOptions = ->
  key: 'key'
  amount: 100


describe 'validateRequiredFields should check', ->
  arg = null
  key = null

  beforeEach ->
    arg = do getOptions
    key = null

  afterEach ->
    expect key
      .to.be.a 'string'

    expect validateRequiredFields
      .withArgs arg
      .to.throw key

  it 'missing key', ->
    key = 'key'
    delete arg[key]

  it 'empty key', ->
    key = 'key'
    arg[key] = ''

  it 'missing amount', ->
    key = 'amount'
    delete arg[key]

  it 'empty amount', ->
    key = 'amount'
    arg[key] = ''

describe 'base_configure should', ->
  describe 'throw if', ->
    it 'no options', ->
      expect base_configure
        .to.throw()

    describe 'invalid options', ->
      arg = null

      beforeEach ->
        arg = do getOptions

      afterEach ->
        expect base_configure
          .withArgs arg
          .to.throw()

      it 'primitive', ->
        arg = 2

      it 'primitive string', ->
        arg = 'hello'

      it 'NaN amount', ->
        arg.amount = NaN

      it 'amount < 100', ->
        arg.amount = 99

      it 'dot containing amount', ->
        arg.amount = 100.5

      it 'NaN string amount', ->
        arg.amount = 'asdf'

      it 'notes having > 15 fields', ->
        arg.notes = {}
        arg.notes[note] = note for note in [1..16]

      it 'invalid currency', ->
        arg.currency = 'USD'

      it 'invalid display_currency', ->
        arg.display_currency = 'YEN'

  describe 'return options object based on overrides:', ->
    opts = null

    beforeEach ->
      opts = do getOptions

    it 'basic options', ->
      optsObj = base_configure opts
      expect optsObj.get 'key'
        .to.eql opts.key
      expect optsObj.get 'amount'
        .to.eql opts.amount

      # check if no extra keys are appended to overrides
      expect do optsObj.get
        .to.eql opts

      expect do optsObj.get
        .to.not.be opts

    it 'backdropClose', ->
      opts.modal =
        backdropClose: true
      expect base_configure(opts).get 'modal.backdropclose'
        .to.be true

    it 'redirect', ->
      opts.redirect = true
      expect base_configure(opts).get 'redirect'
        .to.be true

      opts.redirect = false
      expect base_configure(opts).get 'redirect'
        .to.be false

    it 'parent', ->
      opts.parent = document.body
      expect base_configure(opts).get 'parent'
        .to.be document.body

describe 'discreet', ->
  describe 'support check', ->
    origUa = window.ua
    stub = null

    beforeEach ->
      stub = sinon.stub window, 'alert'

    afterEach ->
      window.ua = origUa
      stub.restore()

    it 'shouldnt alert supported browser', ->
      discreet.supported true
      expect stub.callCount
        .to.be 0

    it 'should alert unsupported browser', ->
      window.ua = 'Opera Mini/'
      expect discreet.supported true
        .to.be false
      expect stub.callCount
        .to.be 1

    it 'shouldnt alert unsupported browser if no showAlert flag', ->
      window.ua = 'Opera Mini/'
      expect discreet.supported()
        .to.be false
      expect stub.callCount
        .to.be 0

  describe 'defaultError', ->
    it 'should provide minimal error object', ->
      errorObj = discreet.defaultError()
      expect errorObj
        .to.only.have.key 'error'

      expect errorObj.error
        .to.only.have.key 'description'

      expect errorObj.error.description
        .to.be.a 'string'

  describe 'makeUrl', ->
    origVal = null
    before ->
      origVal = window.RazorpayConfig
      window.RazorpayConfig =
        protocol: 'foo'
        hostname: 'bar'
        version: 'baz'

    after ->
      window.RazorpayConfig = origVal

    it 'should return api url', ->
      expect discreet.makeUrl()
        .to.be 'foo://bar/baz'

    it 'should return unversioned api url', ->
      expect discreet.makeUrl true
        .to.be 'foo://bar/'


  describe 'isBase64Image', ->
    result = image = null

    afterEach ->
      expect discreet.isBase64Image image
        .to.be result

    it 'should determine base64 png', ->
      image = 'data:image/png;base64,R0lGOD'
      result = true

    it 'should determine base64 jpg', ->
      image = 'data:image/jpeg;base64,R0lGOD'
      result = true

    it 'should determine base64 gif', ->
      image = 'data:image/gif;base64,R0lGOD'
      result = true

    it 'should determine image path', ->
      image = 'http://image'
      result = false

    it 'should determine relative path', ->
      image = 'asdnk'
      result = false

  describe 'shouldAjax', ->
    it 'should return true for mobikwik in case of iframe', ->
      expect discreet.shouldAjax {wallet: 'mobikwik'}
        .to.be discreet.isFrame

      expect discreet.shouldAjax {wallet: 'paytm'}
        .to.not.be.ok()


  describe 'nextRequestRedirect', ->
    submitSpy = msgSpy = null
    request =
      url: 'url'
      content: 'content'
      method: 'method'

    beforeEach ->
      submitSpy = sinon.stub window, 'submitForm'
      Razorpay.sendMessage = jQuery.noop unless 'sendMessage' of Razorpay
      msgSpy = sinon.stub Razorpay, 'sendMessage'

    afterEach ->
      # cleanup
      submitSpy.restore()
      msgSpy.restore()

    it 'should send redirection message if in iframe', ->
      window.parent = null
      discreet.nextRequestRedirect request

      expect submitSpy.callCount
        .to.be 0

      expect msgSpy.callCount
        .to.be 1

      expect msgSpy.args[0][0]
        .to.eql
          event: 'redirect'
          data: request

      # cleanup
      window.parent = window

    it 'should submitForm if in parent', ->
      discreet.nextRequestRedirect request

      expect submitSpy.callCount
        .to.be 1

      expect msgSpy.callCount
        .to.be 0

      expect submitSpy.args[0]
        .to.eql [request.url, request.content, request.method]

describe 'setNotes', ->
  it 'should strip invalid types', ->
    opts = Options
      notes:
        foo: 'bar'
        baz: 2
        hello: true
        world: {}
        abc: jQuery.noop

    setNotes opts

    expect opts.get 'notes'
      .to.eql
        foo: 'bar'
        baz: 2
        hello: true

describe 'new Razorpay', ->
  it 'should call base_configure', ->
    spy = sinon.spy window, 'base_configure'
    options = do getOptions
    rzp = Razorpay options

    expect spy.callCount
      .to.be 1

    expect spy.calledWith options
      .to.be true

    expect spy.returnValues[0]
      .to.be.an Options

    # cleanup
    spy.restore()

  it 'should throw if invalid options', ->
    options = {}
    stub = sinon.stub window, 'base_configure'
      .throws()

    expect Razorpay
      .withArgs options
      .to.throw()

    # cleanup
    stub.restore()

describe 'Razorpay.configure', ->
  it 'should set Razorpay.defaults', ->
    origDefaults = Razorpay.defaults
    spy = sinon.spy window, 'base_configure'
    options = do getOptions
    Razorpay.configure options

    expect spy.callCount
      .to.be 1

    expect spy.calledWith options
      .to.be true

    expect spy.returnValues[0]
      .to.be Razorpay.defaults

    # cleanup
    spy.restore()
    Razorpay.defaults = origDefaults