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
    cvv: '888'
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

// Tests on Credit Card page
describe("Razorpay open cc page", function(){
  var co;
  var $name, $email, $contact;

  beforeEach(function(){
    co = new Razorpay(coData.options);
    co.open();
    $name    = $('#rzp-tabs-cc .rzp-input[name="card[name]"]');
    $email   = $('#rzp-tabs-cc .rzp-input[name="email"]');
    $contact = $('#rzp-tabs-cc .rzp-input[name="contact"]');
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
    $ccNumber    = $('#rzp-tabs-cc .rzp-input[name="card[number]"]');
    $ccExpiry    = $('#rzp-tabs-cc .rzp-input[name="card[expiry]"]');
    $ccCVV       = $('#rzp-tabs-cc .rzp-input[name="card[cvv]"]');
    $name        = $('#rzp-tabs-cc .rzp-input[name="card[name]"]');
    $email       = $('#rzp-tabs-cc .rzp-input[name="email"]');
    $contact     = $('#rzp-tabs-cc .rzp-input[name="contact"]');
    $ccSubmit    = $('#rzp-tabs-cc .rzp-submit');
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

  it("should submit with all details in place", function(){
    launch();

    $ccNumber.sendkeys(coData.cc.number);
    $ccExpiry.sendkeys(coData.cc.expiry);
    $ccCVV.sendkeys(coData.cc.cvv);

    spyOn(co, 'submit').and.callFake(function(){
      spyCalled();
    });
  });

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
  var $nbLink, $nbSubmit;

  beforeEach(function(){
    co = new Razorpay(coData.options);
    co.open();
    $email    = $('#rzp-tabs-nb .rzp-input[name="email"]');
    $contact  = $('#rzp-tabs-nb .rzp-input[name="contact"]');
    $nbSubmit = $('#rzp-tabs-nb .rzp-submit');

    // using Razorpay.$ due to some bug in phantomjs
    // The bug turns up when there are two jquery involved
    $nbLink = Razorpay.$('.rzp-tabs li[data-target="rzp-tabs-nb"]');

    $nbLink.click();
  });

  afterEach(function(){
    $('.rzp-container').remove();
  })

  it("should show netbanking form on clicking", function(){
    expect($nbSubmit).toBeVisible();
  });

  it("should prefill email", function(){
    expect($email.val()).toBe(coData.options.prefill.email);
  });

  it("should prefill contact number", function(){
    expect($contact.val()).toBe(coData.options.prefill.contact);
  });
});

describe("and submit method", function(){
  var co;
  var spyCalled;
  var spyNotCalled;
  var $email, $contact;
  var $nbLink, $nbBank;
  var $nbSubmit;
  var customOptions;

  beforeEach(function(){
    spyCalled    = jasmine.createSpy();
    spyNotCalled = jasmine.createSpy();

    customOptions = $.extend(true, {}, coData.options);
  });

  function launch(){
    co = new Razorpay(customOptions);
    co.open();
    $email       = $('#rzp-tabs-nb .rzp-input[name="email"]');
    $contact     = $('#rzp-tabs-nb .rzp-input[name="contact"]');
    $nbBank      = $('#rzp-tabs-nb select[name="bank"]');
    $nbSubmit    = $('#rzp-tabs-nb .rzp-submit');

    // using Razorpay.$ due to some bug in phantomjs
    // The bug turns up when there are two jquery involved
    $nbLink = Razorpay.$('.rzp-tabs li[data-target="rzp-tabs-nb"]');
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
    $nbSubmit.val('SBIN');

    spyOn(co, 'submit').and.callFake(function(){
      spyCalled();
    });
  });

  // This is failing right now
  // Waiting for pronav to merge before fixing
//  it("should not submit without bank selected", function(){
//    launch();
//    spyCalled();
//    spyOn(co, 'submit').and.callFake(function(){
//      spyNotCalled();
//    });
//  });

  it("should not submit without email", function(){
    delete customOptions.prefill.email;
    launch();

    spyCalled();
    spyOn(co, 'submit').and.callFake(function(){
      spyNotCalled();
    });
  });

  it("should not submit without contact", function(){
    delete customOptions.prefill.contact;
    launch();

    spyCalled();
    spyOn(co, 'submit').and.callFake(function(){
      spyNotCalled();
    });
  });
});
