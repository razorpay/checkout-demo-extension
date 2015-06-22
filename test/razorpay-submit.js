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
// var popupMessage = {
//   message: {
//     origin: 'checkout.razorpay.com'
//   },
//   data{

//   }
// }

var request = {
  data: {
    'key1': 'value1',
    'key2': 'value2'
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

describe("authorize should", function(){
  var init_options, rzp, req;

  beforeEach(function(){
    req = jQuery.extend(true, {}, request);
  });

  it("fail when invalid data passed", function(){
    spyOn(Razorpay.payment, 'validate').and.callFake(function(){
      return [null];
    })
    expect(Razorpay.payment.authorize(req)).toBe(false);
  });

  it("submit html post form if redirect flag is passed", function(){
    var spyCalled = jasmine.createSpy();
    HTMLFormElement.prototype.submit = spyCalled;

    Razorpay.configure({redirect: true});
    Razorpay.payment.authorize(req);

    expect(spyCalled).toHaveBeenCalled();
    Razorpay.configure({redirect: false});
  });

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

  it("return ajax object", function(){
    var obj = Razorpay.payment.authorize(req);
    expect(typeof obj).toBe("object");
    expect(typeof obj.abort).toBe("function");
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
  var req, spyCalled, rzp, receivedMessage, origin;
  var init_options = jQuery.extend(true, {}, options);

  beforeEach(function(){
    origin = '';
    rzp = new Razorpay(init_options);
    req = jQuery.extend(true, {}, request);
    spyOn($, 'ajax').and.callFake($.noop);
    Razorpay.payment.authorize(req);
    spyCalled = jasmine.createSpy();
  });

  afterEach(function(){
    discreet.xdm._listener({data: receivedMessage, origin: 'https://api.razorpay.com'});
    expect(spyCalled).toHaveBeenCalled();
  })

  it("call popup.loaded", function(){
    receivedMessage = {source: 'popup'};
    spyOn(req.popup, 'loaded').and.callFake(spyCalled);
  });

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

  it("invoke request's error callback if popup has not been setup", function(){
    spyOn($, 'ajax').and.callFake($.noop);
    var req = jQuery.extend(true, {error: $.noop}, request);
    Razorpay.payment.authorize(req);

    req.popup = 'pop';
    var spyCalled = jasmine.createSpy();
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
      if(source == req.popup.window){
        anObject = message;
      }
    })
    req.popup._loaded = true;
    discreet.navigatePopup.call(req, customObject);
    expect(anObject).toBe(customObject);
  })
})

describe("api ajax handler should", function(){
  var req = jQuery.extend(true, {}, request);
  var init_options = jQuery.extend(true, {}, options);
  var responseData, rzp;

  beforeEach(function(){
    spyOn(Razorpay.prototype.$, 'ajax').and.callFake(function(options){
      options.success(responseData);
    })
    rzp = new Razorpay(init_options)
  })

  it("invoke request.error", function(){
    responseData = {
      version: 1,
      error: {description: 'gpl'},
      payment_id: 'id'
    }
    var spy = jasmine.createSpy();
    req.error = spy;
    Razorpay.payment.authorize(req);
    expect(spy).toHaveBeenCalled();
  })

  it("invoke navigatePopup when next request details are there", function(){
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
