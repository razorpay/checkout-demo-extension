checkoutPostUrl = 'https://api.razorpay.com/v1/payments/create/checkout'
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
      expect HTMLFormElement.prototype.submit.called
        .to.be false
    , message
    browser.click '.payment-option[tab=netbanking]'
    browser.click 'label[for=bank-radio-SBIN]'
    browser.submitForm 'form'

    exec (message, checkoutPostUrl) ->
      form = HTMLFormElement.prototype.submit.thisValues[0]
      expect form.getAttribute 'method'
        .to.be 'post'

      expect form.getAttribute 'action'
        .to.be checkoutPostUrl

      payload = {}
      Array::forEach.call form.querySelectorAll('input'), (input) -> payload[input.name] = input.value

      expect payload
        .to.eql
          '_[id]': message.id
          '_[context]': location.href
          '_[checkout]': 'true'
          '_[medium]': 'android'
          key_id: message.options.key
          amount: message.options.amount
          contact: message.options.prefill.contact
          email: message.options.prefill.email
          currency: 'INR'
          bank: 'SBIN'
          description: 'hello'
          method: 'netbanking'
          'notes[sooji]': 'hai'
    , message, checkoutPostUrl