var coOptions = {
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
}

describe("Checkout init", function(){
  var co;
  var custom = $.extend({}, coOptions);
  custom.unwanted = 'fake';

  beforeEach(function(){
    co = new Checkout(coOptions);
    spyOn(co.methods, 'validateOptions').and.callThrough();
    spyOn(co, 'configureRzpInstance').and.callThrough();
    co.init(coOptions);
  });

  it("should set key", function(){
    expect(co.options.key).toBe(coOptions.key);
  });

  it("should set amount", function(){
    expect(co.options.amount).toBe(coOptions.amount);
  });

  it("should set default currency", function(){
    expect(co.options.currency).toBe('INR');
  });

  it("should set name of merchant", function(){
    expect(co.options.name).toBe(coOptions.name);
  });

  it("should set description", function(){
    expect(co.options.description).toBe(coOptions.description);
  });

  it("should set image", function(){
    expect(co.options.image).toBe(coOptions.image);
  });

  it("should set udf fields", function(){
    for(var i in co.options.udf){
      expect(co.options.udf[i]).toBe(coOptions.udf[i]);
    }
    expect(Object.keys(co.options.udf).length).toBe(Object.keys(coOptions.udf).length)
  });

  it("should set prefill options", function(){
    expect(co.options.prefill.name).toBe(coOptions.prefill.name);
    expect(co.options.prefill.contact).toBe(coOptions.prefill.contact);
    expect(co.options.prefill.email).toBe(coOptions.prefill.email);
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
    co = new Checkout(coOptions);
    customOptions = $.extend({}, coOptions);
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
    })
  })

  describe("should return error", function(){
    afterEach(function(){
      var val = co.methods.validateOptions(customOptions);
      expect(val.error).toBe(false);
    })

    it("when handler is not defined", function(){
      delete customOptions.handler;
    })
  });

});
