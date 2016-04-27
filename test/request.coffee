payload =
  key_id: 'abc'
  amount: 1000
  currency: 'INR'
  method: 'wallet'
  wallet: 'paytm'

baseUrl = RazorpayConfig.protocol + '://' + RazorpayConfig.hostname + '/' + RazorpayConfig.version;

describe 'Request::', ->
  stub = sinon.stub $, 'ajax'

  describe 'nextRequest', ->
    describe 'write popup, if present', ->
      writestub = submitstub = null
      request = Request data: payload
      nextRequest =
        content: {}
        url: 'abc'

      beforeEach ->
        writestub = sinon.stub request, 'writePopup'
        submitstub = sinon.stub window, 'submitForm'

      afterEach ->
        writestub.restore()
        submitstub.restore()

      it 'direct', ->
        nextRequest.method = 'direct'
        request.nextRequest nextRequest
        expect writestub.getCall(0).args
          .to.eql [nextRequest.content]
        expect submitstub.called
          .to.be false

      it 'post', ->
        nextRequest.method = 'foobar'
        request.nextRequest nextRequest
        expect submitstub.getCall(0).args
          .to.eql [nextRequest.url, nextRequest.content, nextRequest.method, request.popup.name]
        expect writestub.called
          .to.be false

    describe 'write localStorage, if popup absent', ->
      request = Request data: payload
      request.popup = null
      writestub = sinon.stub request, 'writePopup'
      submitstub = sinon.stub window, 'submitForm'
      localStorage.removeItem 'payload'

      nextRequest =
        content: {}
        url: 'abc'
      request.nextRequest nextRequest

      expect writestub.called
        .to.be false
      expect submitstub.called
        .to.be false

      expect localStorage.getItem 'payload'
        .to.be.ok()

      writestub.restore()
      submitstub.restore()

  it 'make ajax url', ->
    request = Request data: payload
    expect request.makeUrl()
      .to.be baseUrl + 'payments/create/ajax'

  it 'make fees url', ->
    request = Request
      data: payload
      fees: true
    expect request.makeUrl()
      .to.be baseUrl + 'payments/create/fees'

    request = Request
      data: payload
      fees: true
      redirect: true
    expect request.makeUrl()
      .to.be baseUrl + 'payments/create/fees'

  it 'make redirect url', ->
    request = Request
      data: payload
      options: redirect: true
    expect request.makeUrl()
      .to.be baseUrl + 'payments/create/checkout'

  describe 'oncomplete callback', ->
    request = null
    response = {}

    beforeEach ->
      request = Request data: payload

    it 'should clear request', ->
      clearStub = sinon.stub request, 'clear'
      request.complete response

      expect clearStub.callCount
        .to.be 1
      clearStub.restore()

  describe 'success', ->
    request = Request data: payload
    doneInner = data = successStub = failStub = null
    done = -> do doneInner

    beforeEach ->
      successStub = sinon.stub request, 'success', done
      failStub = sinon.stub request, 'error'

    afterEach ->
      expect failStub.called
        .to.be false

      expect successStub.callCount
        .to.be 1

      expect successStub.getCall(0).args.length
        .to.be 1

      failStub.restore()
      successStub.restore()

    it 'invoke success if razorpay_payment_id', (doneCB)->
      data =
        razorpay_payment_id: 'abc'
        lolsorandom: 'yolo'

      request.complete data
      doneInner = ->
        expect successStub.getCall(0).args[0]
          .to.eql
            razorpay_payment_id: 'abc'
        do doneCB

      it 'invoke success with signature', (doneCB)->
        data =
          razorpay_payment_id: 'abc'
          lolsorandom: 'yolo'
          signature: 'foobar'

        request.complete data

        doneInner = ->
          expect successStub.getCall(0).args[0]
            .to.eql data
          do doneCB

  describe 'invoke error', ->
    data = successStub = failStub = null

    it 'blank string object', ->
      data = '{}'

    it 'blank object', ->
      data = {}

    it 'standard error', ->
      data = {error: {description: 'asd'}}

    afterEach (done)->
      request = Request data: payload
      successStub = sinon.stub request, 'success'
      failStub = sinon.stub request, 'error', ->
        expect successStub.called
          .to.be false

        expect failStub.callCount
          .to.be 1

        args = failStub.getCall(0).args
        expect args.length
          .to.be 1

        expect args[0].error
          .to.have.property 'description'

        if 'error' in data
          expect args[0].error.description
            .to.be data.error.description

        failStub.restore()
        successStub.restore()
        do done

      request.complete data

describe 'ajax callback', ->
  request = Request
    data: payload
    secondfactor: jQuery.noop
  complete = secondfactor = next = null

  beforeEach ->
    window.onComplete = null
    complete = sinon.stub Request::, 'complete'
    next = sinon.stub Request::, 'nextRequest'
    secondfactor = sinon.stub request, 'secondfactor'

  afterEach ->
    do complete.restore
    do secondfactor.restore
    do next.restore

  it 'next request (in-iframe)', ->
    discreet.isFrame = true
    requestData = {}
    fn = jQuery.noop

    ajaxCallback.call request, {request: requestData}

    expect complete.called
      .to.be false
    expect secondfactor.called
      .to.be false

    expect next.getCall(0).args
      .to.eql [requestData]

    discreet.isFrame = false

  it 'next request (razorpayjs)', ->
    requestData = {}
    fn = jQuery.noop

    ajaxCallback.call request, {request: requestData}
    expect complete.called
      .to.be false
    expect secondfactor.called
      .to.be false

    expect next.getCall(0).args
      .to.eql [requestData]

  it 'otp', ->
    requestData = {}
    fn = jQuery.noop
    sfstub = sinon.stub window, 'makeSecondfactorCallback'
      .returns fn

    ajaxCallback.call request, {type: 'otp', request: requestData}
    expect complete.called
      .to.be false
    expect next.called
      .to.be false

    expect sfstub.getCall(0).args
      .to.eql [request, requestData]

    expect secondfactor.getCall(0).args
      .to.eql [fn]

    sfstub.restore()

  describe 'immediate', ->
    result = null

    it 'success', ->
      result = {razorpay_payment_id: 'abc'}

    it 'error', ->
      result = {error: 2}

    afterEach ->
      ajaxCallback.call request, result
      expect window.onComplete
        .to.not.be.ok()
      expect complete.callCount
        .to.be 1
      expect complete.getCall(0).args[0]
        .to.be result
      expect secondfactor.called
        .to.be false
      expect next.called
        .to.be false