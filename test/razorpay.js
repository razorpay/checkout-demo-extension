window.options = {
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
  var init_options, errors, field;

  describe("should throw error if", function(){
    beforeEach(function(){
       init_options = jQuery.extend(true, {}, options);
    });
    afterEach(function(){
      expect(errors.length).toBe(1);
      expect(errors[0].field).toBe(field);
    });

    it("no options passed", function(){
      field = '';
      var init_options;
      errors = Razorpay.prototype.validateOptions(init_options, false);
    });
    it("invalid options passed", function(){
      field = '';
      init_options = 'options';
      errors = Razorpay.prototype.validateOptions(init_options, false);
    });
    it("no key specified", function(){
      field = 'key';
      delete init_options.key;
      errors = Razorpay.prototype.validateOptions(init_options, false);
    });
    it("blank key specified", function(){
      field = 'key';
      init_options.key = '';
      errors = Razorpay.prototype.validateOptions(init_options, false);
    });
    it("amount is invalid", function(){
      field = 'amount';
      init_options.amount = 'amount';
      errors = Razorpay.prototype.validateOptions(init_options, false);
    });
  });
})

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