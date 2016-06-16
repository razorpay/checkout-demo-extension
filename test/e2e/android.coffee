checkoutPostUrl = 'file:///v1/payments/create/checkout'
androidUrl = '/test/fixtures/app.html?platform=android&key=key'
message =
  id: 'mehta'
  data: {}
  options:
    key: 'key'
    amount: '300'
    description: 'hello'
    prefill:
      contact: '18002700323'
      email: 'pranav@razorpay.com'
    redirect: true
    notes:
      sooji: 'hai'

commonSubmitData =
  '_[id]': message.id
  '_[checkout]': 'true'
  '_[medium]': 'android'
  key_id: message.options.key
  amount: message.options.amount
  contact: message.options.prefill.contact
  email: message.options.prefill.email
  currency: 'INR'
  description: 'hello'
  'notes[sooji]': 'hai'

describe 'page load', ->
  browser.url androidUrl
  it 'should define Razorpay', ->
    exec ->
      expect typeof Razorpay
        .to.be 'function'

  it 'onload: pass options from android to checkout', ->
    exec ->
      expect CheckoutBridge.onload.callCount
        .to.be 1

  it 'render payment form', ->
    exec (message) ->
      expect document.querySelector '#container'
        .to.be null
      expect CheckoutBridge.onrender.called
        .to.be false

      handleMessage message

      expect document.querySelector '#container'
        .to.be.ok()
      expect CheckoutBridge.onrender.callCount
        .to.be 1
    , message

describe 'redirect on submit with valid payload', ->
  it 'submit', ->
    browser.url androidUrl
    exec (message) ->
      handleMessage message
      expect HTMLFormElement::submit.called
        .to.be false
    , message
    browser.click '.payment-option[tab=netbanking]'
    browser.click 'label[for=bank-radio-SBIN]'
    browser.submitForm 'form'

    exec (message, checkoutPostUrl, commonSubmitData) ->
      form = HTMLFormElement::submit.thisValues[0]
      expect form.getAttribute 'method'
        .to.be 'post'

      expect form.getAttribute 'action'
        .to.be checkoutPostUrl

      payload = {}
      Array::forEach.call form.querySelectorAll('input'), (input) -> payload[input.name] = input.value

      submitData = JSON.parse JSON.stringify commonSubmitData
      submitData.bank = 'SBIN'
      submitData.method = 'netbanking'
      submitData['_[context]'] = location.href

      expect payload
        .to.eql submitData
    , message, checkoutPostUrl, commonSubmitData

  it 'wallet submit: otp needed', ->
    browser.url androidUrl
    exec (message) ->
      handleMessage message
    , message
    browser.click '.payment-option[tab=wallet]'
    browser.click 'label[for=wallet-radio-payumoney]'

    expect browser.isVisible '#form-otp'
     .to.be false

    exec ->
      window.fakeXHR = sinon.useFakeXMLHttpRequest()
      fakeXHR.onCreate = (request) ->
        window.fakeRequest = request

    browser.submitForm 'form'
    exec (commonSubmitData) ->
      expect HTMLFormElement::submit.called
        .to.be false

      expect window.fakeRequest.url
        .to.be 'file:///v1/payments/create/ajax?key_id=key'

      expect window.fakeRequest.method
        .to.be 'post'

      payload = {}

      submitData = JSON.parse JSON.stringify commonSubmitData
      submitData.method = 'wallet'
      submitData.wallet = 'payumoney'
      submitData['_[context]'] = location.href
      submitData['_[source]'] = 'checkoutjs'
      delete submitData.key_id

      window.fakeRequest.requestBody.split('&').forEach (val) ->
        val = val.split '='
        payload[val[0]] = decodeURIComponent val[1]

      expect submitData
        .to.eql payload

      window.fakeRequest.respond 200, {}, JSON.stringify
        payment_id: 'pay'
        type: 'otp'
        request:
          url: 'topupurl'

      expect document.querySelector('#form-otp').getBoundingClientRect().width
        .to.be.ok()
    , commonSubmitData
