var options = {
  'key': 'key_id',
  'amount': '40000'
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

  var init_options;

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

  beforeEach(function(){
     init_options = $.clone(options);
  });

  describe("should return error", function(){
    
    afterEach(function(){
      var errors = co.validateOptions(customOptions);
      expect(errors.length).toBe(1);
      expect(errors[0].field).toBe(field);
    })

    // it("should fail when no key", function(){
    //   var init_options = init_options;
    //   delete init_options.key;
    // });
  });
})
