options =
  key: 'key'
  amount: 100

describe 'validateRequiredFields should check', ->
  arg = null
  key = null

  beforeEach ->
    arg = clone options
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
        arg = clone options

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

      it 'invalid parent', ->
        arg.parent = 2

  describe 'return options object based on overrides:', ->
    opts = null

    beforeEach ->
      opts = clone options

    it 'basic options', ->
      expect base_configure(opts).key = options.key
      expect base_configure(opts).amount = options.amount

      # check if no extra keys are appended to overrides
      expect opts
        .to.eql options

    it 'backdropClose', ->
      opts.modal =
        backdropClose: true
      expect base_configure(opts).modal.backdropclose
        .to.be true

    it 'redirect', ->
      opts.redirect = true
      expect base_configure(opts).redirect()
        .to.be(true)

      opts.redirect = false
      expect base_configure(opts).redirect()
        .to.be(false)

    it 'parent', ->
      opts.parent = document.body
      expect base_configure(opts).parent
        .to.be document.body

describe 'discreet', ->
  describe 'setNotes', ->
    it 'should copy notes into first argument from second', ->
      opts = {}
      overrides =
        notes:
          foo: 'bar'
          baz: 2
          hello: true
          world: {}

      discreet.setNotes opts, overrides

      # no ref copy
      expect opts.notes
        .to.not.be overrides.notes

      expect opts.notes
        .to.eql
          foo: 'bar'
          baz: 2
          hello: true

  describe 'nextRequestRedirect', ->
    submitSpy = msgSpy = null
    request =
      url: 'url'
      content: 'content'
      method: 'method'

    beforeEach ->
      submitSpy = sinon.stub window, 'submitForm'
      Razorpay.sendMessage = jQuery.noop unless 'sendMessage' in Razorpay
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


describe 'new Razorpay', ->
  it 'should call base_configure', ->
    spy = sinon.spy window, 'base_configure'
    rzp = Razorpay options

    expect spy.callCount
      .to.be 1

    expect spy.calledWith options
      .to.be true

    expect spy.returnValues[0]
      .to.be rzp.options

    # cleanup
    spy.restore()

  it 'should throw if invalid options', ->
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