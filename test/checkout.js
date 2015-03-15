var coData = {
  options: {
    'key': 'key_id',
    'amount': '5100',
    'name': 'Daft Punk',
    'description': 'Tron Legacy',
    'image': 'https://i.imgur.com/3g7nmJC.png',
    'handler': function (transaction) {
      alert("You have successfully purchased " + options.description);
    },
    'netbanking': 'true',
    'prefill': {
      'name': 'Shashank Mehta',
      'email': 'sm@razorpay.com',
      'contact': '9999999999'
    },
    notes: {
      'address': 'Hello World'
    },
    protocol: 'http',
    hostname: 'api.razorpay.dev'
  },

  cc: {
    number: '4012001037141112',
    expiry: '05 / 19',
    cvv: '888',
    expiry_month: '05',
    expiry_year: '19'
  }
}

describe("Checkout init", function(){
  var co;
  var custom = $.extend(true, {}, coData.options);
  custom.unwanted = 'fake';

  beforeEach(function(){
    co = new Razorpay(custom);
  });

  it("should set key", function(){
    expect(co.options.key).toBe(coData.options.key);
  });

  it("should set amount", function(){
    expect(co.options.amount).toBe(coData.options.amount);
  });

  it("should set default currency", function(){
    expect(co.options.currency).toBe('INR');
  });

  it("should set name of merchant", function(){
    expect(co.options.name).toBe(coData.options.name);
  });

  it("should set description", function(){
    expect(co.options.description).toBe(coData.options.description);
  });

  it("should set image", function(){
    expect(co.options.image).toBe(coData.options.image);
  });

  it("should set notes fields", function(){
    for(var i in co.options.notes){
      expect(co.options.notes[i]).toBe(coData.options.notes[i]);
    }
    expect(Object.keys(co.options.notes).length).toBe(Object.keys(coData.options.notes).length)
  });

  it("should set prefill options", function(){
    expect(co.options.prefill.name).toBe(coData.options.prefill.name);
    expect(co.options.prefill.contact).toBe(coData.options.prefill.contact);
    expect(co.options.prefill.email).toBe(coData.options.prefill.email);
  });

  it("should not set unknown option", function(){
    expect(co.options.unwanted).toBeUndefined();
  });

  it("should insert checkout styles into dom", function(){
    expect($('link[href*="checkout.css"]')[0]).toBeInDOM()
  });

  it("should set handler as empty string if not passed", function(){
    var local = $.extend({}, custom);
    delete local.handler;
    var co = new Razorpay(local);
    expect(co.options.handler).toBe('');
  })

  it("should set signature", function(){
    var local = $.extend({}, custom);
    local.signature = 'asdasd';
    var co = new Razorpay(local);
    expect(co.options.signature).toBe(local.signature);
  })

  it("should leave signature blank if not set", function(){
    expect(co.options.signature).toBe('');
  })
});

describe("Checkout validateOptions method", function(){
  var customOptions;
  var field;

  beforeEach(function(){
    co = new Razorpay(coData.options);
    customOptions = $.extend(true, {}, coData.options);
  });

  describe("should return error", function(){
    afterEach(function(){
      var errors = co.validateOptions(customOptions);
      expect(errors.length).toBe(1);
      expect(errors[0].field).toBe(field);
    })

    it("when amount not specified", function(){
      delete customOptions.amount;
      field = 'amount';
    });

    it("when amount is less than 0", function(){
      customOptions.amount = '-10';
      field = 'amount';
    });

    it("when amount is in decimal", function(){
      customOptions.amount = '10.10';
      field = 'amount';
    });

    it("when key is not defined", function(){
      delete customOptions.key;
      field = 'key';
    });

    it("when key is empty", function(){
      customOptions.key = "";
      field = 'key';
    });

    it("when notes has more than 15 fields", function(){
      customOptions.notes = {};
      for(var i = 0; i < 16; i++){
        customOptions.notes['note-' + i] = i;
      }
      field = 'notes';
    });

    it("when handler is not a function", function(){
      customOptions.handler = 'string';
      field = 'handler';
    });
  })

  describe("should not return error", function(){
    afterEach(function(){
      var errors = co.validateOptions(customOptions);
      expect(errors.length).toBe(0);
    });

    it("when handler is not defined", function(){
      delete customOptions.handler;
    });

    it("when description is not defined", function(){
      delete customOptions.description;
    });

    it("when image is not defined", function(){
      delete customOptions.image;
    });

    it("when notes is not defined", function(){
      delete customOptions.notes;
    });

    it("when name is not defined", function(){
      delete customOptions.name;
    });

    it("when amount is in string", function(){
      customOptions.amount = '1000';
    });

    it("when amount is in integer", function(){
      customOptions.amount = 1000;
    })
  });

});

// Modal functionality
describe("Razorpay modal", function(){
  var cancelSpy;
  var hiddenSpy;
  var co;
  beforeEach(function(){
    cancelSpy = jasmine.createSpy();
    hiddenSpy = jasmine.createSpy();
    var opts = $.extend(coData.options, {
      oncancel: cancelSpy,
      onhidden: hiddenSpy
    })
    co = new Razorpay(opts);
    co.open();
  });

  afterEach(function(){
    $('.rzp-container').remove();
  });

  it("should call cancel callback", function(){
    co.modal.hide()
    setTimeout(function(){
      expect(cancelSpy).toHaveBeenCalled();
    }, 100)
  });
});


// Tests on Credit Card page
describe("Razorpay open cc page", function(){
  var co;
  var $name, $email, $contact;

  beforeEach(function(){
    co = new Razorpay(coData.options);
    co.open();
    $name    = $('.rzp-input[name="card[name]"]');
    $email   = $('.rzp-input[name="email"]');
    $contact = $('.rzp-input[name="contact"]');
  });

  afterEach(function(){
    $('.rzp-container').remove();
  });

  it("should load modal", function(){
    expect($('.rzp-modal')).toBeVisible();
  });

  it("should prefill name", function(){
    expect($name.val()).toBe(coData.options.prefill.name);
  });

  it("should prefill email", function(){
    expect($email.val()).toBe(coData.options.prefill.email);
  });

  it("should prefill contact number", function(){
    expect($contact.val()).toBe(coData.options.prefill.contact);
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

    customOptions = $.extend(true, {}, coData.options);
  });

  function launch(){
    co = new Razorpay(customOptions);
    co.open();
    $ccNumber    = $('.rzp-input[name="card[number]"]');
    $ccExpiry    = $('.rzp-input[name="card[expiry]"]');
    $ccCVV       = $('.rzp-input[name="card[cvv]"]');
    $name        = $('.rzp-input[name="card[name]"]');
    $email       = $('.rzp-input[name="email"]');
    $contact     = $('.rzp-input[name="contact"]');
    $ccSubmit    = $('.rzp-submit');
  }

  function addAllCC(){
    $ccNumber.sendkeys(coData.cc.number);
    $ccExpiry.sendkeys(coData.cc.expiry);
    $ccCVV.sendkeys(coData.cc.cvv);
  }

  afterEach(function(done){
    // sendkeys needs little delay
    setTimeout(function(){
      $ccSubmit.click();
      expect(spyCalled).toHaveBeenCalled();
      expect(spyNotCalled).not.toHaveBeenCalled();
      $('.rzp-container').remove();
      done();
    }, 100);
  })

  describe("with all details in place", function(){
    var field;
    var value;

    afterEach(function(){
      $ccNumber.sendkeys(coData.cc.number);
      $ccExpiry.sendkeys(coData.cc.expiry);
      $ccCVV.sendkeys(coData.cc.cvv);

      spyOn(Razorpay.$, 'ajax').and.callFake(function(options){
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
        value = coData.cc.number;
      });

      it("should pass card[cvv]", function(){
        launch();
        field = 'card[cvv]';
        value = coData.cc.cvv;
      });

      it("should pass card[expiry_month]", function(){
        launch();
        field = 'card[expiry_month]';
        value = coData.cc.expiry_month;
      });

      it("should pass card[expiry_year]", function(){
        launch();
        field = 'card[expiry_year]';
        value = coData.cc.expiry_year;
      });

      it("should pass notes[address]", function(){
        launch();
        field = 'notes[address]';
        value = coData.options.notes.address;
      });
    })
  })

  it("should not submit without cc card", function(){
    launch();
    $ccExpiry.sendkeys(coData.cc.expiry);
    $ccCVV.sendkeys(coData.cc.cvv);

    spyCalled();
    spyOn(co, 'submit').and.callFake(function(){
      spyNotCalled();
    });
  });

  it("should not submit without cc expiry", function(){
    launch();
    $ccNumber.sendkeys(coData.cc.number);
    $ccCVV.sendkeys(coData.cc.cvv);

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

describe("Razorpay open netbanking page", function(){
  var co;
  var $email, $contact;

  beforeEach(function(){
    co = new Razorpay(coData.options);
    co.open();

    // using Razorpay.$ due to some bug in phantomjs
    // The bug turns up when there are two jquery involved
    Razorpay.$('.rzp-tabs li[data-target="rzp-tab-nb"]').click();
  });

  afterEach(function(){
    $('.rzp-container').remove();
  })

  it("should show netbanking form on clicking", function(){
    expect($('#rzp-tab-nb').hasClass('rzp-active')).toBe(true);
    expect($('#rzp-tab-cc').hasClass('rzp-active')).toBe(false);
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
      $email       = $('.rzp-input[name="email"]');
      $contact     = $('.rzp-input[name="contact"]');
      $nbBank      = $('select[name="bank"]');
      $nbSubmit    = $('.rzp-submit');
    }

    afterEach(function(){
      // sendkeys needs little delay
      $nbSubmit.click();
      expect(spyCalled).toHaveBeenCalled();
      expect(spyNotCalled).not.toHaveBeenCalled();
      $('.rzp-container').remove();
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
      data = discreet.getFormData($('.rzp-modal form'), true);
    });

    it("should return description", function(){
      expect(data.description).toBe(coData.options.description);
    });

    it("should return amount", function(){
      expect(data.amount).toBe(coData.options.amount);
    });

    it("should return currency", function(){
      expect(data.currency).toBe('INR');
    });

    it("should return contact", function(){
      expect(data.contact).toBe(coData.options.prefill.contact);
    });

    it("should return email", function(){
      expect(data.email).toBe(coData.options.prefill.email);
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

/**
 * While there are tests on submit method and fields,
 * those tests only test if submit can be called without those fields set by user.
 * The following tests test the function that extracts data from the form
 */
describe("Checkout getFormData", function(){
  var co, data;
  var $ccNumber, $ccExpiry, $ccCVV;

  function addAllCC(){
    $ccNumber.sendkeys(coData.cc.number);
    $ccExpiry.sendkeys(coData.cc.expiry);
    $ccCVV.sendkeys(coData.cc.cvv);
  }

  beforeEach(function(done){
    co = new Razorpay(coData.options);
    co.open();

    $ccNumber    = $('.rzp-input[name="card[number]"]');
    $ccExpiry    = $('.rzp-input[name="card[expiry]"]');
    $ccCVV       = $('.rzp-input[name="card[cvv]"]');

    addAllCC();

    setTimeout(function(){
      data = discreet.getFormData($('.rzp-modal form'), true);
      done();
    }, 100);
  });

  it("should return description", function(){
    expect(data.description).toBe(coData.options.description);
  });

  it("should return amount", function(){
    expect(data.amount).toBe(coData.options.amount);
  });

  it("should return currency", function(){
    expect(data.currency).toBe('INR');
  });

  it("should return contact", function(){
    expect(data.contact).toBe(coData.options.prefill.contact);
  });

  it("should return email", function(){
    expect(data.email).toBe(coData.options.prefill.email);
  });

  it("should return name", function(){
    expect(data['card[name]']).toBe(coData.options.prefill.name);
  });

  it("should return card number", function(){
    expect(data['card[number]']).toBe(coData.cc.number);
  });

  it("should return card expiry month", function(){
    expect(data['card[expiry_month]']).toBe(coData.cc.expiry_month);
  });

  it("should return card expiry year", function(){
    expect(data['card[expiry_year]']).toBe(coData.cc.expiry_year);
  });

  it("should return card cvv", function(){
    expect(data['card[cvv]']).toBe(coData.cc.cvv);
  });

  it("should not return bank", function(){
    expect(data.bank).toBeUndefined();
  });
})
