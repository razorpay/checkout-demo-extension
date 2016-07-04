iosUrl = '/test/fixtures/app.html?platform=ios&key=key'
message =
  id: 'mehta'
  data: {}
  options:
    key: 'key'
    amount: 300
    prefill:
      contact: '9414494144'
      email: 'pranav@razorpay.com'
    redirect: true

describe 'page load', ->
  browser.url iosUrl
  it 'should define Razorpay', ->
    exec ->
      expect typeof Razorpay
        .to.be 'function'

  it 'should have ios bridge defined', ->
    exec ->
      expect CheckoutBridge
        .to.have.keys 'onload', 'onsubmit', 'oncomplete', 'onsuccess', 'ondismiss', 'onfault'
      expect CheckoutBridge.onsuccess
        .to.be CheckoutBridge.oncomplete

  it 'should call onload by appending iframe', ->
    exec ->
      expect iosCB.onload.callCount
        .to.be 1

  it 'submit should pass payload', ->
    exec (message) ->
      handleMessage message
    , message

    browser.click '.payment-option[tab=netbanking]'
    browser.click 'label[for=bank-radio-SBIN]'
    browser.submitForm 'form'

    exec ->
      expect JSON.parse CheckoutBridge.get iosCB.onsubmit.args[0][0]
        .to.eql
          contact: '+919414494144'
          email: 'pranav@razorpay.com'
          method: 'netbanking'
          bank: 'SBIN'
          amount: '300'
