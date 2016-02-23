options =
  key: 'key'
  amount: 100

describe 'base_configure', ->
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

      it 'invalid currency', ->
        arg.currency = 'USD'

      it 'invalid display_currency', ->
        arg.display_currency = 'YEN'

      it 'invalid parent', ->
        arg.parent = 2

describe 'discreet', ->
  it 'setNotes should copy notes into first argument from second', ->
    options = {}
    overrides =
      notes:
        foo: 'bar'
        baz: 2
        hello: true
        world: {}

    discreet.setNotes options, overrides

    # no ref copy
    expect options.notes
      .to.not.be overrides.notes

    expect options.notes
      .to.eql {
        foo: 'bar'
        baz: 2
        hello: true
      }