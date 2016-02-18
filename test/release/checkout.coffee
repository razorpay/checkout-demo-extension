require './parts/common'

describe 'private vars should not leak:', ->
	it '', ->
		['track', '$', 'discreet'].forEach (val, index) ->
			expect typeof window[val]
				.toBe 'undefined'

describe 'new Razorpay should throw if', ->
  options = execution = null

  beforeEach ->
    options =
      key: 'key'
      amount: 100
    execution = null
  
  afterEach ->
    do execution
    expect(-> new Razorpay(options)).toThrow()

  it 'invalid display_currency', ->
    execution = ->
      options.display_currency = 'INR'
      options.display_amount = '300'

  it 'display_currency without display_amount', ->
    execution = ->
      options.display_currency = 'USD'

  it 'NaN display_amount', ->
    execution = ->
      options.display_currency = 'USD'
      options.display_amount = NaN

  it 'string display_amount', ->
    execution = ->
      options.display_currency = 'USD'
      options.display_amount = 'asdf'
