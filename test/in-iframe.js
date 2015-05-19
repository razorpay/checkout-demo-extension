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
  it("show checkout form on receiving init options", function(done){
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