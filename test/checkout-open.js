var options = {
  'key': 'key_id',
  'amount': '5100',
  'name': 'Merchant Name',
  'netbanking': 'true',
  'protocol': 'http',
  'hostname': currentScript.src.replace('http://',''),
  'prefill': {
    'name': 'Shashank Mehta',
    'email': 'sm@razorpay.com',
    'contact': '9999999999'
  }
}

var cc = {
  number: '4012001037141112',
  expiry: '05 / 19',
  cvv: '888'
}

describe("open method should", function(){
  var rzp;

  beforeEach(function(){
    rzp = new Razorpay(options);
    rzp.open();
  })

  it("append iframe", function(){
    expect(isOpen).toBe(true);
    expect(checkoutFrame).toBeDefined();
    expect(document.documentElement.contains(checkoutFrame.parentNode)).toBe(true);
  })

  afterEach(function(){
    ch_onClose.call(rzp);
  })
})

describe("close method should", function(){
  var rzp;

  beforeEach(function(){
    rzp = new Razorpay(options);
    rzp.open();
  })

  it("send close message to frame", function(){
    var spy = jasmine.createSpy();
    spyOn(window, 'ch_sendFrameMessage').and.callFake(function(msg){
      expect(msg.event).toBe('close');
      expect(this).toBe(rzp);
      spy();
    })
    rzp.close();
    expect(spy).toHaveBeenCalled();
  })
  
  it("clean up various properties", function(){
    ch_onClose.call(rzp);
    expect(isOpen).toBe(false);
    expect(checkoutFrame).not.toBeVisible();
  })

  it("be followable by re-open", function(){
    var spy = jasmine.createSpy();
    spyOn(window, 'ch_sendFrameMessage').and.callFake(function(msg){
      expect(msg.event).toBe('open');
      expect(this).toBe(rzp);
      spy();
    })
    ch_onClose.call(rzp);
    rzp.open();
    expect(spy).toHaveBeenCalled();
  })
})

describe("normalize image option if", function(){
  var baseUrl = location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '');

  it("path relative url", function(){
    var opts = {image: 'abcdef'};
    ch_setImageOption(opts);
    expect(opts.image).toBe(baseUrl + '/abcdef');
  })

  it("server relative url", function(){
    var opts = {image: '/hello/world'};
    ch_setImageOption(opts);
    expect(opts.image).toBe(baseUrl + '/hello/world');
  })
  
  it("absolute url", function(){
    var opts = {image: 'https://hello/world'};
    ch_setImageOption(opts);
    expect(opts.image).toBe('https://hello/world');
  })

  it("base64", function(){
    var base64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAL4AAAC+CAIAAAAEFiLKAAAAA3NCSVQICAjb4U/';
    var opts = {image: base64};
    ch_setImageOption(opts);
    expect(opts.image).toBe(base64);
  })

})

describe("ch_onFrameMessage", function(){
  var rzp;

  beforeEach(function(){
    rzp = new Razorpay(options);
    rzp.open();
  });

  afterEach(function(){
    ch_onClose.call(rzp);
  });

  it("return if source isn't valid", function(done){
    var spyNotCalled = jasmine.createSpy();
    spyOn(window, 'ch_setImageOption').and.callFake(spyNotCalled);
    postMessage({event: "load"}, '*');
    setTimeout(function(){
      expect(spyNotCalled).not.toHaveBeenCalled();
      done();
    })
  })

  describe("load,", function(){

    beforeEach(function(){
      postMessage({source: "frame", event: "load"}, '*');
    })
    
    it("meta viewport is to be set", function(done){
      setTimeout(function(){
        expect(document.querySelector('meta[name=viewport]').content.match('width=device-width, initial-scale=1').length).toBe(1);
        done();
      })
    })

    it("image option is to be normalized", function(done){
      var spy = jasmine.createSpy();
      spyOn(window, 'ch_setImageOption').and.callFake(spy);
      setTimeout(function(){
        expect(spy).toHaveBeenCalled();
        done();
      })
    })
  })

  it("redirect, next request should be processed", function(done){
    var spy = jasmine.createSpy();
    
    spyOn(discreet, 'nextRequestRedirect').and.callFake(function(data){
      expect(data).toBe('hello');
      spy();
    })

    postMessage({source: "frame", event: "redirect", data: "hello"}, '*');
    setTimeout(function(){
      expect(spy).toHaveBeenCalled();
      done();
    })
  })

  it("submit, invoke CheckoutBridge.onsubmit", function(done){
    var spy = jasmine.createSpy();
    var data = {foo:2}
    window.CheckoutBridge = {
      onsubmit: function(arg){
        expect(arg).toBe(JSON.stringify(data));
        spy();
      }
    }
    postMessage({source: "frame", event: "submit", data: data}, '*');

    setTimeout(function(){
      expect(spy).toHaveBeenCalled();
      delete window.CheckoutBridge;
      done();
    })
  })

  it("success, handler is to be called", function(done){
    var spy = jasmine.createSpy();
    rzp.options.handler = function(data){
      if(this === null && data == "payment_id") spy();
    };
    postMessage({source: "frame", event: "success", data: "payment_id"}, '*');
    setTimeout(function(){
      expect(existingInstance).toBe(null);
      done();
    })
  })

  it("dismiss, modal.ondismiss is to be called", function(done){
    var spy = jasmine.createSpy();
    spyOn(rzp.options.modal, 'ondismiss').and.callFake(spy);
    postMessage({source: "frame", event: "dismiss"}, '*');
    setTimeout(function(){
      expect(spy).toHaveBeenCalled();
      done();
    })
  })

  it("hidden, ch_onClose is to be called", function(done){
    var origClose = ch_onClose;
    var spy = jasmine.createSpy();
    ch_onClose = function(){
      if(existingInstance === rzp) spy();
    }
    postMessage({source: "frame", event: "hidden"}, '*');
    setTimeout(function(){
      expect(spy).toHaveBeenCalled();
      ch_onClose = origClose;
      done();
    })
  })

  it("fault, close.", function(done){
    var spy = jasmine.createSpy();
    spyOn(Razorpay.prototype, 'close').and.callFake(spy);
    postMessage({source: "frame", event: "fault"}, '*');
    setTimeout(function(){
      expect(spy).toHaveBeenCalled();
      done();
    })
  })
})

describe("checkout validate", function(){
  var init_options, errors, field;
})

describe("automatic checkout:", function(){
  
  it("submit handler should submit with all fields", function(){
    var spy = jasmine.createSpy();
    
    currentScript.parentNode.submit = function(){
      var payload = [];
      jQuery(this).children('input[name]').each(function(index, el){
        payload.push(el.name + '=' + el.value);
      }).remove();
      expect(payload.join('&')).toBe('key1=value1&key2=value2&nested[hello]=2&nested[world]=5');
      spy();
    };

    var postData = {
      key1: 'value1',
      key2: 'value2',
      nested: {
        hello: 2,
        world: 5
      }
    }
    ch_defaultPostHandler(postData);
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
    ch_parseScriptOptions(opts);

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

  describe("ch_addButton method: ", function(){
    var init_options = jQuery.extend(true, {}, options);
    init_options.buttontext = 'Dont pay';
    var rzp = new Razorpay(init_options);
    var parent = currentScript.parentNode;
    ch_addButton(rzp);
    
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
      isOpen = false;

      var spy = jasmine.createSpy();
      var spy2 = jasmine.createSpy();
      
      spyOn(rzp, 'open').and.callFake(spy);
      parent.onsubmit({preventDefault: spy2});
      
      expect(spy).toHaveBeenCalled();
      expect(spy2).toHaveBeenCalled();
    })

    it("shouldn't do default action if form is open", function(){
      isOpen = true;

      var spy = jasmine.createSpy();
      var spy2 = jasmine.createSpy();
      
      spyOn(rzp, 'open').and.callFake(spy);
      parent.onsubmit({preventDefault: spy2});
      
      expect(spy).not.toHaveBeenCalled();
      expect(spy2).not.toHaveBeenCalled();
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
      ch_automaticCheckoutInit();

      spyCalled && expect(spyCalled).toHaveBeenCalled();
      spyNotCalled && expect(spyNotCalled).not.toHaveBeenCalled();

      for(var i in opts)
        currentScript.removeAttribute(i);
    })

    it("should do nothing if data-amount attribute is not present", function(){
      currentScript.removeAttribute('data-amount');
      spyCalled = null;
      spyOn(window, 'ch_addButton').and.callFake(spyNotCalled);
    })

    it("should parse attributes", function(){
      spyOn(window, 'ch_addButton').and.callFake(jQuery.noop);
      spyOn(window, 'ch_parseScriptOptions').and.callFake(function(o){
        expect(o.key).toBe('abcd');
        expect(o.amount).toBe('12345');
        spyCalled();
      })
    })

    it("add button", function(){
      spyOn(window, 'ch_addButton').and.callFake(function(r){
        expect(r instanceof Razorpay).toBe(true);
        spyCalled();
      })
    })
  })
})