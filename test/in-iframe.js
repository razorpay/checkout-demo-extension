var discreet = Razorpay.prototype.discreet;

var coOptions = {
  'key': 'key_id',
  'amount': '5100',
  'name': 'Daft Punk',
  'description': 'Tron Legacy',
  'image': 'https://i.imgur.com/3g7nmJC.png',
  'netbanking': 'true',
  'prefill': {
    'name': 'Shashank Mehta',
    'email': 'sm@razorpay.com',
    'contact': '9999999999'
  },
  notes: {
    'address': 'Hello World'
  }
}

var cc = {
  number: '4111111111111111',
  expiry: '11 / 23',
  cvv: '456',
  expiry_month: '11',
  expiry_year: '23'
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
    var custom_options = $.extend(true, {}, coOptions);
    custom_options.amount = 'dsf';

    afterEach(function(){
      window.hide();
      $('.container').remove();
    });

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
    window.postMessage({options: coOptions}, '*');
    setTimeout(function(){
      expect(spyCalled).toHaveBeenCalled();
      done();
    }, 0)
  })
})

// Tests on Credit Card page
describe("Razorpay open cc page", function(){
  var $name, $email, $contact;

  beforeEach(function(){
    handleMessage({options: coOptions});
    $name    = jQuery('.input[name="card[name]"]');
    $email   = jQuery('.input[name="email"]');
    $contact = jQuery('.input[name="contact"]');
  });

  afterEach(function(){
    window.hide();
    $('.container').remove();
  });

  it("should load modal", function(){
    expect($('.modal')).toBeVisible();
  });

  it("should prefill name", function(){
    expect($name.val()).toBe(coOptions.prefill.name);
  });

  it("should prefill email", function(){
    expect($email.val()).toBe(coOptions.prefill.email);
  });

  it("should prefill contact number", function(){
    expect($contact.val()).toBe(coOptions.prefill.contact);
  });
});

describe("Razorpay open cc and submit method", function(){
  var co;
  var spyCalled;
  var spyNotCalled;
  var $ccNumber, $ccExpiry, $ccCVV;
  var $name, $email, $contact;
  var $nbLink, $nbBank;
  var $ccSubmit, $nbSubmit;
  var customOptions;

  beforeEach(function(){
    spyCalled    = jasmine.createSpy();
    spyNotCalled = jasmine.createSpy();

    customOptions = $.extend(true, {}, coOptions);
  });

  function launch(){
    // For opening the modal
    handleMessage({options: customOptions});
    co = window.rzp;

    $ccNumber    = jQuery('.input[name="card[number]"]');
    $ccExpiry    = jQuery('.input[name="card[expiry]"]');
    $ccCVV       = jQuery('.input[name="card[cvv]"]');
    $name        = jQuery('.input[name="card[name]"]');
    $email       = jQuery('.input[name="email"]');
    $contact     = jQuery('.input[name="contact"]');
    $ccSubmit    = jQuery('.submit');
  }

  function addAllCC(){
    $ccNumber.sendkeys(cc.number);
    $ccExpiry.sendkeys(cc.expiry);
    $ccCVV.sendkeys(cc.cvv);
  }

  afterEach(function(done){
    // sendkeys needs little delay
    setTimeout(function(){
      $ccSubmit.click();
      expect(spyCalled).toHaveBeenCalled();
      expect(spyNotCalled).not.toHaveBeenCalled();

      window.hide();
      $('.container').remove();

      done();
    }, 100);
  })

  describe("with all details in place", function(){
    var field;
    var value;

    afterEach(function(){
      $ccNumber.sendkeys(cc.number);
      $ccExpiry.sendkeys(cc.expiry);
      $ccCVV.sendkeys(cc.cvv);

      spyOn($, 'ajax').and.callFake(function(options){
        spyCalled();
        expect(options.data[field]).toBe(value);
      });
    });

    it("should submit with all details in place", function(){
      launch();

      spyOn(co, 'submit').and.callFake(function(){
        spyCalled();
      });
    });

    describe(": in ajax request to server", function(){
      it("should pass signature if set", function(){
        customOptions.signature = 'asdasd';
        launch();
        field = 'signature';
        value = customOptions.signature;
      });

      it("should not pass signature if not set", function(){
        launch();
        field = 'signature';
        value = undefined;
      });

      it("should pass amount", function(){
        launch();
        field = 'amount';
        value = customOptions.amount;
      });

      it("should pass currency", function(){
        launch();
        field = 'currency';
        value = 'INR';
      });

      it("should pass email", function(){
        launch();
        field = 'email';
        value = customOptions.prefill.email;
      });

      it("should pass contact", function(){
        launch();
        field = 'contact';
        value = customOptions.prefill.contact;
      });

      it("should pass description", function(){
        launch();
        field = 'description';
        value = customOptions.description;
      });

      it("should pass card[name]", function(){
        launch();
        field = 'card[name]';
        value = customOptions.prefill.name;
      });

      it("should pass card[number]", function(){
        launch();
        field = 'card[number]';
        value = cc.number;
      });

      it("should pass card[cvv]", function(){
        launch();
        field = 'card[cvv]';
        value = cc.cvv;
      });

      it("should pass card[expiry_month]", function(){
        launch();
        field = 'card[expiry_month]';
        value = cc.expiry_month;
      });

      it("should pass card[expiry_year]", function(){
        launch();
        field = 'card[expiry_year]';
        value = cc.expiry_year;
      });

      it("should pass notes[address]", function(){
        launch();
        field = 'notes[address]';
        value = coOptions.notes.address;
      });
    })
  })

  it("should not submit without cc card", function(){
    launch();
    $ccExpiry.sendkeys(cc.expiry);
    $ccCVV.sendkeys(cc.cvv);

    spyCalled();
    spyOn(co, 'submit').and.callFake(function(){
      spyNotCalled();
    });
  });

  it("should not submit without cc expiry", function(){
    launch();
    $ccNumber.sendkeys(cc.number);
    $ccCVV.sendkeys(cc.cvv);

    spyCalled();
    spyOn(co, 'submit').and.callFake(function(){
      spyNotCalled();
    });
  });

  it("should not submit without cc cvv", function(){
    launch();
    $ccCVV.val('').sendkeys('0');

    spyCalled();
    spyOn(co, 'submit').and.callFake(function(){
      spyNotCalled();
    });
  });

  it("should not submit without name", function(){
    customOptions.prefill.name = '';
    launch();
    addAllCC();

    spyCalled();
    spyOn(co, 'submit').and.callFake(function(){
      spyNotCalled();
    });
  });

  it("should not submit without email", function(){
    customOptions.prefill.email = '';
    launch();
    addAllCC();

    spyCalled();
    spyOn(co, 'submit').and.callFake(function(){
      spyNotCalled();
    });
  });

  it("should not submit without contact", function(){
    customOptions.prefill.contact = '';
    launch();
    addAllCC();

    spyCalled();
    spyOn(co, 'submit').and.callFake(function(){
      spyNotCalled();
    });
  });
});

