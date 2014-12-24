// 'base' is needed due to karma
// https://github.com/karma-runner/karma/issues/481
jasmine.getFixtures().fixturesPath = 'base/spec/fixtures/';

var options = {
  'key': 'key_id'
}

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

  describe("on success", function(){
    beforeEach(function() {
      spyOn(rzp.$, 'ajax').and.callFake(function(options){
        options.success(response.success);
      })
    });

    it("should call handleAjaxSuccess", function(){
      spyOn(rzp, 'handleAjaxSuccess');
      rzp.public.submit(data);
      expect(rzp.handleAjaxSuccess).toHaveBeenCalled();
    });

    it("should call client handleAjaxSuccess", function(){
      spyOn(rzp.public.client, 'handleAjaxSuccess').and.callFake(function(){
        loadFixtures('iframe_container.html');
        return $('.rzp-container');
      });
      rzp.public.submit(data);
      expect(rzp.public.client.handleAjaxSuccess).toHaveBeenCalled();
    });

    describe("should load iframe and", function(){
      beforeEach(function(){
        spyOn(rzp.public.client, 'handleAjaxSuccess').and.callFake(function(){
          loadFixtures('iframe_container.html');
          return $('.rzp-container');
        })

        rzp.public.submit(data);
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

      beforeEach(function(done){
        prevHostname = rzp.options.hostname;
        prevProtocol = rzp.options.protocol;

        spyOn(rzp, 'handleAjaxSuccess').and.callFake(function(){
          loadFixtures('iframe_container.html');
          var iframe = document.createElement('iframe');
          var xdm = jasmine.getFixtures().read('iframe_xdm.html');
          $('.rzp-modal').append(iframe);
          iframe.contentWindow.document.write(xdm);
        });
        done();
      })

      afterEach(function(done) {
        expect(spyCalled).toHaveBeenCalled();
        expect(spyNotCalled).not.toHaveBeenCalled();
        rzp.options.protocol = prevProtocol;
        rzp.options.hostname = prevHostname;
        done();
      });

      it("should send a window postmessage", function(done){
        spyCalled = jasmine.createSpy('message');
        spyNotCalled = jasmine.createSpy('message');

        rzp.XD.receiveMessage(function(e){
          spyCalled();
          done();
        })
        rzp.public.submit(data);
      });

      it("should not call XDCallback", function(done){
        spyCalled = jasmine.createSpy('message');
        spyNotCalled = jasmine.createSpy('message');

        rzp.XD.receiveMessage(function(e){
          spyCalled();

          // timeout is needed to ensure that done doesn't get called before XDCallback is hit
          setTimeout(function(){
            done();
          }, 200);
        })
        spyOn(rzp, 'XDCallback').and.callFake(function(){
          spyNotCalled();
        })
        rzp.public.submit(data);
      });

      it("should call XDCallback", function(done){
        spyCalled = jasmine.createSpy('message');
        spyNotCalled = jasmine.createSpy('message');

        rzp.options.hostname = 'localhost:9876';
        rzp.options.protocol = 'http';

        spyOn(rzp, 'XDCallback').and.callFake(function(){
          spyCalled();
          done();
        })
        rzp.public.submit(data);
      })
    });
  });

  describe("on error", function(){
    beforeEach(function(){
      spyOn(rzp.$, 'ajax').and.callFake(function(options){
        options.error(response.error);
      })
    });

    it("should call handleAjaxError", function(){
      spyOn(rzp, 'handleAjaxError');
      rzp.public.submit(data);
      expect(rzp.handleAjaxError).toHaveBeenCalled();
    })

    it("should call client handleAjaxError", function(){
      spyOn(rzp.public.client, 'handleAjaxError');
      rzp.public.submit(data);
      expect(rzp.public.client.handleAjaxError).toHaveBeenCalled();
    });
  })
});
