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
  it("throw if invalid data", function(){
    expect(function(){
      var data = jQuery.extend(request.data);
      delete data.key_id;
      Razorpay.payment.validate(data, true);
    }).toThrow();
  })

  describe("report", function(){
    var data, field;

    beforeEach(function(){
      data = jQuery.extend(request.data);
      data.amount = '45555';
      data.key_id = 'rewerdd';
    })

    it("amount error", function(){
      field = 'amount';
      data.amount = 'asd';
    })

    it("key error", function(){
      field = 'key';
      data.key_id = '';
    })

    afterEach(function(){
      expect(Razorpay.payment.validate(data)[0].field).toBe(field);
    })
  })
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
    expect(Razorpay.payment.authorize(123)).toBe(false);
    expect(Razorpay.payment.authorize({data: true})).toBe(false);
    expect(Razorpay.payment.authorize(req)).toBe(false);
    expect(function(){Razorpay.payment.authorize(req, true)}).toThrow();
  });

  it("submit html post form if redirect flag is passed", function(){
    var spyCalled = jasmine.createSpy();
    HTMLFormElement.prototype.submit = spyCalled;

    Razorpay.configure({redirect: true});
    Razorpay.payment.authorize(req);

    expect(spyCalled).toHaveBeenCalled();
    Razorpay.configure({redirect: false});
  });

  it("break down notes", function(){
    expect(typeof req.data.notes).toBe('object');
    Razorpay.payment.authorize(req);
    expect(typeof req.data.notes).toBe('undefined');
    expect(req.data['notes[note1]']).toBe('one');
    expect(req.data['notes[note2]']).toBe('two');
  })

  it("add callback_url if specified in options", function(){
    Razorpay.defaults.callback_url = 'swag';
    Razorpay.payment.authorize(req);
    expect(req.data.callback_url).toBe('swag');
    Razorpay.defaults.callback_url = ''; // reset
  })

  it("add merchant key in request data", function(){
    Razorpay.payment.authorize(req);
    expect(req.data.key_id).toBe(options.key);
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
    spyOn($, 'ajax').and.callFake(function(options){
      options.success(methods);
    });
    Razorpay.payment.getMethods(spyCalled);
    expect(spyCalled).toHaveBeenCalled();
  })
})

describe("handleResponse should invoke", function(){
  var popupRequest = {
    error: noop,
    success: noop
  };
  var spyCalled, spyNotCalled;

  beforeEach(function(){
    spyCalled = jasmine.createSpy();
    spyNotCalled = jasmine.createSpy();
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
    _rahe.handleResponse(popupRequest, error_data);
  })

  it("error if response is invalid", function(){
    spyOn(popupRequest, 'success').and.callFake(spyNotCalled);
    spyOn(popupRequest, 'error').and.callFake(function(data){
      expect(error_data).not.toBe(data);
      expect(typeof data.error.description).toBe('string');
      spyCalled();
    })
    var error_data = {};
    _rahe.handleResponse(popupRequest, error_data);
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
    _rahe.handleResponse(popupRequest, success_data);
  })
})