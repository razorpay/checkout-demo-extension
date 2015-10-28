describe("onComplete should", function(){
  var spy;
  var req = {
    postmessage: false,
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

  afterEach(function(){
    expect(spy).toHaveBeenCalled();
  })

  it("invoke success", function(done){
    spy = jasmine.createSpy();
    spyOn(req, 'success').and.callFake(function(returnObj){
      if(returnObj.razorpay_payment_id === 'pay_id')
        spy();
      done();
    })
    window.onComplete({razorpay_payment_id: 'pay_id'});
  })

  it("invoke error", function(done){
    spy = jasmine.createSpy();
    var error = {error: {description: "dsf"}};
    spyOn(req, 'error').and.callFake(function(returnObj){
      if(returnObj.description === error.description)
        spy();
      done();
    })
    window.onComplete(error);
  })
})