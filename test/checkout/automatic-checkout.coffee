options =
  key: 'key'
  amount: 100

describe 'automatic checkout:', ->
  it 'submit handler should submit with all fields', ->
    submitSpy = currentScript.parentNode.submit = sinon.stub()

    postData = 
      key1: 'value1'
      key2: 'value2'
      nested:
        hello: 2
        world: 5

    defaultAutoPostHandler postData
    
    expect submitSpy.callCount
      .to.be 1

    payload = []
    jQuery currentScript.parentNode
      .find 'div:last-child > input[name]'
      .each (index, el) ->
        payload.push el.name + '=' + el.value
      .remove()
    
    expect payload.join '&'
      .to.be 'key1=value1&key2=value2&nested[hello]=2&nested[world]=5'

    delete currentScript.parentNode.submit

  describe 'addAutoCheckoutButton method: ', ->
    init_options = clone options
    init_options.buttontext = 'Dont pay'

    rzp = parent = null

    beforeEach ->
      rzp = Razorpay init_options
      parent = currentScript.parentNode
      addAutoCheckoutButton rzp

    afterEach ->
      jQuery('.razorpay-payment-button').remove()

    it 'onsubmit should be attached on parent element', ->
      expect parent.onsubmit
        .to.be.a 'function'

    it 'submit button should be appended', ->
      btn = jQuery parent
        .children '.razorpay-payment-button'

      expect(btn.length).to.be 1
      expect(btn.attr('type')).to.be 'submit'
      expect(btn.val()).to.be 'Dont pay'

    it 'should open checkout form on submit if not already', ->
      spy = sinon.stub Razorpay::, 'open'
      spy2 = sinon.stub()

      parent.onsubmit preventDefault: spy2
      expect(spy.called).to.be true
      expect(spy2.called).to.be true
      spy.restore()

  describe 'init', ->
    stub = null
    beforeEach ->
      for opt, val of options
        currentScript.setAttribute 'data-' + opt, val

    afterEach ->
      stub.restore()
      for i of options
        currentScript.removeAttribute i

    it 'should do nothing if data-amount attribute is not present', ->
      currentScript.removeAttribute 'data-amount'
      stub = sinon.stub window, 'addAutoCheckoutButton'
      initAutomaticCheckout()

      expect stub.called
        .to.be false
      stub.restore()

    it 'add button for default options', ->
      stub = sinon.spy window, 'addAutoCheckoutButton'
      initAutomaticCheckout()

      expect stub.called
        .to.be true

      rzp = stub.getCall(0).args[0]
      expect rzp
        .to.be.a Razorpay

      expect rzp.get()
        .to.eql {
          key: 'key',
          amount: 100,
          handler: defaultAutoPostHandler
        }

describe 'automatic parsing for nested or uppercase options', ->
  it '', ->
    opts =
      'KEY': 'key',
      'amount': 1000,
      'theme.color': 'red',
      'notes.FOO': 'bar',
      'notes.hello': 'world'

    for opt, val of opts
      currentScript.setAttribute 'data-' + opt, val

    stub = sinon.spy window, 'addAutoCheckoutButton'
    initAutomaticCheckout()

    expect stub.called
      .to.be true

    rzp = stub.getCall(0).args[0]
    expect rzp
      .to.be.a Razorpay

    expect rzp.get()
      .to.eql {
        key: 'key',
        amount: 1000,
        handler: defaultAutoPostHandler,
        'theme.color': 'red',
        notes: {
          foo: 'bar',
          hello: 'world'
        }
      }