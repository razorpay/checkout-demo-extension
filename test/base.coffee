options =
  key: 'key'
  amount: 100

describe 'new Razorpay', ->
  describe 'should throw if', ->
    it 'no options', ->
      expect(Razorpay).to.throw()

    describe 'invalid options', ->
      arg = null

      beforeEach ->
        arg = clone options

      afterEach ->
        expect Razorpay
          .withArgs arg
          .to.throw()

      it 'primitive', ->
        arg = 2

      it 'primitive string', ->
        arg = 'hello'

      it 'missing key', ->
        delete arg.key

      it 'empty key', ->
        arg.key = ''

      it 'missing amount', ->
        delete arg.amount

      it 'NaN amount', ->
        arg.amount = NaN

      it 'amount < 100', ->
        arg.amount = 99

      it 'dot containing amount', ->
        arg.amount = 100.5

      it 'empty amount', ->
        arg.amount = ''

      it 'NaN string amount', ->
        arg.amount = 'asdf'

      it 'notes having > 15 fields', ->
        arg.notes = {}
        arg.notes[note] = note for note in [1..16]