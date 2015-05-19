var discreet = Razorpay.prototype.discreet;

var co_options = {
  'key': 'key_id',
  'amount': '40000',
  'prefill': {
    'name': 'Pranav Gupta',
    'email': 'pranavguptarulz@gmail.com',
    'contact': '8879524924'
  }
}

var cc = {
  number: '4111 1111 1111 1111',
  expiry: '11 / 23',
  cvv: '456'
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
    var custom_options = $.extend(true, {}, co_options);
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
    window.postMessage({options: co_options}, '*');
    setTimeout(function(){
      expect(spyCalled).toHaveBeenCalled();
      done();
    }, 0)
  })
})

// Tests on Credit Card page
describe("Razorpay open cc page", function(){
  var $name, $email, $contact;
  window.hide();
  $('.container').remove();

  beforeEach(function(){
    handleMessage({options: co_options});
    $name    = $('.input[name="card[name]"]');
    $email   = $('.input[name="email"]');
    $contact = $('.input[name="contact"]');
  });

  afterEach(function(){
    window.hide();
    $('.container').remove();
  });

  it("should load modal", function(){
    expect($('.modal')).toBeVisible();
  });

  it("should prefill name", function(){
    expect($name.val()).toBe(co_options.prefill.name);
  });

  it("should prefill email", function(){
    expect($email.val()).toBe(co_options.prefill.email);
  });

  it("should prefill contact number", function(){
    expect($contact.val()).toBe(co_options.prefill.contact);
  });
});