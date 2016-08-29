var options = {
  key: 'key',
  amount: 100
};

describe('automatic checkout:', function() {
  it('submit handler should submit with all fields', function() {
    var submitSpy = currentScript.parentNode.submit = sinon.stub();
    var postData = {
      key1: 'value1',
      key2: 'value2',
      nested: {
        hello: 2,
        world: 5
      }
    };
    defaultAutoPostHandler(postData);
    expect(submitSpy.callCount).to.be(1);
    var payload = [];

    jQuery(currentScript.parentNode).find('div:last-child > input[name]').each(function(index, el) {
      payload.push(el.name + '=' + el.value);
    }).remove();

    expect(payload.join('&')).to.be('key1=value1&key2=value2&nested[hello]=2&nested[world]=5');
    delete currentScript.parentNode.submit;
  })

  describe('addAutoCheckoutButton method: ', function() {
    var parent, rzp;
    var init_options = clone(options);
    init_options.buttontext = 'Dont pay';

    beforeEach(function() {
      rzp = Razorpay(init_options);
      parent = currentScript.parentNode;
      addAutoCheckoutButton(rzp);
    })

    afterEach(function() {
      jQuery('.razorpay-payment-button').remove();
    })

    it('onsubmit should be attached on parent element', function() {
      expect(parent.onsubmit).to.be.a('function');
    })

    it('submit button should be appended', function() {
      var btn = jQuery(parent).children('.razorpay-payment-button');
      expect(btn.length).to.be(1);
      expect(btn.attr('type')).to.be('submit');
      expect(btn.val()).to.be('Dont pay');
    })

    it('should open checkout form on submit if not already', function() {
      var spy = sinon.stub(Razorpay.prototype, 'open');
      var spy2 = sinon.stub();
      parent.onsubmit({
        preventDefault: spy2
      })
      expect(spy.called).to.be(true);
      expect(spy2.called).to.be(true);
      spy.restore();
    })
  })

  describe('init', function() {
    var stub;

    beforeEach(function() {
      var results = [];
      for (var opt in options) {
        var val = options[opt];
        results.push(currentScript.setAttribute('data-' + opt, val));
      }
      return results;
    })

    afterEach(function() {
      stub.restore();
      var results = [];
      for (var i in options) {
        results.push(currentScript.removeAttribute(i));
      }
      return results;
    })

    it('should do nothing if data-key attribute is not present', function() {
      currentScript.removeAttribute('data-key');
      stub = sinon.stub(window, 'addAutoCheckoutButton');
      initAutomaticCheckout();
      expect(stub.called).to.be(false);
      stub.restore();
    })

    it('add button for default options', function() {
      stub = sinon.spy(window, 'addAutoCheckoutButton');
      initAutomaticCheckout();
      expect(stub.called).to.be(true);
      var rzp = stub.getCall(0).args[0];
      expect(rzp).to.be.a(Razorpay);
      expect(rzp.get()).to.eql({
        key: 'key',
        amount: 100,
        handler: defaultAutoPostHandler
      })
    })
  })
})

describe('automatic parsing for nested or uppercase options', function() {
  it('', function() {
    var opts = {
      'KEY': 'key',
      'amount': 1000,
      'theme.color': 'red',
      'notes.FOO': 'bar',
      'notes.hello': 'world'
    }
    for (var opt in opts) {
      var val = opts[opt];
      currentScript.setAttribute('data-' + opt, val);
    }
    var stub = sinon.spy(window, 'addAutoCheckoutButton');
    initAutomaticCheckout();
    expect(stub.called).to.be(true);

    var rzp = stub.getCall(0).args[0];
    expect(rzp).to.be.a(Razorpay);

    expect(rzp.get()).to.eql({
      key: 'key',
      amount: 1000,
      handler: defaultAutoPostHandler,
      'theme.color': 'red',
      notes: {
        foo: 'bar',
        hello: 'world'
      }
    })
  })
})
