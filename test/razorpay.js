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
});
