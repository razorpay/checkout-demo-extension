describe 'Razorpay should', ->
	it 'be defined', ->
		expect typeof Razorpay
			.toBe 'function'

describe 'new Razorpay', ->
	describe 'should throw if', ->
		executions = null

		beforeEach ->
			executions = []
		
		afterEach ->
			expect(execution).toThrow() for execution in executions

		it 'no options passed', ->
			executions.push -> new Razorpay()

		it 'primitive options passed', ->
			executions.push -> new Razorpay('foo')
			executions.push -> new Razorpay(2)
			executions.push -> new Razorpay(null)
			executions.push -> new Razorpay(true)
			executions.push -> new Razorpay(undefined)

		it 'options passed as empty object', ->
			executions.push -> new Razorpay({})

		describe 'invalid required parameter:', ->
			options = null

			afterEach ->
				executions.push -> new Razorpay(options)

			it 'no key', ->
				options =
					amount: 100

			it 'empty key', ->
				options =
					key: ''
					amount: 100

			it 'no amount', ->
				options =
					key: 'key'

			it 'empty amount', ->
				options =
					key: 'key'
					amount: ''

			it 'low amount', ->
				options =
					key: 'key'
					amount: 99

			it 'NaN amount', ->
				options =
					key: 'key'
					amount: NaN

			it 'amount contains dot', ->
				options =
					key: 'key'
					amount: 100.23

		describe 'invalid optional parameter:', ->
			options = null

			afterEach ->
				executions.push -> new Razorpay(options)

			beforeEach ->
				options =
					key: 'key'
					amount: 100

			it 'blank currency', ->
				options.currency = ''

			it 'currency other than INR', ->
				options.currency = 'USD'

			it 'more than 15 notes', ->
				options.notes = {}
				options.notes[num] = num for num in [0..15]

	describe 'set string options', ->
		options = key = value = null

		beforeEach ->
			options =
				key: 'key'
				amount: 100

		afterEach ->
			options[key] = value
			expect new Razorpay(options).options[key]
				.toBe value

		it 'key', ->
			key = 'key'
			value = 'foo'

		it 'amount', ->
			key = 'amount'
			value = '200'

		it 'currency', ->
			key = 'currency'
			value = 'INR'

		it 'description', ->
			key = 'description'
			value = 'foo'

		it 'name', ->
			key = 'name'
			value = 'bar'

		it 'callback_url', ->
			key = 'callback_url'
			value = 'google.com'

		it 'buttontext', ->
			key = 'buttontext'
			value = 'won yap'

		it 'signature', ->
			key = 'signature'
			value = 'baz'

	describe 'set notes', ->
		it '', ->
			notes = new Razorpay(
				key: 'key'
				amount: 100
				notes:
					note1: 'string'
					note2: 1999
					note3: true
					note4: false
					note5: undefined
					note6: null
					note7: [1, 2, 3]
					note8: ->
			).options.notes

			expect(notes.note1).toBe 'string'
			expect(notes.note2).toBe 1999
			expect(notes.note3).toBe true
			expect(notes.note4).toBe false
			expect(notes.note5).not.toBeDefined()
			expect(notes.note6).not.toBeDefined()
			expect(notes.note7).not.toBeDefined()
			expect(notes.note8).not.toBeDefined()

	describe 'set functions:', ->
		options = null

		beforeEach -> options =
			key: 'key'
			amount: 100

		it 'handler', ->
			handler = ->
			options.handler = handler
			expect new Razorpay(options).options.handler
				.toBe handler

		it 'modal ondismiss callback', ->
			ondismiss = ->
			options.modal =
				ondismiss: ondismiss

			expect new Razorpay(options).options.modal.ondismiss
				.toBe ondismiss