wd = require 'wd'
chai = require 'chai'
chaiAsPromised = require 'chai-as-promised'
chai.use chaiAsPromised
do chai.should

url = "file://#{process.env.PWD}/app/dist/v1/checkout.html"
browser = wd.promiseChainRemote()
  .init {browserName: 'chrome'}
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

    # driver.executeScript -> document.querySelector '#container'
    #   .then (result) ->
    #     expect(1).to.equal(2)
    #     done()
    #     driver.executeScript -> 'typeof Window'#"handleMessage({\"options\": #{JSON.stringify options}})"
    #       .then ->
    #         driver.executeScript -> document.querySelector '#container'
    #           .then ->
    #             # expect(result).to.be.null
    #             # expect(result).not.to.be.null
    #             done()
