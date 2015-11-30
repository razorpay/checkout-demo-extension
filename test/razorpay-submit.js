var options = {
  'key': 'key_id',
  'amount': '40000',
  'name': 'Merchant Name'
}

var request = {
  data: {
    key1: 'value1',
    key2: 'value2',
    notes: {
      note1: 'one',
      note2: 'two'
    }
  }
}

describe('Razorpay.configure should', function(){
  it("set default options", function(){
    Razorpay.configure(options);
    for(var i in options){
      expect(options[i]).toBe(Razorpay.defaults[i]);
    }
  })
})

describe('Razorpay.payment.validate should', function(){
  it('call thrower if invalid data', function(){
    var spy = jasmine.createSpy();
    spyOn(window, 'err').and.callFake(spy);
    var data = jQuery.extend(request.data);
    delete data.key_id;
    Razorpay.payment.validate(data);
    expect(spy).toHaveBeenCalled();
  })

  // describe("report", function(){
  //   var data, field;

  //   beforeEach(function(){
  //     data = jQuery.extend(request.data);
  //     data.amount = '45555';
  //     data.key_id = 'rewerdd';
  //   })

  //   it("amount error", function(){
  //     field = 'amount';
  //     data.amount = 'asd';
  //   })

  //   it("key error", function(){
  //     field = 'key';
  //     data.key_id = '';
  //   })

  //   afterEach(function(){
  //     expect(Razorpay.payment.validate(data)[0].field).toBe(field);
  //   })
  // })
})


describe('authorize should', function(){
  var init_options, rzp, req;

  beforeEach(function(){
    Razorpay.payment.cancel();
    popupRequest = null;
    req = jQuery.extend(true, {}, request);
  });

  it('fail when invalid data passed', function(){
    spyOn(Razorpay.payment, 'validate').and.callFake(function(){
      return [null];
    })
    describe('', function(){
      var spy, data;
      beforeEach(function(){
        var spy = jasmine.createSpy();
        spyOn(window, 'err').and.callFake(spy);
      })
      afterEach(function(){
        Razorpay.payment.authorize(data);
        expect(spy).toHaveBeenCalled();
      })
      it('', function(){
        data = 123;
      })
      it('', function(){
        data = {data: true}
      })
      it('', function(){
        data = req
      })
    })
  });

  it('submit html post form if redirect flag is passed', function(){
    var spyCalled = jasmine.createSpy();
    HTMLFormElement.prototype.submit = spyCalled;

    Razorpay.configure({redirect: true});
    Razorpay.payment.authorize(req);

    expect(spyCalled).toHaveBeenCalled();
    Razorpay.configure({redirect: false});
  });

  it('add callback_url if specified in options', function(){
    Razorpay.defaults.callback_url = 'swag';
    Razorpay.payment.authorize(req);
    expect(req.data.callback_url).toBe('swag');
    Razorpay.defaults.callback_url = ''; // reset
  })

  it('add signature if specified in options', function(){
    Razorpay.defaults.signature = 'swag';
    Razorpay.payment.authorize(req);
    expect(req.data.signature).toBe('swag');
    Razorpay.defaults.signature = ''; // reset
  })

  it('add merchant key in request data', function(){
    Razorpay.defaults.key = 'swag';
    delete req.data.key_id;
    Razorpay.payment.authorize(req);
    expect(req.data.key_id).toBe(Razorpay.defaults.key);
  })

  it('setup popup', function(){
    Razorpay.payment.authorize(req);
    var isPopup = req.popup instanceof Popup;
    expect(isPopup).toBe(true);
  })

  it('add options to request object', function(){
    Razorpay.payment.authorize(req);
    expect(typeof req.options).toBe('object');
  })
})

describe('getMethods should', function(){
  it('set Razorpay.payment.methods and call back', function(){
    var methods = {};
    var spyCalled = jasmine.createSpy();
    spyOn($, 'jsonp').and.callFake(function(options){
      options.success(methods);
    });
    Razorpay.payment.getMethods(spyCalled);
    expect(spyCalled).toHaveBeenCalled();
  })
})

describe('handleResponse should invoke', function(){
  var popupRequest, spyCalled, spyNotCalled;

  beforeEach(function(){
    spyCalled = jasmine.createSpy();
    spyNotCalled = jasmine.createSpy();
    popupRequest = {
      error: noop,
      success: noop
    };
  })

  afterEach(function(){
    expect(spyCalled).toHaveBeenCalled();
    expect(spyNotCalled).not.toHaveBeenCalled();
  })

  it('error if response has error', function(done){
    spyOn(popupRequest, 'success').and.callFake(spyNotCalled);
    spyOn(popupRequest, 'error').and.callFake(function(data){
      expect(error_data).toBe(data);
      spyCalled();
      done();
    })
    var error_data = {
      error: {
        description: 'hello'
      }
    };
    onComplete(error_data, popupRequest);
  })

  it('error if response is invalid', function(done){
    spyOn(popupRequest, 'success').and.callFake(spyNotCalled);
    spyOn(popupRequest, 'error').and.callFake(function(data){
      expect(error_data).not.toBe(data);
      expect(typeof data.error.description).toBe('string');
      spyCalled();
      done();
    })
    var error_data = {};
    onComplete(error_data, popupRequest);
  })

  it('success if response contains payment id', function(done){
    spyOn(popupRequest, 'error').and.callFake(spyNotCalled);
    spyOn(popupRequest, 'success').and.callFake(function(data){
      expect(success_data).not.toBe(data);
      spyCalled();
      done();
    })
    var success_data = {
      razorpay_payment_id: '12344'
    };
    onComplete(success_data, popupRequest);
  })
})

describe('createPopup should', function(){
  var url = 'url';
  var request2 = JSON.parse(JSON.stringify(request));
  request2.options = options;

  beforeEach(function(){
    clearRequest();
  })

  it('submit to new tab for ie mobile', function(){
    oldua = ua;
    ua = 'Windows Phone';
    expect(createPopup(request2, url)).toBe(null);
    ua = oldua;
  })

  it('return popup object', function(){
    var popup = createPopup(request2, url);
    expect(popup instanceof Popup).toBe(true);
  })

  it('set popup onClose listener', function(){
    var popup = createPopup(request2, url);
    var spy = jasmine.createSpy();
    spyOn(Razorpay.payment, 'cancel').and.callFake(spy);
    popup.onClose();
    expect(spy).toHaveBeenCalled();
  })

  it('return null if popup creation fails', function(){
    spyOn(window, 'Popup').and.callFake(function(){
      throw 'fail';
    })
    expect(createPopup(request2, url)).toBe(null);
  })
})

describe('cookie operations', function(){
  it('set', function(){
    var key = Math.random().toString();
    var val = Math.random().toString();
    setCookie(key, val);
    expect(getCookie(key)).toBe(val);
    deleteCookie(key);
    expect(getCookie(key)).toBe(null);
  })
})

describe('communicator', function(){

  it('should have been set as itself with contentWindow', function(){
    expect(communicator.contentWindow).toBe(window);
  })

  it('should be set if Razorpay is configured', function(){
    var spy = jasmine.createSpy();
    spyOn(discreet, 'setCommunicator').and.callFake(spy);
    Razorpay.configure({});
    expect(spy).toHaveBeenCalled();
  })

  it('should be set in CriOS-Razorpay but not in CriOS-Checkout', function(){
    var oldua = ua;
    var oldFrame = discreet.isFrame;
    ua = 'CriOS';

    discreet.isFrame = true;
    Razorpay.configure({});
    expect(communicator.contentWindow).toBe(window);

    discreet.isFrame = false;
    Razorpay.configure({});
    expect(communicator instanceof HTMLIFrameElement).toBe(true);

    ua = oldua;
    discreet.isFrame = oldFrame;
  })

  it('should be set as iframe for windows phone', function(){
    var oldua = ua;
    ua = 'Windows Phone';
    Razorpay.configure({});

    // check if communicator is iframe and part of dom
    expect(communicator instanceof HTMLIFrameElement && document.documentElement.contains(communicator)).toBe(true);
    expect(communicator.src.indexOf('communicator.php')).not.toBe(-1);
    ua = oldua;
    Razorpay.configure({});
    expect(document.documentElement.contains(communicator)).toBe(false);
  })
})


describe('submitFormData', function(){
  var oldFrame, oldSubmit;

  it('should setup cookie polling if submitted to new tab and we\'re in iframe', function(done){
    oldSubmit = HTMLFormElement.prototype.submit;
    oldFrame = discreet.isFrame;
    discreet.isFrame = true;

    clearCookieInterval();
    HTMLFormElement.prototype.submit = jQuery.noop;
    submitFormData('', null, null, '_blank');
    expect(!!cookieInterval).toBe(true);
    setCookie('onComplete', 'hello');

    spyOn(window, 'onComplete').and.callFake(function(response){
      expect(getCookie('onComplete')).toBe(null);
      expect(cookieInterval).toBe(null);
      expect(response).toBe('hello');
      done();
    })
  })

  afterEach(function(){
    discreet.isFrame = oldFrame;
    HTMLFormElement.prototype.submit = oldSubmit;
  })
})

describe('onMessage should invoke onComplete', function(){
  var spy, shouldCall;

  it('not if on origin', function(){
    spy = jasmine.createSpy();
    spyOn(window, 'onComplete').and.callFake(spy);
    onMessage({});
  })

  afterEach(function(){
    var expectation = expect(spy);
    if(!shouldCall){
      expectation = expectation.not;
    }
    expectation.toHaveBeenCalled();
  })
})