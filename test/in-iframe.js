var discreet = Razorpay.prototype.discreet;

var options = {
  'key': 'key_id',
  'amount': '40000'
}

describe("in-iframe should have", function(){
  it("jQuery", function(){
		expect($).toBeDefined();
	})
	it("jQuery.payment", function(){
		expect($.payment).toBeDefined();
	})
	it("modal", function(){
		expect(Modal).toBeDefined();
	})
	it("smarty", function(){
		expect($.fn.smarty).toBeDefined();
	})
	it("doT", function(){
		expect(doT).toBeDefined();
	})
	it("modal template", function(){
		expect(templates.modal).toBeDefined();
	})
})

describe("message listener should", function(){

  it("throw error on erroneous options", function(done){
    var spyCalled = jasmine.createSpy();
    var origRazorpay = Razorpay;
    var custom_options = $.extend(true, {}, options);
    custom_options.amount = 'dsf';
    
    spyOn(window, 'Razorpay').and.callFake(function(argOptions){
      try{
        return new origRazorpay(argOptions)
      } catch(e){
        spyCalled();
        throw new Error("custom error");
      }
    });
    window.postMessage({options: custom_options}, '*');
    setTimeout(function(){
      expect(spyCalled).toHaveBeenCalled();
      done();
    }, 0)
  })

  it("init razorpay on receiving init options", function(done){
  	var spyCalled = jasmine.createSpy();
    var origRazorpay = Razorpay;
    spyOn(window, 'Razorpay').and.callFake(function(argOptions){
      spyCalled();
      return new origRazorpay(argOptions)
    })
    window.postMessage({options: options}, '*');
    setTimeout(function(){
      expect(spyCalled).toHaveBeenCalled();
      done();
    }, 0)
  })
})

// describe("CheckoutBridge")