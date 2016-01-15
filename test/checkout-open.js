var base64image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAL4AAAC+CAIAAAAEFiLKAAAAA3NCSVQICAjb4U/';

describe('normalize image option if', function(){
  var baseUrl = location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '');

  it('path relative url', function(){
    var opts = {image: 'abcdef'};
    sanitizeImage(opts);
    expect(opts.image)
      .toBe(baseUrl + '/abcdef');
  })

  it('server relative url', function(){
    var opts = {image: '/hello/world'};
    sanitizeImage(opts);
    expect(opts.image)
      .toBe(baseUrl + '/hello/world');
  })

  it('absolute url', function(){
    var opts = {image: 'https://hello/world'};
    sanitizeImage(opts);
    expect(opts.image)
      .toBe('https://hello/world');
  })

  it('base64', function(){
    var opts = {image: base64image};
    sanitizeImage(opts);
    expect(opts.image)
      .toBe(base64image);
  })
})

describe('makeCheckoutUrl should', function(){
  it('compose default checkout url without key', function(){
    expect(makeCheckoutUrl({}))
      .toBe(RazorpayConfig.protocol + '://' + RazorpayConfig.hostname + '/checkout.php');
  })

  it('compose checkout view url with key', function(){
    expect(makeCheckoutUrl({key: 'foo'}))
      .toBe(RazorpayConfig.protocol + '://' + RazorpayConfig.hostname + '/v1/checkout?key_id=foo');
  })
})

describe('makeCheckoutMessage should', function(){
  var rzp = {
    id: 'someid',
    options: {
      image: 'abcdef',
      hello: 'world',
      nested: {
        key: 'value'
      },
      modal: {},
      func: noop
    },
    modal: {
      options: {
        dismiss: 'hidden'
      }
    }
  }

  it('set options and modal.options to options.modal', function(){
    var message = makeCheckoutMessage(rzp);
    expect(rzp.options.modal.dismiss === rzp.modal.options.dismiss);

    // checking general options
    expect(message.options.func).not.toBeDefined();
    expect(message.options.nested.key).toBe('value');
    expect(message.options.hello).toBe('world');

    // checking image, as absolute url
    var imageOption = {image: rzp.options.image};
    sanitizeImage(imageOption);
    expect(message.options.image).toBe(imageOption.image);

    expect(message.context).toBe(location.href);
    expect(message.config).toBe(RazorpayConfig);
    expect(message.id).toBe(rzp.id);
  })

  describe('if CriOS, should', function(){

    beforeEach(function(){
      isCriOS = true;
    })

    it('set redirect option', function(){
      var message = makeCheckoutMessage(rzp);
      expect(message.options.redirect).toBe(true);
    })

    it('discard image option, if base64', function(){
      rzp.options.image = base64image;
      var message = makeCheckoutMessage(rzp);
      expect(message.options.image).not.toBe(base64image);
      rzp.options.image = 'qwer';
    })

    afterEach(function(){
      isCriOS = false;
    })
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

describe('checkoutFrame on receiveing message from frame contentWindow', function(){
  var rzp = new Razorpay({
    key: 'key',
    amount: 100
  });
  var cf = new CheckoutFrame(rzp);
  var src = makeCheckoutUrl(rzp.options);

  describe('return if source isn\'t valid:', function(){
    var spyNotCalled, event;

    beforeEach(function(){
      spyNotCalled = jasmine.createSpy();
    })

    afterEach(function(){
      cf.onmessage(event)
      spyOn(cf, 'onredirect').and.callFake(spyNotCalled);
      expect(spyNotCalled).not.toHaveBeenCalled();
    })

    it('invalid origin', function(){
      event = {
        origin: 'asd',
        data: JSON.stringify({
          source: 'frame',
          event: 'redirect',
          id: rzp.id
        })
      }
    })

    it('invalid source', function(){
      event = {
        origin: src,
        data: JSON.stringify({
          source: 'frame2',
          event: 'redirect',
          id: rzp.id
        })
      }
    })

    it('invalid id', function(){
      event = {
        origin: src,
        data: JSON.stringify({
          source: 'frame',
          event: 'redirect',
          id: 11
        })
      }
    })
  })

  describe('invoke onevent methods: ', function(){
    function message(event, data){
      cf.onmessage({
        origin: src,
        data: JSON.stringify({
          source: 'frame',
          event: event,
          id: rzp.id,
          data: data
        })
      })
    }
    var spyCalled;

    beforeEach(function(){
      spyCalled = jasmine.createSpy();
    })

    afterEach(function(){
      expect(spyCalled).toHaveBeenCalled();
    })

    it('generic', function(){
      cf.onevent = spyCalled;
      message('event');
      delete cf.onevent;
    })

    it('load', function(){
      cf.loaded = function(){
        if(this === cf){
          spyCalled();
        }
      };
      message('load');
      expect(cf.loaded).toBe(true);
    })

    it('redirect', function(){
      spyOn(discreet, 'nextRequestRedirect').and.callFake(function(data){
        expect(data.foo).toBe(2);
        spyCalled();
      })
      message('redirect', {foo: 2});
    })

    it('submit', function(){
      window.CheckoutBridge = {
        onsubmit: function(data){
          expect(this).toBe(window.CheckoutBridge);
          expect(JSON.parse(data).foo).toBe(3);
          spyCalled();
        }
      }
      message('submit', {foo: 3});
      delete window.CheckoutBridge;
    })

    it('dismiss', function(){
      rzp.options.modal.ondismiss = spyCalled;
      var spy2 = jasmine.createSpy();
      spyOn(cf, 'close').and.callFake(function(){
        expect(this).toBe(cf);
        spy2();
      })
      message('dismiss');
      expect(spy2).toHaveBeenCalled();
    })

    it('hidden', function(){
      rzp.options.modal.onhidden = spyCalled;
      var spy2 = jasmine.createSpy();
      spyOn(cf, 'afterClose').and.callFake(function(){
        expect(this).toBe(cf);
        spy2();
      })
      message('hidden');
      expect(spy2).toHaveBeenCalled();
    })

    it('success', function(done){
      rzp.options.handler = function(data){
        expect(data.foo).toBe(4);
        done();
      }

      spyOn(cf, 'close').and.callFake(function(){
        expect(this).toBe(cf);
        spyCalled();
      })
      message('success', {foo: 4});
    })

    it('fault', function(){
      spyOn(rzp, 'close').and.callFake(spyCalled);
      message('fault');
    })
  })
})

// describe("checkout validate", function(){
//   var init_options, errors, field;
// })

describe('setBackdropColor', function(){
  it('should set background of backdrop', function(){
    setBackdropColor('red');
    expect(frameBackdrop.style.background).toBe('red');
  })
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
    var rzp = new Razorpay(init_options);
    var parent = currentScript.parentNode;
    addAutoCheckoutButton(rzp);
    
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