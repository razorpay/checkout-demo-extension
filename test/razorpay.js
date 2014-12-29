// 'base' is needed due to karma
// https://github.com/karma-runner/karma/issues/481
jasmine.getFixtures().fixturesPath = 'base/spec/fixtures/';

var options = {
  'key': 'key_id'
}

describe("new Razorpay", function(){
  var rzp;

  it('without options should fail', function(){
    expect(function(){new Razorpay()}).toThrow();
  });

  it('should create Razorpay instance', function(){
    rzp = new Razorpay(options);
    expect(rzp).toBeDefined();
  });
})

describe("Razorpay options", function(){
  var rzp;
  var custom = $.extend({}, options);
  custom.protocol = 'https';
  custom.unwanted = 'fake';

  beforeEach(function(){
    rzp = new Razorpay(custom);
  });

  it("should set key", function(){
    expect(rzp.options.key).toBe(options.key);
  });

  it("should not set unknown option", function(){
    expect(rzp.options.unwanted).toBeUndefined();
  });

  it("should override optional settings", function(){
    expect(rzp.options.protocol).toBe(custom.protocol);
  });
});

describe("Razorpay Ajax", function(){
  var rzp;
  var request;

  var data = {
    "amount"             : "5100",
    "currency"           : "INR",
    "card[name]"         : "Harshil Mathur",
    "email"              : "harshil@razorpay.com",
    "contact"            : "9999999999",
    "card[number]"       : "4012001037141112",
    "card[cvv]"          : "888",
    "card[expiry_month]" : "05",
    "card[expiry_year]"  : "19",
    "udf[address]"       : "Hello World",
  }

  var response = {
    success: {
      "data": {
          "paymentid" : "5668898417810430",
          "PAReq"     : "abcsafsf",
          "url"       : "http://api.razorpay.dev/gateway/3dsecure"
      },
      "callbackUrl"   : "http://rzp_test_1DP5mmOlF5G5ag@api.razorpay.dev/v1/payments/pay-2H7CKjN02Ubsfb/callback",
      "http_status_code": 200
    },
    error: {
      "error": {
        "data"                : null,
        "field"               : "amount",
        "internal_error_code" : "BAD_REQUEST_VALIDATION_FAILURE",
        "class"               : "BAD_REQUEST",
        "code"                : "BAD_REQUEST_ERROR",
        "http_status_code"    : 400,
        "description"         : "The amount field is required.",
        "internal_error_desc" : null
      },
      "http_status_code":400
    }
  }

  beforeEach(function(){
    rzp = new Razorpay(options);
  });

  describe("on submit", function(){
    it("should generate success handler", function(){
      spyOn(discreet, 'success');
      rzp.submit({data: data});
      expect(discreet.success).toHaveBeenCalled();
    })
  })

  describe("on success", function(){
    beforeEach(function(){
      spyOn(Razorpay.$, 'ajax').and.callFake(function(options){
        options.success(response.success);
      })
    });

    describe("should load iframe and", function(){
      beforeEach(function(){
        loadFixtures('iframe_container.html');
        rzp.submit({
          data: data,
          parent: Razorpay.$('.rzp-container-test .rzp-modal')
        });
      });

      it("iframe should be visible", function(){
        expect($('.rzp-modal iframe')).toBeVisible();
      })

      it("iframe should be in DOM", function(){
        expect($('.rzp-modal iframe')[0]).toBeInDOM();
      })

    })

    describe('should load iframe which', function () {
      var spyCalled;
      var spyNotCalled;
      var prevHostname;
      var prevProtocol;

      beforeEach(function(){
        prevHostname = rzp.options.hostname;
        prevProtocol = rzp.options.protocol;
        spyOn(discreet, 'success').and.callFake(function(){
          return function(){
            loadFixtures('iframe_container.html');
            var iframe = document.createElement('iframe');
            var xdm = jasmine.getFixtures().read('iframe_xdm.html');
            $('.rzp-modal').append(iframe);
            iframe.contentWindow.document.write(xdm);
          }
        });
      })

      afterEach(function() {
        expect(spyCalled).toHaveBeenCalled();
        expect(spyNotCalled).not.toHaveBeenCalled();
        rzp.options.protocol = prevProtocol;
        rzp.options.hostname = prevHostname;
      });

      it("should not call XDCallback", function(done){
        spyCalled = jasmine.createSpy('message');
        spyNotCalled = jasmine.createSpy('message');

        rzp.submit({
          data: data,
          success: function(){
            spyNotCalled();
            done();
          }
        });
        setTimeout(function(){
          spyCalled();
          done();
        }, 500)
      });

      it("should call XDCallback", function(done){
        rzp.options.hostname = 'localhost:9876'
        rzp.options.protocol = 'http'
        spyCalled = jasmine.createSpy('message');
        spyNotCalled = jasmine.createSpy('message');

        rzp.submit({
          data: data,
          success: function(){
            spyCalled();
            done();
          }
        });
      });
    });
  });

  describe("on error", function(){
    beforeEach(function(){
      errorHandler = jasmine.createSpy();
      spyOn(Razorpay.$, 'ajax').and.callFake(function(options){
        options.failure(response.error);
      })
    });

    it("should call given error handler", function(){
      rzp.submit({
        data: data,
        failure: errorHandler
      });
      expect(errorHandler).toHaveBeenCalled();
    })
  })
});
