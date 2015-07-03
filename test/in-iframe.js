var discreet = Razorpay.prototype.discreet;
var orig_methods = window.payment_methods = {"version":1,"card":true,"netbanking":{"UTIB":"Axis Bank","BARB":"Bank of Baroda","SBIN":"State Bank of India"}};

function openCheckoutForm(options){
  jQuery('#container').remove();
  delete window.frameDiscreet.$el;
  delete window.frameDiscreet.modal;
  delete window.frameDiscreet.rzp;
  handleMessage({options: options});
}

var coOptions = {
  'key': 'key_id',
  'amount': '5100',
  'name': 'Daft Punk',
  'description': 'Tron Legacy',
  'image': 'https://i.imgur.com/3g7nmJC.png',
  'method': {
    'netbanking': true,
    'card': true
  },
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
  it("modal", function(){
    expect(Modal).toBeDefined();
  })
  it("smarty", function(){
    expect(Smarty).toBeDefined();
  })
  it("doT", function(){
    expect(doT).toBeDefined();
  })
  it("modal template", function(){
    expect(templates.modal).toBeDefined();
  })
})

describe("init options.method: ", function(){
  var opts = JSON.parse(JSON.stringify(coOptions));
  var disableTab;

  it("hide tabs and card fields if method.card == false", function(){
    disableTab = 'card';
  })
  it("hide tabs and netbanking fields if method.netbanking == false", function(){
    disableTab = 'netbanking';
  })

  afterEach(function(){
    opts.method = {};
    opts.method[disableTab] = false;
    openCheckoutForm(opts);
    expect(jQuery('#tab-'+disableTab).length).toBe(0);
    expect(jQuery('.tab-content:visible').length).toBe(1);
  })
})
//describe("message listener should", function(){
//  it("throw error on erroneous options", function(done){
//    var spyCalled = jasmine.createSpy();
//    var origRazorpay = Razorpay;
//    var custom_options = jQuery.extend(true, {}, coOptions);
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


describe("init options.method", function(){
  var opts;
  
  beforeEach(function(){
    opts = jQuery.extend(true, {}, coOptions);
    delete opts.method;
  })

  it("should enable both netbanking and card by default and show card initially", function(){
    openCheckoutForm(opts);
    expect(jQuery('#tabs')).toBeVisible();
    expect(jQuery('#tabs li').length).toBe(2);
    expect(jQuery('#tabs li.active').attr('data-target')).toBe('tab-card');
    expect(jQuery('#tab-card')).toBeVisible();
  });

  describe("", function(){
    var hide, show;

    beforeEach(function(){
      window.payment_methods = jQuery.extend(true, {}, orig_methods);
    })

    afterEach(function(){
      openCheckoutForm(opts);
      expect(jQuery('#tabs').hasClass('tabs-1')).toBe(true);
      expect(jQuery('#tab-' + hide)).not.toBeVisible();
      expect(jQuery('#tab-' + show)).toBeVisible();
    })

    it("should hide card if payment_methods.card=false", function(){
      window.payment_methods.card = false;
      hide = 'card';
      show = 'netbanking';
    });

    it("should hide netbanking if payment_methods.netbanking=false", function(){
      window.payment_methods.netbanking = false;
      hide = 'netbanking';
      show = 'card';
    });
  })

  afterEach(function(){
    window.payment_methods = orig_methods;
  })
})

// Tests on Credit Card page
describe("Razorpay open cc page", function(){
  var $name, $email, $contact;

  beforeEach(function(){
    openCheckoutForm(coOptions);
    $name    = jQuery('.input[name="card[name]"]');
    $email   = jQuery('.input[name="email"]');
    $contact = jQuery('.input[name="contact"]');
  });

  afterEach(function(){
    frameDiscreet.hide();
  });

  it("should load modal", function(){
    expect(jQuery('.modal')).toBeVisible();
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
  var $ccSubmit;
  var customOptions;

  beforeEach(function(){
    spyCalled    = jasmine.createSpy();
    spyNotCalled = jasmine.createSpy();

    customOptions = jQuery.extend(true, {}, coOptions);
  });

  function launch(){
    // For opening the modal
    openCheckoutForm(customOptions);
    co = frameDiscreet.rzp;

    $ccNumber    = jQuery('.input[name="card[number]"]');
    $ccExpiry    = jQuery('.input[name="card[expiry]"]');
    $ccCVV       = jQuery('.input[name="card[cvv]"]');
    $name        = jQuery('.input[name="card[name]"]');
    $email       = jQuery('.input[name="email"]');
    $contact     = jQuery('.input[name="contact"]');
    $ccSubmit    = jQuery('#submit');
  }

  function addAllCC(){
    $ccNumber.sendkeys(cc.number);
    $ccExpiry.sendkeys(cc.expiry);
    $ccCVV.sendkeys(cc.cvv);
  }

  afterEach(function(done){
    // sendkeys needs little delay
    setTimeout(function(){
      sendclick($ccSubmit[0]);
      expect(spyCalled).toHaveBeenCalled();
      expect(spyNotCalled).not.toHaveBeenCalled();
      frameDiscreet.hide();

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

      spyOn(Razorpay.payment, 'authorize').and.callFake(function(){
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
    spyOn(Razorpay.payment, 'authorize').and.callFake(function(){
      spyNotCalled();
    });
  });

  it("should not submit without cc expiry", function(){
    launch();
    $ccNumber.sendkeys(cc.number);
    $ccCVV.sendkeys(cc.cvv);

    spyCalled();
    spyOn(Razorpay.payment, 'authorize').and.callFake(function(){
      spyNotCalled();
    });
  });

  it("should not submit without cc cvv", function(){
    launch();
    $ccCVV.val('').sendkeys('0');

    spyCalled();
    spyOn(Razorpay.payment, 'authorize').and.callFake(function(){
      spyNotCalled();
    });
  });

  it("should not submit without name", function(){
    customOptions.prefill.name = '';
    launch();
    addAllCC();

    spyCalled();
    spyOn(Razorpay.payment, 'authorize').and.callFake(function(){
      spyNotCalled();
    });
  });

  it("should not submit without email", function(){
    customOptions.prefill.email = '';
    launch();
    addAllCC();

    spyCalled();
    spyOn(Razorpay.payment, 'authorize').and.callFake(function(){
      spyNotCalled();
    });
  });

  it("should not submit without contact", function(){
    customOptions.prefill.contact = '';
    launch();
    addAllCC();

    spyCalled();
    spyOn(Razorpay.payment, 'authorize').and.callFake(function(){
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
        data = frameDiscreet.getFormData(jQuery('.modal form'), true);
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
    openCheckoutForm(coOptions);
    co = frameDiscreet.rzp;
    sendclick(jQuery('#tabs li[data-target="tab-netbanking"]')[0]);
  });

  afterEach(function(){
    frameDiscreet.hide();
    jQuery('#container').remove();
  })

  it("should show netbanking form on clicking", function(){
    expect(jQuery('#tab-netbanking').hasClass('active')).toBe(true);
    expect(jQuery('#tab-card').hasClass('active')).toBe(false);
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
      $email       = jQuery('.input[name="email"]');
      $contact     = jQuery('.input[name="contact"]');
      $nbBank      = jQuery('select[name="bank"]');
      $nbSubmit    = jQuery('#submit');
    }

    afterEach(function(){
      sendclick($nbSubmit[0]);
      expect(spyCalled).toHaveBeenCalled();
      expect(spyNotCalled).not.toHaveBeenCalled();
      jQuery('#container').remove();
    })

    it("should submit with all details in place", function(){
      launch();
      $nbBank.val('SBIN');

      spyOn(Razorpay.payment, 'authorize').and.callFake(function(){
        spyCalled();
      });
    });

    it("should not submit without bank selected", function(){
      launch();
      spyCalled();
      spyOn(Razorpay.payment, 'authorize').and.callFake(function(){
        spyNotCalled();
      });
    });

    it("should not submit without email", function(){
      launch();
      $nbBank.val('SBIN');
      $email.val('');

      spyCalled();
      spyOn(Razorpay.payment, 'authorize').and.callFake(function(){
        spyNotCalled();
      });
    });

    it("should not submit without contact", function(){
      launch();
      $nbBank.val('SBIN');
      $contact.val('');

      spyCalled();
      spyOn(Razorpay.payment, 'authorize').and.callFake(function(){
        spyNotCalled();
      });
    });
  });

  describe("and getFormData method", function(){
    var data;

    beforeEach(function(){
      var $nbBank = jQuery('select[name="bank"]');
      $nbBank.val('SBIN');
      data = frameDiscreet.getFormData();
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
