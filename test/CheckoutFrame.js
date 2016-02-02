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
      redirect: noop,
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

  it('set redirect option', function(){
    var message = makeCheckoutMessage(rzp);
    expect(message.options.redirect).toBe(false);

    rzp.options.redirect = function(){return true}
    message = makeCheckoutMessage(rzp);
    expect(message.options.redirect).toBe(true);
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

  it('delete parent option', function(){
    rzp.options.parent = 'x';
    var message = makeCheckoutMessage(rzp);
    expect('parent' in message.options).toBe(false);
    expect(message.embedded).toBe(true);
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
        source: cf.el.contentWindow,
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
      cf.loadedCallback = function(){
        if(this === cf){
          spyCalled();
        }
      };
      message('load');
      expect(cf.hasLoaded).toBe(true);
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

    it('failure', function(){
      spyOn(cf, 'ondismiss').and.callFake(spyCalled);

      var spy2 = jasmine.createSpy();
      spyOn(cf, 'onhidden').and.callFake(spy2);

      message('failure', {error: ''});
      expect(spy2).toHaveBeenCalled();
    })

    it('fault', function(){
      spyOn(rzp, 'close').and.callFake(spyCalled);
      message('fault');
    })
  })
})

describe('afterClose should', function(){
  var rzp, cf;

  beforeEach(function(){
    rzp = Razorpay({
      key: 'key',
      amount: 100
    })
    cf = new CheckoutFrame(rzp);
  })
  it('hide container', function(){
    expect(frameContainer).toBeVisible();

    var spy = jasmine.createSpy();
    spyOn(cf, 'unbind').and.callFake(spy);

    cf.afterClose();
    expect(frameContainer).not.toBeVisible();
    expect(spy).toHaveBeenCalled();
  })
})

describe('if shouldFixFixed,', function(){
  var cf;

  beforeEach(function(){
    cf = new CheckoutFrame();
  })

  it('scroll, orientationchange listener should be bound', function(){
    var spy = jasmine.createSpy('scroll');
    var spy2 = jasmine.createSpy('orientationchange');
    merchantMarkup.scroll = spy;
    merchantMarkup.orientationchange = spy2;

    cf.bind();
    expect(cf.listeners.scroll).not.toBeDefined();
    cf.unbind();

    shouldFixFixed = true;
    cf.bind();
    expect(cf.listeners.scroll).toBeDefined();
    cf.listeners.scroll({target: window});
    cf.listeners.orientationchange({target: window});
    expect(spy).toHaveBeenCalled();
    expect(spy2).toHaveBeenCalled();

    shouldFixFixed = false;
  })
})

describe('if CriOS,', function(){
  var cf;

  beforeEach(function(){
    cf = new CheckoutFrame();
  })

  it('set unload listener', function(){
    cf.bind();
    expect(cf.listeners.unload).not.toBeDefined();
    cf.unbind();

    isCriOS = true;
    cf.bind();
    expect(cf.listeners.unload).toBeDefined();
    isCriOS = false;
  })
})