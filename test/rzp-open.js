describe('setBackdropColor', function(){
  it('should set background of backdrop', function(){
    setBackdropColor('red');
    expect(frameBackdrop.style.background).toBe('red');
  })
})


describe('Razorpay close method should', function(){
  var rzp;
  var options = {
    key: 'key',
    amount: 100
  }

  beforeEach(function(){
    rzp = new Razorpay(options);
    rzp.open();
  })

  it('send close message to frame', function(){
    var spy = jasmine.createSpy();
    spyOn(rzp.checkoutFrame, 'postMessage').and.callFake(function(msg){
      expect(msg.event).toBe('close');
      expect(this).toBe(rzp.checkoutFrame);
      spy();
    })
    rzp.close();
    expect(spy).toHaveBeenCalled();
  })
  
  it('be followable by re-open', function(){
    rzp.close();
    rzp.checkoutFrame.loaded = true;
    var spy = jasmine.createSpy();
    spyOn(rzp.checkoutFrame, 'postMessage').and.callFake(function(msg){
      expect(msg.event).toBe('open');
      expect(this).toBe(rzp.checkoutFrame);
      spy();
    })
    rzp.open();
    expect(spy).toHaveBeenCalled();
  })
})

describe("automatic checkout:", function(){
  
  it("submit handler should submit with all fields", function(){
    var spy = jasmine.createSpy();
    
    currentScript.parentNode.submit = noop;
    spyOn(currentScript.parentNode, 'submit').and.callFake(function(){
      var payload = [];
      jQuery(this).find('div:last-child > input[name]').each(function(index, el){
        payload.push(el.name + '=' + el.value);
      }).remove();
      expect(payload.join('&')).toBe('key1=value1&key2=value2&nested[hello]=2&nested[world]=5');
      spy();
    });

    var postData = {
      key1: 'value1',
      key2: 'value2',
      nested: {
        hello: 2,
        world: 5
      }
    }
    defaultAutoPostHandler(postData);
    expect(spy).toHaveBeenCalled();
  })

  describe("parse options from DOM should", function(){
    var opts = {
      key: 'val',
      foo: 'bar',
      'nested.key1': 'value1',
      'nested.key2': 'value2',
      'one.two.three': 'four',
      'method.wallet.paytm': 'false',
      'one.hello': 'true'
    }
    parseScriptOptions(opts);

    it("have basic keys", function(){
      expect(opts.key).toBe('val');
      expect(opts.foo).toBe('bar');
    })

    it("split first level nested objects", function(){
      expect(typeof opts.nested).toBe('object');
      expect(opts.nested.key1).toBe('value1');
      expect(opts.nested.key2).toBe('value2');
    })

    it("parse string to boolean", function(){
      expect(opts.one.hello).toBe(true);
    })

    it("not split second level objects", function(){
      expect(opts.one['two.three']).toBe('four');
    })

    it("split second level method object", function(){
      expect(opts.method.wallet.paytm).toBe(false);
    })
  })

  describe("addAutoCheckoutButton method: ", function(){
    var init_options = jQuery.extend(true, {}, options);
    init_options.buttontext = 'Dont pay';
    var parent, rzp;

    beforeEach(function(){
      rzp = Razorpay(init_options);
      parent = currentScript.parentNode;
      addAutoCheckoutButton(rzp);
    })

    afterEach(function(){
      jQuery('.razorpay-payment-button').remove();
    })
    
    it("onsubmit should be attached on parent element", function(){
      expect(typeof parent.onsubmit).toBe('function');
    })

    it("submit button should be appended", function(){
      var btn = jQuery(parent).children('.razorpay-payment-button');
      expect(btn.length).toBe(1);
      expect(btn.attr('type')).toBe('submit');
      expect(btn.val()).toBe('Dont pay');
    })

    it("should open checkout form on submit if not already", function(){
      var spy = jasmine.createSpy('open');
      var spy2 = jasmine.createSpy('prevent');
      
      spyOn(rzp, 'open').and.callFake(spy);
      parent.onsubmit({preventDefault: spy2});
      
      expect(spy2).toHaveBeenCalled();
      expect(spy).toHaveBeenCalled();
    })
  })

  describe("init", function(){
    var opts = {
      amount: 12345,
      key: 'abcd'
    }

    var spyCalled, spyNotCalled;

    beforeEach(function(){
      spyCalled = jasmine.createSpy();
      spyNotCalled = jasmine.createSpy();
      for(var i in opts)
        currentScript.setAttribute('data-' + i, opts[i]);
    })

    afterEach(function(){
      initAutomaticCheckout();

      spyCalled && expect(spyCalled).toHaveBeenCalled();
      spyNotCalled && expect(spyNotCalled).not.toHaveBeenCalled();

      for(var i in opts)
        currentScript.removeAttribute(i);
    })

    it("should do nothing if data-amount attribute is not present", function(){
      currentScript.removeAttribute('data-amount');
      spyCalled = null;
      spyOn(window, 'addAutoCheckoutButton').and.callFake(spyNotCalled);
    })

    it("should parse attributes", function(){
      spyOn(window, 'addAutoCheckoutButton').and.callFake(jQuery.noop);
      spyOn(window, 'parseScriptOptions').and.callFake(function(o){
        expect(o.key).toBe('abcd');
        expect(o.amount).toBe('12345');
        spyCalled();
      })
    })

    it("add button", function(){
      spyOn(window, 'addAutoCheckoutButton').and.callFake(function(r){
        expect(r instanceof Razorpay).toBe(true);
        spyCalled();
      })
    })
  })
})

describe('if Chrome-iOS,', function(){
  it('communicator between CheckoutFrame and parent window should be present', function(){
    CriOS_handler();
    expect(communicator).not.toBeDefined();

    isCriOS = true;
    CriOS_handler();
    expect(communicator instanceof HTMLIFrameElement).toBe(true);
    expect(document.documentElement.contains(communicator)).toBe(true);

    isCriOS = false;
    communicator.parentNode.removeChild(communicator);
    communicator = null;
  })
})