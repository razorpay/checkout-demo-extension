var $ = Razorpay.prototype.$;
var discreet = Razorpay.prototype.discreet;

var options = {
  'key': 'key_id',
  'amount': '40000'
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
    isHedwig = new Razorpay(options).hedwig instanceof Razorpay.prototype.Hedwig;
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

  it("invoke success callback when immediate success", function(){
    spyOn($, 'ajax').and.callFake(function(request){
      var successResponse = $.extend(true, {}, response_v1.success);
      request.success(successResponse);
    })
    var spy = jasmine.createSpy();
    req.success = function(response){
      if(typeof response.razorpay_payment_id == 'string')
        spy();
    }
    new Razorpay(init_options).submit(req);
    
    setTimeout(function(){
      expect(spy).toHaveBeenCalled();
    }, 0)
  })
})

describe("XDCallback should", function(){
  var req;
  var init_options = jQuery.extend(true, {}, options);
  var rzp = new Razorpay(init_options);

  beforeEach(function(){
    req = jQuery.extend(true, {}, request);
    rzp.submit(req);
    req.popup.window = window;
  });

  it("call popup.loaded", function(){
    var spyCalled = jasmine.createSpy();
    spyOn(req.popup, 'loaded').and.callFake(spyCalled);
    window.postMessage({source: 'popup'}, '*');
    
    setTimeout(function(){
      expect(spyCalled).toHaveBeenCalled();
    }, 0)
  })

  it("close popup if source is not \"popup\"", function(){
    var spyCalled = jasmine.createSpy();
    spyOn(req.popup, 'close').and.callFake(spyCalled);
    window.postMessage({}, '*');
    
    setTimeout(function(){
      expect(spyCalled).toHaveBeenCalled();
    }, 0)
  })

  it("invoke error callback", function(){
    var spyCalled = jasmine.createSpy();
    req.error = $.noop;
    spyOn(req, 'error').and.callFake(spyCalled);
    window.postMessage({error:{description:'yolo'}}, '*');
    
    setTimeout(function(){
      expect(spyCalled).toHaveBeenCalled();
    }, 0)
  })

  it("invoke success callback", function(){
    var spyCalled = jasmine.createSpy();
    req.success = $.noop;
    spyOn(req, 'success').and.callFake(function(response){
      if(typeof response.razorpay_payment_id == 'string')
        spyCalled();
    });
    window.postMessage({}, '*');
    
    setTimeout(function(){
      expect(spyCalled).toHaveBeenCalled();
    }, 0)
  })
})

describe("navigatePopup method should", function(){
  var req = jQuery.extend(true, {}, request);
  var init_options = jQuery.extend(true, {}, options);
  
  new Razorpay(init_options).submit(req);
  req.popup.window = window;

  var customObject = {};
  var anObject;

  it("convey request details to popup", function(){
    spyOn(discreet, 'XDCallback').and.callFake(function(message, data){
      anObject = data;
    })
    discreet.navigatePopup.call(req, customObject);
    
    setTimeout(function(){
      expect(anObject).toBe(customObject);
    }, 0)
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