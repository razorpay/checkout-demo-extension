var options = {
  'key': 'key_id',
  'amount': '4000'
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

describe("Options validation", function(){
  var rzp;
  var request;

  var init_options = {
    protocol: 'https',
    hostname: 'api.razorpay.dev',
    version: 'v1',
    jsonpUrl: '/payments/create/jsonp',
    netbankingListUrl: '/banks',
    key: 'rzp_test_1DP5mmOlF5G5ag',
    handler: null
  }

  var response_v0 = {
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

  var response_v1 = {
    success: {

    },
    error: {

    }
  }

  beforeEach(function(){
    rzp = new Razorpay(init_options);
  });

  describe("on submit", function(){
    it("should generate success handler", function(){
      spyOn(discreet, 'success');
      spyOn(Razorpay.$, 'ajax');
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

    /**
     * Disabling iframe tests for now.
     * TODO replace with tests for popup
     *
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
    */

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

//      it("should not call XDCallback", function(done){
//        spyCalled = jasmine.createSpy('message');
//        spyNotCalled = jasmine.createSpy('message');
//
//        rzp.submit({
//          data: data,
//          success: function(){
//            spyNotCalled();
//            done();
//          }
//        });
//        setTimeout(function(){
//          spyCalled();
//          done();
//        }, 500)
//      });

//      it("should call XDCallback", function(done){
//        rzp.options.hostname = 'localhost:9876'
//        rzp.options.protocol = 'http'
//        spyCalled = jasmine.createSpy('message');
//        spyNotCalled = jasmine.createSpy('message');
//
//        rzp.submit({
//          data: data,
//          success: function(){
//            spyCalled();
//            done();
//          }
//        });
//      });
    });
  });

  describe("on error", function(){
    beforeEach(function(){
      errorHandler = jasmine.createSpy();
      spyOn(Razorpay.$, 'ajax').and.callFake(function(options){
        options.error(response.error);
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
