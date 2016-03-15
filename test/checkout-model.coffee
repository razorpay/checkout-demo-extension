describe 'sanitizeContent', ->
  obj = result = null

  fields = ['key1', 'key2', 'key3','key4',
    'key5', 'key5', 'key6', 'key7']

  afterEach ->
    sanitizeContent obj, fields
    expect result
      .to.eql obj

  it 'should remove undesired characters', ->
    obj =
      key1: '<hello>'
      key2: 'yolo'
      key3: '<lo>'
      key4: '<he>llo>'
      key5: '<hel<lo>'
      key6: 'hello>'
      key7: '<hello'
      key8: '<hello>'

    result =
      key1: ''
      key2: 'yolo'
      key3: ''
      key4: 'llo>'
      key5: ''
      key6: 'hello>'
      key7: ''
      key8: '<hello>'

describe 'sanitizeValue', ->
  obj=result=fields=null
  afterEach ->
    sanitizeValue obj, fields
    expect result
      .to.eql obj

  it 'should remove double quotes (fields is array)', ->
    obj =
      key1: '"hello"'
      key2: '"<hello>"'
      key3: 'hello"'
      key4: 'he"llo'
      key5: '"hello'
      key6: 'hel"l"o'
      key7: '""""'
      key8: '"<hel"lo>"'

    fields = ['key1', 'key2', 'key3','key4', 'key5',
      'key5', 'key6', 'key7']

    result =
      key1: 'hello'
      key2: '<hello>'
      key3: 'hello'
      key4: 'hello'
      key5: 'hello'
      key6: 'hello'
      key7: ''
      key8: '"<hel"lo>"'

  it 'should remove double quotes (single key in fields)', ->
    obj=
      key1: 'hel"lo'
    fields = 'key1'
    result=
      key1: 'hello'

  it 'should remove double quotes (nested objects)', ->
    obj =
      key1:
        a: 'he"llo'
        b:
          c: 'hello"'
    fields = 'key1'
    result=
      key1:
        a: 'hello'
        b:
          c: 'hello'

describe 'sanitizeContact', ->
  phone=result=expected=null
  afterEach ->
    result = sanitizeContact phone
    expect result
      .to.eql expected

  it "should not take alphabets", ->
    phone = 'absdsad'
    expected = ''
  it "should not take alphabets", ->
    phone = '+absdsad'
    expected = '+'
  it "should not take alphanumerics", ->
    phone = '987654321a'
    expected = '987654321'
  it "starts with + then plus should reflect", ->
    phone = '+919876543210'
    expected = '+919876543210'
  it "should remove the hyphens and spcaes", ->
    phone = '+91-98765 43210'
    expected = '+919876543210'


describe 'sanitize', ->
  message =
    options:
      key1: "hello"
      prefill:
        contact: "9876543210"
    data:
      ["contact"]
  it 'should call sanitizeContent and sanitizeValue exactly once', ->
    sanitizeValueStub = sinon.stub window, 'sanitizeValue'
    sanitizeContentStub = sinon.stub window, 'sanitizeContent'
    sanitizeContactStub = sinon.stub window, 'sanitizeContact'
    sanitize message

    expect sanitizeContent.calledOnce
      .to.be true
    expect sanitizeValue.calledOnce
      .to.be true
    expect sanitizeContact.calledOnce
      .to.be true

    expect sanitizeContent.calledWith message.options, message.data
    expect sanitizeValue.calledWith message.options, message.data
    expect sanitizeContact.calledWith message.options, message.data

    sanitizeValueStub.restore()
    sanitizeContentStub.restore()
    sanitizeContactStub.restore()