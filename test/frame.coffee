options =
  key: 'key'
  amount: 100

base64image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAL4AAAC+CAIAAAAEFiLKAAAAA3NCSVQICAjb4U/'

describe 'doc', ->
  it 'should be documentElement', ->
    expect doc
      .to.be document.body

    expect docStyle
      .to.be doc.style

describe 'restoreOverflow', ->
  it 'should set body overflow to merchant stored overflow', ->
    docStyle.overflow = 'inherit'
    merchantMarkup.overflow = 'visible'
    do restoreOverflow
    expect docStyle.overflow
      .to.be merchantMarkup.overflow

describe 'restoreMeta', ->
  it 'should append old meta to <head>', ->
    $meta =
      remove: sinon.stub()

    div = document.createElement 'div'
    spy = sinon.stub window, 'getMeta'
      .returns div

    restoreMeta $meta
    expect document.head.contains div
      .to.be true
    expect $meta.remove.callCount
      .to.be 1

    spy.restore()

describe 'getEncodedMessage', ->
  it 'should return base64 encoded message', ->
    message = foo: 'bar'
    spy = sinon.stub window, 'makeCheckoutMessage'
      .returns message

    expect getEncodedMessage 2
      .to.be btoa JSON.stringify message
    expect spy.getCall(0).args[0]
      .to.be 2

    spy.restore()

describe 'normalize image option if', ->
  baseUrl = location.protocol + '//' + location.hostname + (if location.port then ':' + location.port else '')
  opts = image = result = null

  afterEach ->
    opts = image: image
    sanitizeImage opts
    expect opts.image
      .to.be result

  it 'path relative url', ->
    image = 'abcdef'
    result = baseUrl + '/abcdef'

  it 'server relative url', ->
    image = '/hello/world'
    result = baseUrl + '/hello/world'

  it 'absolute url', ->
    image = 'https://hello/world'
    result = 'https://hello/world'

  it 'base64', ->
    image = base64image
    result = base64image

# describe 'makeCheckoutUrl should', ->
#   it 'compose default checkout url without key', ->
#     expect makeCheckoutUrl {}
#       .to.be RazorpayConfig.protocol + '://' + RazorpayConfig.hostname + '/checkout.php'

#   it 'compose checkout view url with key', ->
#     expect makeCheckoutUrl key: 'foo'
#       .to.be RazorpayConfig.protocol + '://' + RazorpayConfig.hostname + '/v1/checkout?key_id=foo'

describe 'makeCheckoutMessage should', ->
  opts =
    key: 'key'
    amount: '1000'
    redirect: noop
    image: 'abcdef'
    hello: 'world'
    nested: key: 'value'
    modal: {}
    func: noop
  rzp = Razorpay opts
  rzp.id = 'someid'
  rzp.modal = options: dismiss: 'hidden'

  it 'set options and modal.options to options.modal', ->
    message = makeCheckoutMessage rzp
    expect rzp.get 'modal.dismiss'
      .to.be rzp.modal.options.dismiss

    # checking general options
    expect message.options
      .to.not.have.property 'func'

    expect 'nested' in message.options
      .to.be false
    expect 'nested.key' in message.options
      .to.be false
    expect 'hello' in message.options
      .to.be false

    # checking image, as absolute url
    imageOption = image: rzp.get 'image'
    sanitizeImage imageOption

    expect message.options.image
      .to.be imageOption.image

    expect message.context
      .to.be location.href

    expect message.config
      .to.be RazorpayConfig

    expect message.id
      .to.be rzp.id

  it 'set redirect option', ->
    message = makeCheckoutMessage rzp
    expect message.options.redirect
      .to.not.be.ok()

    rzp.get().redirect = true

    message = makeCheckoutMessage rzp
    expect message.options.redirect
      .to.be true

describe 'checkoutFrame on receiveing message from frame contentWindow', ->
  rzp = Razorpay options
  cf = new CheckoutFrame rzp
  src = makeCheckoutUrl rzp.get 'key'

  describe 'return if source isnt valid:', ->
    spyNotCalled = event = null

    afterEach ->
      spyNotCalled = sinon.stub cf, 'onredirect'
      cf.onmessage event
      expect spyNotCalled.called
        .to.be false
      spyNotCalled.restore()

    it 'invalid origin', ->
      event =
        origin: 'asd'
        data: JSON.stringify(
          source: 'frame'
          event: 'redirect'
          id: rzp.id)

    it 'invalid source', ->
      event =
        origin: src
        data: JSON.stringify(
          source: 'frame2'
          event: 'redirect'
          id: rzp.id)

    it 'invalid id', ->
      event =
        origin: src
        data: JSON.stringify(
          source: 'frame'
          event: 'redirect'
          id: 11)

  describe 'invoke onevent methods: ', ->
    spy = null

    message = (event, data) ->
      cf.onmessage
        source: cf.el.contentWindow
        origin: src
        data: JSON.stringify
          source: 'frame'
          event: event
          id: rzp.id
          data: data

    afterEach ->
      if spy
        expect spy.callCount
          .to.be 1

        spy.restore() if 'restore' of spy

    it 'generic', ->
      spy = cf.onevent = sinon.spy()
      message 'event'
      delete cf.onevent

    it 'load', ->
      cf.loadedCallback = jQuery.noop unless cf.loadedCallback
      expect cf.hasLoaded
        .to.not.be.ok()

      spy = sinon.spy cf, 'loadedCallback'
      message 'load'

      expect cf.hasLoaded
        .to.be true

      expect spy.callCount
        .to.be 1

      expect spy.getCall(0).thisValue
        .to.be cf

    it 'redirect', ->
      spy = sinon.stub discreet, 'nextRequestRedirect'
      message 'redirect', foo: 2
      expect spy.getCall(0).args[0]
        .to.eql foo: 2

    it 'submit', ->
      spy = sinon.stub()
      opts = rzp.get()
      opts['external.wallets'] = ['payu']
      opts['external.handler'] = spy

      message 'submit', {method: 'wallet', wallet: 'paytm'}
      expect spy.callCount
        .to.be 0
      message 'submit', wallet: 'payu'
      expect spy.callCount
        .to.be 0

      message 'submit', {method: 'wallet', wallet: 'payu'}
      expect spy.callCount
        .to.be 1

      expect spy.getCall(0).thisValue
        .to.be rzp

    it 'dismiss', ->
      spy = rzp.get()['modal.ondismiss'] = sinon.stub()
      spy2 = sinon.stub cf, 'close'
      message 'dismiss'
      
      expect spy2.callCount
        .to.be 1
      expect spy2.getCall(0).thisValue
        .to.be cf

      spy2.restore()

    it 'hidden', ->
      spy = rzp.get()['modal.onhidden'] = sinon.stub()
      spy2 = sinon.stub cf, 'afterClose'
      message 'hidden'


      expect spy2.callCount
        .to.be 1

      expect spy2.getCall(0).thisValue
        .to.be cf

      spy2.restore()

    it 'success', (done) ->
      rzp.get().handler = (data) ->
        expect data
          .to.eql foo: 4
        done()

      spy = sinon.stub cf, 'close'
      message 'complete', foo: 4
      expect spy.callCount
        .to.be 1

      expect spy.getCall(0).thisValue
        .to.be cf

    it 'failure', ->
      spy = sinon.stub cf, 'ondismiss'
      spy2 = sinon.stub cf, 'onhidden'
      message 'failure', error: ''
      
      expect spy2.callCount
        .to.be 1

      expect spy2.getCall(0).thisValue
        .to.be cf

      spy2.restore()

    it 'fault', ->
      spy = sinon.stub rzp, 'close'
      message 'fault'

describe 'checkoutFrame.close', ->
  it 'should restore merchantMarkup', ->
    spy = sinon.stub window, 'setBackdropColor'
    spy2 = sinon.stub window, 'restoreMeta'
    spy3 = sinon.stub window, 'restoreOverflow'

    rzp = Razorpay options
    cf = new CheckoutFrame rzp
    cf.close()

    expect spy.called
      .to.be true

    expect spy2.called
      .to.be true

    expect spy3.called
      .to.be true

    expect spy2.getCall(0).args[0]
      .to.be cf.$meta


describe 'afterClose should', ->
  rzp = cf = null

  beforeEach ->
    rzp = Razorpay options
    cf = new CheckoutFrame rzp

  it 'hide container and unbind', ->
    expect jQuery(frameContainer).is(':visible')
      .to.be true

    spy = sinon.stub cf, 'unbind'
    cf.afterClose()
    expect jQuery(frameContainer).is(':visible')
      .to.be false
    
    expect spy.callCount
      .to.be 1

    spy.restore()

describe 'if shouldFixFixed,', ->
  cf = null

  beforeEach ->
    cf = new CheckoutFrame

  it 'scroll, orientationchange listener should be bound', ->
    cf.bind()
    oldlen = cf.listeners.length
    cf.unbind()

    window.shouldFixFixed = true
    cf.bind()

    expect cf.listeners.length > oldlen
      .to.be true

    window.shouldFixFixed = false