var discreet = Razorpay.discreet;
var $ = Razorpay.$;

describe("onComplete should", function(){
  var req = {
    success: jQuery.noop,
    error: jQuery.noop,
    options: Razorpay.defaults,
    data: {
      amount: 3000
    }
  }
  
  beforeEach(function(){
    discreet.setupPopup(req, '');
  })

  it("invoke success", function(){
    var spy = jasmine.createSpy();
    spyOn(req, 'success').and.callFake(function(returnObj){
      if(returnObj.razorpay_payment_id === 'pay_id')
        spy();
    })
    window.onComplete('{"razorpay_payment_id": "pay_id"}');
    expect(spy).toHaveBeenCalled();
  })

  it("invoke error", function(){
    var spy = jasmine.createSpy();
    var error = {error: {description: "dsf"}};
    spyOn(req, 'error').and.callFake(function(returnObj){
      if(returnObj.description === error.description)
        spy();
    })
    window.onComplete(JSON.stringify(error));
    expect(spy).toHaveBeenCalled();
  })
})