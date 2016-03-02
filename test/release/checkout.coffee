wd = require 'wd'
chai = require 'chai'
chaiAsPromised = require 'chai-as-promised'
chai.use chaiAsPromised
do chai.should

url = "file://#{process.env.PWD}/app/dist/v1/checkout.html"
browser = wd.promiseChainRemote()
  .init {browserName: 'firefox'}
  .get url

options =
  key: 'rzp_test_1DP5mmOlF5G5ag'
  amount: '30000'
  prefill:
    email: 'pra@nav.gupta'
    contact: '8879524924'

describe 'hello', ->
  it 'foo', -> 
    browser
      .get url
      .title()
      .should.become 'Razorpay Checkout'

  after ->
    browser
      .fin -> browser.quit()
      .done()