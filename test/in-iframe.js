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

//describe("message listener should", function(){
//  it("throw error on erroneous options", function(done){
//    var spyCalled = jasmine.createSpy();
//    var origRazorpay = Razorpay;
//    var custom_options = $.extend(true, {}, coOptions);
//    custom_options.amount = 'dsf';
//
//    afterEach(function(){
//      frameDiscreet.hide();
//      $('.container').remove();
//    });
//
//    spyOn(window, 'Razorpay').and.callFake(function(argOptions){
//      try{
//        return new origRazorpay(argOptions)
//      } catch(e){
//        spyCalled();
//        throw new Error("custom error");
//      }
//    });
//    frameDiscreet.postMessage({options: custom_options}, '*');
//    setTimeout(function(){
//      expect(spyCalled).toHaveBeenCalled();
//      done();
//    }, 0)
//  })
//
//  it("init razorpay on receiving init options", function(done){
//  	var spyCalled = jasmine.createSpy();
//    var origRazorpay = Razorpay;
//    spyOn(window, 'Razorpay').and.callFake(function(argOptions){
//      spyCalled();
//      return new origRazorpay(argOptions)
//    })
//    frameDiscreet.postMessage({options: coOptions}, '*');
//    setTimeout(function(){
//      expect(spyCalled).toHaveBeenCalled();
//      done();
//    }, 0)
//  })
//})

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
    frameDiscreet.hide();
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
    co = frameDiscreet.rzp;

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

      frameDiscreet.hide();
      $('.container').remove();

      done();
    }, 0);
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

  describe("and getFormData method", function(){
    var co, data;

    function addAllCC(){
      $ccNumber.sendkeys(cc.number);
      $ccExpiry.sendkeys(cc.expiry);
      $ccCVV.sendkeys(cc.cvv);
    }

    beforeEach(function(done){
      launch();
      addAllCC();
      spyCalled();

      setTimeout(function(){
        data = frameDiscreet.getFormData($('.modal form'), true);
        done();
      }, 0);
    });

    it("should return description", function(){
      expect(data.description).toBe(coOptions.description);
    });

    it("should return amount", function(){
      expect(data.amount).toBe(coOptions.amount);
    });

    it("should return currency", function(){
      expect(data.currency).toBe('INR');
    });

    it("should return contact", function(){
      expect(data.contact).toBe(coOptions.prefill.contact);
    });

    it("should return email", function(){
      expect(data.email).toBe(coOptions.prefill.email);
    });

    it("should return name", function(){
      expect(data['card[name]']).toBe(coOptions.prefill.name);
    });

    it("should return card number", function(){
      expect(data['card[number]']).toBe(cc.number);
    });

    it("should return card expiry month", function(){
      expect(data['card[expiry_month]']).toBe(cc.expiry_month);
    });

    it("should return card expiry year", function(){
      expect(data['card[expiry_year]']).toBe(cc.expiry_year);
    });

    it("should return card cvv", function(){
      expect(data['card[cvv]']).toBe(cc.cvv);
    });

    it("should not return bank", function(){
      expect(data.bank).toBeUndefined();
    });
  })
});


describe("Razorpay open netbanking page", function(){
  var co;
  var $email, $contact;

  beforeEach(function(){
    // For opening the modal
    handleMessage({options: coOptions});
    co = frameDiscreet.rzp;

    // using Razorpay.$ due to some bug in phantomjs
    // The bug turns up when there are two jquery involved
    $('.tabs li[data-target="tab-netbanking"]').click();
  });

  afterEach(function(){
    frameDiscreet.hide();
    $('.container').remove();
  })

  it("should show netbanking form on clicking", function(){
    expect($('#tab-netbanking').hasClass('active')).toBe(true);
    expect($('#tab-card').hasClass('active')).toBe(false);
  });

  describe("and submit method", function(){
    var spyCalled;
    var spyNotCalled;
    var $email, $contact;
    var $nbLink, $nbBank;
    var $nbSubmit;

    beforeEach(function(){
      spyCalled    = jasmine.createSpy();
      spyNotCalled = jasmine.createSpy();
    });

    function launch(){
      $email       = $('.input[name="email"]');
      $contact     = $('.input[name="contact"]');
      $nbBank      = $('select[name="bank"]');
      $nbSubmit    = $('.submit');
    }

    afterEach(function(){
      $nbSubmit.click();
      expect(spyCalled).toHaveBeenCalled();
      expect(spyNotCalled).not.toHaveBeenCalled();
      $('.container').remove();
    })

    it("should submit with all details in place", function(){
      launch();
      $nbBank.val('SBIN');

      spyOn(co, 'submit').and.callFake(function(){
        spyCalled();
      });
    });

    it("should not submit without bank selected", function(){
      launch();
      spyCalled();
      spyOn(co, 'submit').and.callFake(function(){
        spyNotCalled();
      });
    });

    it("should not submit without email", function(){
      launch();
      $nbBank.val('SBIN');
      $email.val('');

      spyCalled();
      spyOn(co, 'submit').and.callFake(function(){
        spyNotCalled();
      });
    });

    it("should not submit without contact", function(){
      launch();
      $nbBank.val('SBIN');
      $contact.val('');

      spyCalled();
      spyOn(co, 'submit').and.callFake(function(){
        spyNotCalled();
      });
    });
  });

  describe("and getFormData method", function(){
    var data;

    beforeEach(function(){
      var $nbBank = $('select[name="bank"]');
      $nbBank.val('SBIN');
      data = frameDiscreet.getFormData($('.modal form'), true);
    });

    it("should return description", function(){
      expect(data.description).toBe(coOptions.description);
    });

    it("should return amount", function(){
      expect(data.amount).toBe(coOptions.amount);
    });

    it("should return currency", function(){
      expect(data.currency).toBe('INR');
    });

    it("should return contact", function(){
      expect(data.contact).toBe(coOptions.prefill.contact);
    });

    it("should return email", function(){
      expect(data.email).toBe(coOptions.prefill.email);
    });

    it("should not return name", function(){
      expect(data['card[name]']).toBeUndefined();
    });

    it("should not return card number", function(){
      expect(data['card[number]']).toBeUndefined();
    });

    it("should not return card expiry month", function(){
      expect(data['card[expiry_month]']).toBeUndefined();
    });

    it("should not return card expiry year", function(){
      expect(data['card[expiry_year]']).toBeUndefined();
    });

    it("should not return card cvv", function(){
      expect(data['card[cvv]']).toBeUndefined();
    });

    it("should return bank", function(){
      expect(data.bank).toBe('SBIN');
    });
  })
});
