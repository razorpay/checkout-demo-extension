iosUrl = '/test/fixtures/ios-checkout.html?platform=ios&key=key'
message =
  id: 'mehta'
  data: {}
  options:
    key: 'key'
    amount: 300
    prefill:
      contact: '18002700323'
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
      expect CheckoutBridge.onload.callCount
        .to.be 1