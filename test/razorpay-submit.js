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

describe("Razorpay.configure should", function(){
  it("set default options", function(){
    Razorpay.configure(options);
    for(var i in options){
      expect(options[i]).toBe(Razorpay.defaults[i]);
    }
  })
})

describe("Razorpay.payment.validate should", function(){
  it("call thrower if invalid data", function(){
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


describe("authorize should", function(){
  var init_options, rzp, req;

  beforeEach(function(){
    Razorpay.payment.cancel();
    popupRequest = null;
    req = jQuery.extend(true, {}, request);
  });

  it("fail when invalid data passed", function(){
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

  it("submit html post form if redirect flag is passed", function(){
    var spyCalled = jasmine.createSpy();
    HTMLFormElement.prototype.submit = spyCalled;

    Razorpay.configure({redirect: true});
    Razorpay.payment.authorize(req);

    expect(spyCalled).toHaveBeenCalled();
    Razorpay.configure({redirect: false});
  });

  it("add callback_url if specified in options", function(){
    Razorpay.defaults.callback_url = 'swag';
    Razorpay.payment.authorize(req);
    expect(req.data.callback_url).toBe('swag');
    Razorpay.defaults.callback_url = ''; // reset
  })

  it("add merchant key in request data", function(){
    Razorpay.defaults.key = 'swag';
    delete req.data.key_id;
    Razorpay.payment.authorize(req);
    expect(req.data.key_id).toBe(Razorpay.defaults.key);
  })

  it("setup popup", function(){
    Razorpay.payment.authorize(req);
    var isPopup = req.popup instanceof Popup;
    expect(isPopup).toBe(true);
  })

  it("add options to request object", function(){
    Razorpay.payment.authorize(req);
    expect(typeof req.options).toBe('object');
  })
})

describe("getMethods should", function(){
  it("set Razorpay.payment.methods and call back", function(){
    var methods = {};
    var spyCalled = jasmine.createSpy();
    spyOn($, 'jsonp').and.callFake(function(options){
      options.success(methods);
    });
    Razorpay.payment.getMethods(spyCalled);
    expect(spyCalled).toHaveBeenCalled();
  })
})

describe("handleResponse should invoke", function(){
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

  it("error if response has error", function(){
    spyOn(popupRequest, 'success').and.callFake(spyNotCalled);
    spyOn(popupRequest, 'error').and.callFake(function(data){
      expect(error_data).toBe(data);
      spyCalled();
    })
    var error_data = {
      error: {
        description: 'hello'
      }
    };
    onComplete(error_data, popupRequest);
  })

  it("error if response is invalid", function(){
    spyOn(popupRequest, 'success').and.callFake(spyNotCalled);
    spyOn(popupRequest, 'error').and.callFake(function(data){
      expect(error_data).not.toBe(data);
      expect(typeof data.error.description).toBe('string');
      spyCalled();
    })
    var error_data = {};
    onComplete(error_data, popupRequest);
  })

  it("success if response contains payment id", function(){
    spyOn(popupRequest, 'error').and.callFake(spyNotCalled);
    spyOn(popupRequest, 'success').and.callFake(function(data){
      expect(success_data).not.toBe(data);
      spyCalled();
    })
    var success_data = {
      razorpay_payment_id: '12344'
    };
    onComplete(success_data, popupRequest);
  })
})

describe("createPopup should submit to new tab for ie mobile", function(){
  var url = 'url';
  var request2 = JSON.parse(JSON.stringify(request));
  request2.options = options;

  it("", function(){
    oldua = ua;
    ua = 'Windows Phone';
    expect(createPopup(request2, url)).toBe(null);
    ua = oldua;
  })
})