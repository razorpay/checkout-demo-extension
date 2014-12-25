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
      'name': 'Harshil Mathur',
      'email': 'harshil@razorpay.com',
      'contact': '9999999999'
    },
    udf: {
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
  var custom = $.extend({}, coData.options);
  custom.unwanted = 'fake';

  beforeEach(function(){
    co = new Checkout(coData.options);
    spyOn(co.methods, 'validateOptions').and.callThrough();
    spyOn(co, 'configureRzpInstance').and.callThrough();
    co.init(coData.options);
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

  it("should set udf fields", function(){
    for(var i in co.options.udf){
      expect(co.options.udf[i]).toBe(coData.options.udf[i]);
    }
    expect(Object.keys(co.options.udf).length).toBe(Object.keys(coData.options.udf).length)
  });

  it("should set prefill options", function(){
    expect(co.options.prefill.name).toBe(coData.options.prefill.name);
    expect(co.options.prefill.contact).toBe(coData.options.prefill.contact);
    expect(co.options.prefill.email).toBe(coData.options.prefill.email);
  });

  it("should not set unknown option", function(){
    expect(co.options.unwanted).toBeUndefined();
  });

  it("should call validateOptions", function(){
    expect(co.methods.validateOptions).toHaveBeenCalled();
  });

  it("should call rzp.configure", function(){
    expect(co.configureRzpInstance).toHaveBeenCalled();
  })
});

describe("Checkout validateOptions method", function(){
  var customOptions;
  var field;

  beforeEach(function(){
    co = new Checkout(coData.options);
    customOptions = $.extend({}, coData.options);
  });

  describe("should return error", function(){
    afterEach(function(){
      var val = co.methods.validateOptions(customOptions);
      expect(val.error.field).toBe(field);
    })

    it("when amount not specified", function(){
      delete customOptions.amount;
      field = 'amount';
    });

    it("when amount is less than 0", function(){
      customOptions.amount = -10;
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

    it("when udf has more than 15 fields", function(){
      delete customOptions.key;
      field = 'key';
    });

    it("when handler is not a function", function(){
      customOptions.handler = 'string';
      field = 'handler';
    });
  })

  describe("should not return error", function(){
    afterEach(function(){
      var val = co.methods.validateOptions(customOptions);
      expect(val.error).toBe(false);
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

    it("when udf is not defined", function(){
      delete customOptions.udf;
    });

    it("when name is not defined", function(){
      delete customOptions.name;
    });
  });

});

describe("Razorpay open method", function(){
  var co;

  beforeEach(function(){
    co = new Checkout(coData.options);
    co.open();

  });

  afterEach(function(){
    $('.rzp-container').remove();
  });

  it("should load modal", function(){
    expect($('.rzp-modal')).toBeVisible();
  });

  it("should prefill name", function(){
    var value = $('.rzp-input[name="card[name]"]').val();
    expect(value).toBe(coData.options.prefill.name);
  });

  it("should prefill email", function(){
    var value = $('.rzp-input[name="email"]').val();
    expect(value).toBe(coData.options.prefill.email);
  });

  it("should prefill contact number", function(){
    var value = $('.rzp-input[name="contact"]').val();
    expect(value).toBe(coData.options.prefill.contact);
  });

  describe("and submit method", function(){
    var spyCalled;
    var spyNotCalled;
    var $ccNumber;
    var $ccExpiry;
    var $ccCVV;

    beforeEach(function(){
      $ccNumber = $('.rzp-input[name="card[number]"]');
      $ccExpiry = $('.rzp-input[name="card[expiry]"]');
      $ccCVV = $('.rzp-input[name="card[cvv]"]');
      spyCalled = jasmine.createSpy();
      spyNotCalled = jasmine.createSpy();
    });

    afterEach(function(done){
      // sendkeys needs little delay
      setTimeout(function(){
        $('.rzp-modal #rzp-tabs-cc .rzp-submit').click();
        expect(spyCalled).toHaveBeenCalled();
        expect(spyNotCalled).not.toHaveBeenCalled();
        done();
      }, 10);
    })

    it("should submit form with all details in place", function(){
      $ccNumber.sendkeys(coData.cc.number);
      $ccExpiry.sendkeys(coData.cc.expiry);
      $ccCVV.sendkeys(coData.cc.cvv);

      spyOn(co, 'submit').and.callFake(function(){
        spyCalled();
      });
    });

    it("should not submit form without cc card", function(){
      $ccExpiry.sendkeys(coData.cc.expiry);
      $ccCVV.sendkeys(coData.cc.cvv);

      spyCalled();
      spyOn(co, 'submit').and.callFake(function(){
        spyNotCalled();
      });
    });

    it("should not submit form without cc expiry", function(){
      $ccNumber.sendkeys(coData.cc.number);
      $ccCVV.sendkeys(coData.cc.cvv);

      spyCalled();
      spyOn(co, 'submit').and.callFake(function(){
        spyNotCalled();
      });
    });

    it("should not submit form without cc cvv", function(){
      $ccCVV.val('').sendkeys('0');

      spyCalled();
      spyOn(co, 'submit').and.callFake(function(){
        spyNotCalled();
      });
    });
  })
})
