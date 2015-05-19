var $ = Razorpay.prototype.$;
var Hedwig = Razorpay.prototype.Hedwig;
var discreet = Razorpay.prototype.discreet;

var options = {
  'key': 'key_id',
  'amount': '40000',
  'host': 'api.razorpay.dev'
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

describe("init razorpay should", function(){
  it("set hedwig", function(){
    isHedwig = new Razorpay(options).hedwig instanceof Hedwig;
    expect(isHedwig).toBe(true);
  })
})
describe("validate submission data method should", function(){
  var init_options, errors, field;
})

describe("submit should", function(){
  var init_options, rzp, req;
  
  beforeEach(function(){
    req = jQuery.extend(true, {}, request);
    init_options = jQuery.extend(true, {}, options);
  });

  it("fail when invalid data passed", function(){
    spyOn(Razorpay.prototype, 'validateData').and.callFake(function(){
      return [null];
    })
    expect(new Razorpay(init_options).submit(req)).toBe(false);
  });

  it("submit html post form if redirect flag is passed", function(){
    var spyCalled = jasmine.createSpy();
    HTMLFormElement.prototype.submit = spyCalled;

    init_options.redirect = true;
    new Razorpay(init_options).submit(req);

    expect(spyCalled).toHaveBeenCalled();
  });

  it("add merchant key in request data", function(){
    new Razorpay(init_options).submit(req);
    expect(req.data.key_id).toBe(options.key);
  })

  it("setup popup", function(){
    new Razorpay(init_options).submit(req);
    var isPopup = req.popup instanceof Razorpay.prototype.Popup; 
    expect(isPopup).toBe(true);
  })

  it("add razorpay instance to request object", function(){
    rzp = new Razorpay(init_options);
    rzp.submit(req);
    isRzp = req.rzp instanceof Razorpay;
    expect(isRzp).toBe(true);
  })

  it("return ajax object", function(){
    rzp = new Razorpay(init_options);
    var obj = rzp.submit(req);
    expect(typeof obj).toBe("object");
    expect(typeof obj.abort).toBe("function");
  })
})

describe("submit ajax should invoke", function(){
  var init_options, rzp, req, spyCalled, spyNotCalled;
  
  beforeEach(function(){
    req = jQuery.extend(true, {}, request);
    init_options = jQuery.extend(true, {}, options);
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
    new Razorpay(init_options).submit(req);
  })

  it("request success callback when immediate success", function(){
    spyOn($, 'ajax').and.callFake(function(request){
      request.success(no3dsecureResponse);
    })    
    req.success = function(response){
      if(typeof response.razorpay_payment_id == 'string')
        spyCalled();
    }
    new Razorpay(init_options).submit(req);
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
    req.error = function(){
      alert(1);
    }
    rzp.submit(req);
    req.error = function(){
      alert(2);
    }
    req.popup.window = window;
    spyCalled = jasmine.createSpy();
    spyNotCalled = jasmine.createSpy();
  });

  afterEach(function(done){
    req.error = function(){
      alert(4);
    }
    window.postMessage(receivedMessage, '*');
    // discreet.listener({data: receivedMessage, origin: 'https://api.razorpay.com'});
    setTimeout(function(){
      expect(spyCalled).toHaveBeenCalled();
      expect(spyNotCalled).not.toHaveBeenCalled();
      done();
    }, 100)
  })

  it("call popup.loaded", function(){
    receivedMessage = {'source': 'popup'};
    spyOn(req.popup, 'loaded').and.callFake(spyCalled);
  });

  it("close popup if source is not \"popup\"", function(){
    receivedMessage = {};
    spyOn(Razorpay.prototype.Popup.prototype, 'close').and.callFake(spyCalled);
  })

  it("invoke error callback", function(){
    // req.error = req.success = $.noop;
    receivedMessage = {error:{description:'yolo'}};
    req.error = function(){
      alert(3);
    }
    // spyOn(req, 'error').and.callFake(spyCalled);
    spyOn(discreet, 'paymentSuccess').and.callFake(spyNotCalled);
  })

  it("invoke success callback", function(){
    req.error = req.success = $.noop;
    spyOn(req, 'error').and.callFake(spyNotCalled);
    spyOn(req, 'success').and.callFake(function(response){
      if(typeof response.razorpay_payment_id == 'string')
        spyCalled();
    });
    receivedMessage = {razorpay_payment_id: 'xyz'};
  })
})

describe("navigatePopup method should", function(){
  var req, init_options;

  beforeEach(function(){
    req = jQuery.extend(true, {error: $.noop}, request);
    init_options = jQuery.extend(true, {}, options);
    spyOn($, 'ajax').and.callFake($.noop);
    new Razorpay(init_options).submit(req);
  })

  it("invoke request's error callback if popup has not been setup", function(){
    req.popup = 'pop';
    var spyCalled = jasmine.createSpy();
    spyOn(req, 'error').and.callFake(spyCalled);
    discreet.navigatePopup.call(req, {});
    expect(spyCalled).toHaveBeenCalled();
  })
  
  it("convey request details to popup", function(){
    var customObject = {};
    var anObject;

    spyOn(Hedwig.prototype, 'sendMessage').and.callFake(function(message, origin, source){
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
    rzp.submit(req);
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

    rzp.submit(req);
    expect(isSameObj).toBe(true);
  });
});