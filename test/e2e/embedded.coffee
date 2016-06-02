embeddedUrl = '/test/fixtures/embedded.html'

options =
  key: 'key'
  amount: '300'
  parent: '#embedded-container'
  prefill:
    contact: '18002700323'
    email: 'pranav@razorpay.com'

describe 'page load', ->
  browser.url embeddedUrl
  it 'should append iframe', ->
    exec (options) ->
      Razorpay options
      expect document.querySelector '#embedded-container iframe'
        .to.be.ok()
    , options