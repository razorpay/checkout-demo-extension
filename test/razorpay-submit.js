var $ = Razorpay.prototype.$;
var Hedwig = Razorpay.prototype.Hedwig;
var discreet = Razorpay.prototype.discreet;

var options = {
  'key': 'key_id',
  'amount': '40000',
  'name': 'Merchant Name',
  'hostname': 'api.razorpay.dev'
}

var response_v1 = {
  success: {
    "version": "1",
    "request": {
      "url": "http://api.razorpay.dev/gateway/3dsecure",
      "method": "post",
      "content": null
    },
    "payment_id": "5668898417810430",
    "gateway": "axis"
  },
  error: {
    "version": "1",
    "error": {
      "description": "error_desc",
      "field": "error_field"
    },
    "payment_id": "5668898417810430",
    "gateway": "axis"
  }
}

var no3dsecureResponse = {
  razorpay_payment_id: 'xyz'
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
      expect(options[i]).toBe(discreet.defaults[i]);
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
    discreet.defaults.callback_url = 'swag';
    Razorpay.payment.authorize(req);
    expect(req.data.callback_url).toBe('swag');
    discreet.defaults.callback_url = ''; // reset
  })

  it("add merchant key in request data", function(){
    Razorpay.payment.authorize(req);
    expect(req.data.key_id).toBe(options.key);
  })

  it("setup popup", function(){
    Razorpay.payment.authorize(req);
    var isPopup = req.popup instanceof Razorpay.prototype.Popup;
    expect(isPopup).toBe(true);
  })

  it("add options to request object", function(){
    Razorpay.payment.authorize(req);
    expect(typeof req.options).toBe('object');
  })

  it("call $.ajax", function(){
    var spy = jasmine.createSpy();
    spyOn($, 'ajax').and.callFake(spy);
    Razorpay.payment.authorize(req);
    expect(spy).toHaveBeenCalled();
  })
})

describe("authorize ajax should invoke", function(){
  var init_options, req, spyCalled, spyNotCalled;

  beforeEach(function(){
    req = jQuery.extend(true, {}, request);
    spyCalled = jasmine.createSpy();
    spyNotCalled = jasmine.createSpy();
  });

  afterEach(function(){
    expect(spyCalled).toHaveBeenCalled();
    expect(spyNotCalled).not.toHaveBeenCalled();
  });

  it("paymentSuccess when immediate success", function(){
    spyOn($, 'ajax').and.callFake(function(request){
      request.success(no3dsecureResponse);
    })
    spyOn(discreet, 'paymentSuccess').and.callFake(spyCalled);
    Razorpay.payment.authorize(req);
  })

  it("request success callback when immediate success", function(){
    spyOn($, 'ajax').and.callFake(function(request){
      request.success(no3dsecureResponse);
    })
    req.success = function(response){
      if(typeof response.razorpay_payment_id == 'string')
        spyCalled();
    }
    Razorpay.payment.authorize(req);
  })
})

describe("XDCallback should", function(){
  var req, spyCalled, spyNotCalled, rzp, receivedMessage, origin;
  var init_options = jQuery.extend(true, {}, options);

  beforeEach(function(){
    origin = '';
    rzp = new Razorpay(init_options);
    req = jQuery.extend(true, {}, request);
    spyOn($, 'ajax').and.callFake($.noop);
    Razorpay.payment.authorize(req);
    spyCalled = jasmine.createSpy();
    spyNotCalled = jasmine.createSpy();
  });

  afterEach(function(){
    discreet.xdm._listener({target: window, data: receivedMessage, origin: (origin || 'https://api.razorpay.com')});
    expect(spyCalled).toHaveBeenCalled();
    expect(spyNotCalled).not.toHaveBeenCalled();
  })

  it("call popup.loaded", function(){
    receivedMessage = {source: 'popup'};
    spyOn(req.popup, 'loaded').and.callFake(spyCalled);
  });

  it("not call popup.loaded", function(){
    origin = 'some';
    receivedMessage = {source: 'popup'};
    spyCalled();
    spyOn(req.popup, 'loaded').and.callFake(spyNotCalled);
  })

  it("close popup if source is not \"popup\"", function(){
    receivedMessage = {};
    spyOn(req.popup, 'close').and.callFake(spyCalled);
  })

  it("invoke error callback", function(){
    req.error = $.noop;
    receivedMessage = {error:{description:'yolo'}};
    spyOn(req, 'error').and.callFake(spyCalled);
  })

  it("invoke success callback", function(){
    req.success = $.noop;
    spyOn(req, 'success').and.callFake(function(response){
      if(typeof response.razorpay_payment_id == 'string')
        spyCalled();
    });
    receivedMessage = {razorpay_payment_id: 'xyz'};
  })
})

describe("navigatePopup method should", function(){
  var init_options = jQuery.extend(true, {}, options);
  var spyCalled;

  it("invoke request's error callback if popup has not been setup", function(){
    spyOn($, 'ajax').and.callFake($.noop);
    var req = jQuery.extend(true, {error: $.noop}, request);
    Razorpay.payment.authorize(req);

    req.popup = 'pop';
    spyCalled = jasmine.createSpy();
    spyOn(req, 'error').and.callFake(spyCalled);
    discreet.navigatePopup.call(req, {});
    expect(spyCalled).toHaveBeenCalled();
  })

  it("convey request details to popup", function(){
    spyOn($, 'ajax').and.callFake($.noop);
    var req = jQuery.extend(true, {error: $.noop}, request);
    Razorpay.payment.authorize(req);

    var customObject = {};
    var anObject;
    var spyCalled = jasmine.createSpy();

    spyOn(discreet.hedwig, 'sendMessage').and.callFake(function(message, origin, source){
      if(source === req.popup.window){
        anObject = message;
      }
    })
    req.popup._loaded = true;
    discreet.navigatePopup.call(req, customObject);
    expect(anObject).toBe(customObject);
  })
})

describe("api ajax handler should invoke", function(){
  var init_options = jQuery.extend(true, {}, options);
  var responseData, rzp, req;

  beforeEach(function(){
    req = jQuery.extend(true, {}, request);
    spyOn(Razorpay.prototype.$, 'ajax').and.callFake(function(options){
      options.success(responseData);
    })
    rzp = new Razorpay(init_options)
  })

  describe("request.error if response has", function(){
    var spy;
    
    beforeEach(function(){
      spy = jasmine.createSpy();
      req.error = function(res){
        expect(res).toBe(responseData);
        spy();
      }
    })

    afterEach(function(){
      Razorpay.payment.authorize(req);
      expect(spy).toHaveBeenCalled();
    })

    it("error", function(){
      responseData = {
        version: 1,
        error: {description: 'gpl'},
        payment_id: 'id'
      }
    })

    it("no useful fields", function(){
      responseData = {}
    })

    it("no useful fields except version", function(){
      responseData = {
        version: 1
      }
    })
    
  })

  it("request.error if response doesn't have useful fields", function(){
    responseData = {}
    var spy = jasmine.createSpy();
    req.error = spy;
    Razorpay.payment.authorize(req);
    expect(spy).toHaveBeenCalled();
  })

  it("navigatePopup when next request details are there", function(){
    var isSameObj;
    responseData = {
      version: 1,
      payment_id: 'id'
    }
    var nextRequest = {url: 'abc'};
    responseData.request = nextRequest;

    spyOn(discreet, 'navigatePopup').and.callFake(function(request){
      isSameObj = request === nextRequest;
    })

    Razorpay.payment.authorize(req);
    expect(isSameObj).toBe(true);
  });

  it("redirection if callback_url is passed", function(){
    var spy = jasmine.createSpy();
    var nextUrl = 'next.url'
    responseData = {
      version: 1,
      request: {
        url: nextUrl
      }
    };
    
    spyOn(discreet, 'nextRequestRedirect').and.callFake(function(data){
      if(data.url === nextUrl)
        spy();
    });
    req.data.callback_url = 'http://hello.world';
    Razorpay.payment.authorize(req);
    expect(spy).toHaveBeenCalled();
  })
});

describe("getMethods should", function(){
  it("set Razorpay.payment.methods and call back", function(){
    var methods = {};
    var spyCalled = jasmine.createSpy();
    spyOn(Razorpay.prototype.$, 'ajax').and.callFake(function(options){
      options.success(methods);
    });
    Razorpay.payment.getMethods(spyCalled);
    expect(spyCalled).toHaveBeenCalled();
  })
})

describe("on popup close,", function(){
  var request = {
    error: jQuery.noop,
    payment_id: 'qwer',
    options: options
  };

  var spy;

  beforeEach(function(){
    spy = jasmine.createSpy();
  })

  afterEach(function(){
    discreet.getPopupClose(request)();
    expect(spy).toHaveBeenCalled();
  })

  it("xdm listener should be removed", function(){
    spyOn(discreet.xdm, 'removeMessageListener').and.callFake(spy);
  })

  it("call back specified error handler", function(){
    spyOn(request, 'error').and.callFake(function(data){
      expect('error' in data);
      spy();
    });
  })

  it("xdm listener should be removed", function(){
    spyOn($, 'ajax').and.callFake(function(ajaxOptions){
      expect(ajaxOptions.data.key_id).toBe(options.key)
      spy();
    });
  })
})