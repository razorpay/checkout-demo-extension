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

describe('Razorpay.payment.authorize should', function(){
  it('return razorpay object', function(){
    var spy = jasmine.createSpy();
    spyOn(Razorpay.prototype, 'authorizePayment').and.callFake(spy);
    var rzp = Razorpay.payment.authorize(req = jQuery.extend(true, {}, request));
    expect(rzp instanceof Razorpay).toBe(true);
    expect(spy).toHaveBeenCalled();
  })
})

describe('authorize should', function(){
  var rzp, init_options, req;

  beforeEach(function(){
    if(rzp){
      rzp.cancelPayment();
    }
    req = jQuery.extend(true, {}, request);
  });

  it('fail when invalid data passed', function(){
    spyOn(Razorpay.payment, 'validate').and.callFake(function(){
      return [null];
    })
    describe('', function(){
      var spy, data;
      beforeEach(function(){
        rzp = Razorpay({
          key: 'key',
          amount: 100
        })
        var spy = jasmine.createSpy();
        spyOn(window, 'err').and.callFake(spy);
      })
      afterEach(function(){
        rzp.authorizePayment(data);
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
    spyOn(discreet, 'nextRequestRedirect').and.callFake(spyCalled);

    rzp = Razorpay({
      redirect: true,
      key: 'key',
      amount: 100
    })
    rzp.authorizePayment(req);
    expect(spyCalled).toHaveBeenCalled();
  });

  it('add callback_url if specified in options', function(){
    rzp = Razorpay({
      callback_url: 'swag',
      key: 'key',
      amount: 100
    })
    rzp.authorizePayment(req);
    expect(req.data.callback_url).toBe('swag');
  })

  it('add signature if specified in options', function(){
    rzp = Razorpay({
      signature: 'swag',
      key: 'key',
      amount: 100
    })
    rzp.authorizePayment(req);
    expect(req.data.signature).toBe('swag');
  })

  it('add merchant key in request data', function(){
    rzp = Razorpay({
      key: 'swag',
      amount: 100
    })
    delete req.data.key_id;
    rzp.authorizePayment(req);
    expect(req.data.key_id).toBe('swag');
  })

  it('setup popup', function(){
    rzp = Razorpay({
      key: 'swag',
      amount: 100
    })
    rzp.authorizePayment(req);
    var isPopup = req.popup instanceof Popup;
    expect(isPopup).toBe(true);
  })

  it('add options to request object', function(){
    rzp = Razorpay({
      key: 'swag',
      amount: 100
    })
    rzp.authorizePayment(req);
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
  var rzp, spyCalled, spyNotCalled;

  beforeEach(function(){
    spyCalled = jasmine.createSpy();
    spyNotCalled = jasmine.createSpy();

    rzp = Razorpay({
      key: 'key',
      amount: 100
    })
    rzp.authorizePayment({
      data: {},
      success: noop,
      error: noop
    })
  })

  afterEach(function(){
    expect(spyCalled).toHaveBeenCalled();
    expect(spyNotCalled).not.toHaveBeenCalled();
  })

  it('error if response has error', function(done){
    spyOn(rzp._request, 'success').and.callFake(spyNotCalled);
    spyOn(rzp._request, 'error').and.callFake(function(data){
      expect(error_data).toBe(data);
      spyCalled();
      done();
    })
    var error_data = {
      error: {
        description: 'hello'
      }
    };
    onComplete.call(rzp, error_data);
  })

  it('error if response is invalid', function(done){
    spyOn(rzp._request, 'success').and.callFake(spyNotCalled);
    spyOn(rzp._request, 'error').and.callFake(function(data){
      expect(error_data).not.toBe(data);
      expect(typeof data.error.description).toBe('string');
      spyCalled();
      done();
    })
    var error_data = {};
    onComplete.call(rzp, error_data);
  })

  it('success if response contains payment id', function(done){
    spyOn(rzp._request, 'error').and.callFake(spyNotCalled);
    spyOn(rzp._request, 'success').and.callFake(function(data){
      expect(success_data).not.toBe(data);
      spyCalled();
      done();
    })
    var success_data = {
      razorpay_payment_id: '12344'
    };
    onComplete.call(rzp, success_data);
  })
})

describe('createPopup should', function(){
  var url = 'url';
  var request2;

  beforeEach(function(){
    request2 = JSON.parse(JSON.stringify(request));
    request2.options = options;
  })

  it('submit to new tab for ie mobile', function(){
    oldua = ua;
    ua = 'Windows Phone';
    expect(createPopup(request2.data, url, request2.options)).toBe(null);
    ua = oldua;
  })

  it('return popup object', function(){
    var popup = createPopup(request2.data, url, request2.options);
    expect(popup instanceof Popup).toBe(true);
  })

  it('return null if popup creation fails', function(){
    spyOn(window, 'Popup').and.callFake(function(){
      throw 'fail';
    })
    expect(createPopup(request2.data, url, request2.options)).toBe(null);
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

  it('polling', function(done){
    deleteCookie('onComplete');
    spyOn(window, 'deleteCookie').and.callFake(function(cookieName){
      expect(cookieName).toBe('onComplete');
    })

    expect(cookieInterval).not.toBeDefined();

    cookiePoll();

    expect(cookieInterval).toBeDefined();
    var getSpy = jasmine.createSpy('getCookie');
    var completeSpy = jasmine.createSpy('onComplete');

    var virgin = true;

    spyOn(window, 'getCookie').and.callFake(function(){
      var completionExpection = expect(completeSpy);
      var cookie = '';

      if(virgin){
        virgin = false;
        completionExpection = completionExpection.not;
      }
      else {
        cookie = 'hello';
      }

      setTimeout(function(){
        completionExpection.toHaveBeenCalled();
        if(!cookieInterval){
          setTimeout(function(){
            expect(!!cookieInterval).toBe(false);
            done();
          })
        }
      })
      return cookie;
    })

    spyOn(window, 'onComplete').and.callFake(function(cookie){
      expect(cookie).toBe('hello');
      completeSpy();
    })

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
    isCriOS = true;
    var oldFrame = discreet.isFrame;

    discreet.isFrame = true;
    Razorpay.configure({});
    expect(communicator.contentWindow).toBe(window);

    discreet.isFrame = false;
    Razorpay.configure({});
    expect(communicator instanceof HTMLIFrameElement).toBe(true);

    isCriOS = false;
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


// describe('submitFormData', function(){
//   var oldFrame, oldSubmit;

//   it('should setup cookie polling if submitted to new tab and we\'re in iframe', function(done){
//     oldSubmit = HTMLFormElement.prototype.submit;
//     oldFrame = discreet.isFrame;
//     discreet.isFrame = true;

//     clearCookieInterval();
//     HTMLFormElement.prototype.submit = jQuery.noop;
//     submitFormData('', null, null, '_blank');
//     expect(!!cookieInterval).toBe(true);
//     setCookie('onComplete', 'hello');

//     spyOn(window, 'onComplete').and.callFake(function(response){
//       expect(getCookie('onComplete')).toBe(null);
//       expect(cookieInterval).toBe(null);
//       expect(response).toBe('hello');
//       done();
//     })
//   })

//   afterEach(function(){
//     discreet.isFrame = oldFrame;
//     HTMLFormElement.prototype.submit = oldSubmit;
//   })
// })

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