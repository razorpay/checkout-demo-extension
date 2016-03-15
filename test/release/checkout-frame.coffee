require './parts/common'

window.payment_methods =
	entity: 'methods'
	card: true
	netbanking:
		HDFC: 'HDFC Bank'
		SBI: 'State Bank'
	wallet:
		paytm: true
		mobikwik: false
		payzapp: false

describe 'handleMessage should', ->

	it 'be defined', ->
		expect typeof handleMessage
			.toBe 'function'

	it 'show checkout form', ->
		expect jQuery('#container').length
			.toBe(0)
		# handleMessage({id: '4o4VoU9Zseg1GA', options: {key: 'rzp_test_1DP5mmOlF5G5ag', amount: '30000'}});
		# expect(jQuery('#container').length).toBe(1);
