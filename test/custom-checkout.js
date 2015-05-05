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

describe("validate submission data method should", function(){
  var init_options, errors, field;
})

describe("submit should", function(){
  var init_options, rzp;
  
  beforeEach(function(){
    init_options = jQuery.extend(true, {}, options);
    rzp = new Razorpay(init_options);
  });

  // it("fail when invalid data passed", function(){
  //   spyOn(Razorpay.prototype, 'validateData').and.callFake(function(){
  //     return [null];
  //   })
  //   expect(rzp.submit({})).toBe(false);
  // })
})
