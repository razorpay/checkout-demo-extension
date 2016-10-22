var indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

var options = {
  key: 'key',
  amount: 100
};

var base64image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAL4AAAC+CAIAAAAEFiLKAAAAA3NCSVQICAjb4U/';

describe('doc', function() {
  it('should be documentElement', function() {
    expect(doc).to.be(document.body);
    expect(docStyle).to.be(doc.style);
  })
})

describe('restoreOverflow', function() {
  it('should set body overflow to merchant stored overflow', function() {
    docStyle.overflow = 'inherit';
    merchantMarkup.overflow = 'visible';
    restoreOverflow();
    expect(docStyle.overflow).to.be(merchantMarkup.overflow);
  })
})

describe('restoreMeta', function() {
  it('should append old meta to <head>', function() {
    var $meta = {
      remove: sinon.stub()
    };
    var div = document.createElement('div');
    var spy = sinon.stub(window, 'getMeta').returns(div);
    restoreMeta($meta);
    expect(document.head.contains(div)).to.be(true);
    expect($meta.remove.callCount).to.be(1);
    spy.restore();
  })
})

describe('normalize image option if', function() {
  var image, opts, result;
  var baseUrl = location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '');

  afterEach(function() {
    opts = {
      image: image
    };
    sanitizeImage(opts);
    expect(opts.image).to.be(result);
  })

  it('path relative url', function() {
    image = 'abcdef';
    result = baseUrl + '/abcdef';
  })

  it('server relative url', function() {
    image = '/hello/world';
    result = baseUrl + '/hello/world';
  })

  it('absolute url', function() {
    image = 'https://hello/world';
    result = 'https://hello/world';
  })

  it('base64', function() {
    image = base64image;
    result = base64image;
  })
})

describe('makeCheckoutMessage should', function() {
  var opts = {
    key: 'key',
    amount: '1000',
    redirect: noop,
    image: 'abcdef',
    hello: 'world',
    nested: {
      key: 'value'
    },
    modal: {},
    func: noop
  };
  var rzp = Razorpay(opts);
  rzp.id = 'someid';
  rzp.modal = {
    options: {
      dismiss: 'hidden'
    }
  };
  it('set options and modal.options to options.modal', function() {
    var imageOption, message;
    message = CheckoutFrame.prototype.makeMessage.call({
      rzp: rzp
    });
    expect(rzp.get('modal.dismiss')).to.be(rzp.modal.options.dismiss);
    expect(message.options).to.not.have.property('func');
    expect(indexOf.call(message.options, 'nested') >= 0).to.be(false);
    expect(indexOf.call(message.options, 'nested.key') >= 0).to.be(false);
    expect(indexOf.call(message.options, 'hello') >= 0).to.be(false);
    imageOption = {
      image: rzp.get('image')
    };
    sanitizeImage(imageOption);
    expect(message.options.image).to.be(imageOption.image);
    expect(message.referrer).to.be(location.href);
    expect(message.id).to.be(rzp.id);
  });

  it('set redirect option', function() {
    var message;
    message = CheckoutFrame.prototype.makeMessage.call({
      rzp: rzp
    });
    expect(message.options.redirect).to.not.be.ok();
    rzp.get().redirect = true;
    message = CheckoutFrame.prototype.makeMessage.call({
      rzp: rzp
    });
    expect(message.options.redirect).to.be(true);
  });
});

describe('checkoutFrame on receiveing message from frame contentWindow', function() {
  var rzp = Razorpay(options);
  var cf = new CheckoutFrame(rzp);
  var src = makeCheckoutUrl(rzp);

  describe('return if source isnt valid:', function() {
    var event;
    var spyNotCalled;

    afterEach(function() {
      spyNotCalled = sinon.stub(cf, 'onredirect');
      cf.onmessage(event);
      expect(spyNotCalled.called).to.be(false);
      return spyNotCalled.restore();
    })

    it('invalid origin', function() {
      event = {
        origin: 'asd',
        data: JSON.stringify({
          source: 'frame',
          event: 'redirect',
          id: rzp.id
        })
      }
    })

    it('invalid source', function() {
      event = {
        origin: src,
        data: JSON.stringify({
          source: 'frame2',
          event: 'redirect',
          id: rzp.id
        })
      }
    })

    it('invalid id', function() {
      return event = {
        origin: src,
        data: JSON.stringify({
          source: 'frame',
          event: 'redirect',
          id: 11
        })
      }
    })
  })

  describe('invoke onevent methods: ', function() {
    var spy;
    var message = function(event, data) {
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

    afterEach(function() {
      if (spy) {
        expect(spy.callCount).to.be(1);
        if ('restore' in spy) {
          spy.restore();
        }
      }
    })

    it('generic', function() {
      spy = cf.onevent = sinon.spy();
      message('event');
      delete cf.onevent;
    })

    it('load', function() {
      spy = sinon.stub(cf, 'postMessage');
      var spy2 = sinon.stub(cf, 'makeMessage');
      spy2.returns(2);
      message('load');
      expect(spy2.callCount).to.be(1);
      expect(spy.getCall(0).args[0]).to.be(2);
      expect(spy.getCall(0).thisValue).to.be(cf);
    })

    it('redirect', function() {
      spy = sinon.stub(discreet, 'redirect');
      message('redirect', {
        foo: 2
      })
      expect(spy.getCall(0).args[0]).to.eql({
        foo: 2
      })
    })

    it('submit', function() {
      spy = sinon.stub();
      var opts = rzp.get();
      opts['external.wallets'] = ['payu'];
      opts['external.handler'] = spy;

      message('submit', {
        method: 'wallet',
        wallet: 'paytm'
      })
      expect(spy.callCount).to.be(0);

      message('submit', {
        wallet: 'payu'
      })
      expect(spy.callCount).to.be(0);

      message('submit', {
        method: 'wallet',
        wallet: 'payu'
      })
      expect(spy.callCount).to.be(1);
      expect(spy.getCall(0).thisValue).to.be(rzp);
    })

    it('dismiss', function() {
      spy = rzp.get()['modal.ondismiss'] = sinon.stub();
      var spy2 = sinon.stub(cf, 'close');
      message('dismiss');
      expect(spy2.callCount).to.be(1);
      expect(spy2.getCall(0).thisValue).to.be(cf);
      spy2.restore();
    })

    it('hidden', function() {
      spy = rzp.get()['modal.onhidden'] = sinon.stub();
      var spy2 = sinon.stub(cf, 'afterClose');
      message('hidden');
      expect(spy2.callCount).to.be(1);
      expect(spy2.getCall(0).thisValue).to.be(cf);
      spy2.restore();
    })

    it('success', function(done) {
      rzp.get().handler = function(data) {
        expect(data).to.eql({
          foo: 4
        })
        done();
      };
      spy = null;
      var spy3 = sinon.stub(cf, 'close');
      message('complete', {
        foo: 4
      });
      expect(spy3.callCount).to.be(1);
      expect(spy3.getCall(0).thisValue).to.be(cf);
    })

    it('failure', function() {
      spy = sinon.stub(cf, 'ondismiss');
      var spy2 = sinon.stub(cf, 'onhidden');
      message('failure', {
        error: ''
      })
      expect(spy2.callCount).to.be(1);
      expect(spy2.getCall(0).thisValue).to.be(cf);
      spy2.restore();
    })

    it('fault', function() {
      spy = sinon.stub(rzp, 'close');
      message('fault');
    })
  })
})

describe('checkoutFrame.close', function() {
  it('should restore merchantMarkup', function() {
    var spy = sinon.stub(window, 'setBackdropColor');
    var spy2 = sinon.stub(window, 'restoreMeta');
    var spy3 = sinon.stub(window, 'restoreOverflow');
    var rzp = Razorpay(options);
    var cf = new CheckoutFrame(rzp);
    var spy4 = sinon.stub(cf, 'unbind');
    cf.close();
    expect(spy.called).to.be(true);
    expect(spy2.called).to.be(true);
    expect(spy3.called).to.be(true);
    expect(spy2.getCall(0).args[0]).to.be(cf.$meta);
    expect(spy4.callCount).to.be(1);
    spy4.restore();
  })
})

describe('afterClose should', function() {
  var cf, rzp;

  beforeEach(function() {
    rzp = Razorpay(options);
    cf = new CheckoutFrame(rzp);
  })

  it('hide container and unbind', function() {
    expect(jQuery(frameContainer).is(':visible')).to.be(true);
    cf.afterClose();
    expect(jQuery(frameContainer).is(':visible')).to.be(false);
  })
})

describe('if iPhone,', function() {
  var cf;

  beforeEach(function() {
    cf = new CheckoutFrame;
  })

  it('scroll, orientationchange listener should be bound', function() {
    cf.bind();
    var oldlen = cf.listeners.length;
    cf.unbind();
    window.ua_iPhone = true;
    cf.bind();
    expect(cf.listeners.length > oldlen).to.be(true);
    window.ua_iPhone = false;
  })
})
