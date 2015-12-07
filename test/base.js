
var options = {
  'key': 'key_id',
  'amount': '40000',
  'name': 'Merchant Name'
}

var optionsExtended = {
  'key': 'key_id',
  'amount': '5100',
  'currency': 'INR',
  'display_currency': 'USD',
  'display_amount': '1000',
  'name': 'Daft Punk',
  'description': 'Tron Legacy',
  'image': 'https://i.imgur.com/3g7nmJC.png',
  'handler': function (transaction) {
    alert("You have successfully purchased " + options.description);
  },
  'prefill': {
    'name': 'Shashank Mehta',
    'email': 'sm@razorpay.com',
    'contact': '9999999999'
  },
  notes: {
    'address': 'Hello World'
  },
  method: {
    wallet: false
  },
  protocol: 'http',
  hostname: 'api.razorpay.dev'
}

describe("new Razorpay", function(){
  var rzp;

  it("without options should fail", function(){
    expect(function(){new Razorpay()}).toThrow();
  });

  it("should create Razorpay instance", function(){
    rzp = new Razorpay(options);
    expect(rzp instanceof Razorpay).toBe(true);
  });
})

describe('configure', function(){
  var def = Razorpay.defaults;

  afterEach(function(){
    Razorpay.defaults = def;
  })

  it('required fields', function(){
    expect(function(){
      Razorpay.configure()
    }).toThrow();

    expect(function(){
      Razorpay.configure({})
    }).not.toThrow();

    expect(function(){
      Razorpay.configure({key: ''})
    }).toThrow();

    expect(Razorpay.defaults.key).toBe('');
    expect(function(){
      Razorpay.configure({key: 'key_id'})
    }).not.toThrow();
    expect(Razorpay.defaults.key).toBe('key_id');

    Razorpay.configure({amount: 1000})
    expect(Razorpay.defaults.amount).toBe('1000');
    expect(Razorpay.defaults.key).toBe('key_id');
  })

  it('low amount', function(){
    expect(function(){
      Razorpay.configure({amount: 1})
    }).toThrow();
  })

  it('NaN amount', function(){
    expect(function(){
      Razorpay.configure({amount: 'qwer'})
    }).toThrow();
  })

  it('decimal amount', function(){
    expect(function(){
      Razorpay.configure({amount: 20.5})
    }).toThrow();
  })

  it('notes', function(){
    var notesObject = {};
    for(var i = 0; i < 20; i ++){
      notesObject[i] = i;
    }
    expect(function(){
      Razorpay.configure({notes: notesObject})
    }).toThrow();

    expect(function(){
      Razorpay.configure({notes: 2})
    }).toThrow();

    expect(function(){
      Razorpay.configure({notes: {a: 2}})
    }).not.toThrow();
  })

  it('display_currency', function(){
    expect(function(){
      Razorpay.configure({display_currency: 'YEN'})
    }).toThrow();

    expect(function(){
      Razorpay.configure({display_currency: 'USD'})
    }).not.toThrow();
  })

  it('display_amount', function(){
    expect(function(){
      Razorpay.configure({display_amount: ''})
    }).toThrow();

    expect(function(){
      Razorpay.configure({display_amount: '3'})
    }).not.toThrow();
  })
})

describe('new Razorpay', function(){
  it('should fail if required options are not present', function(){
    expect(function(){
      new Razorpay({key: '12'})
    }).toThrow();

    expect(function(){
      new Razorpay({amount: '122'})
    }).toThrow();

    expect(function(){
      new Razorpay({key: '12', amount: '122'})
    }).not.toThrow();
  })
})

describe('Razorpay new instance', function(){
  var co;
  var custom = jQuery.extend(true, {}, optionsExtended);
  custom.unwanted = 'fake';

  beforeEach(function(){
    co = new Razorpay(custom);
  });

  it('should override default options', function(){
    expect(co.options.key).toBe(optionsExtended.key);
    expect(co.options.amount).toBe(optionsExtended.amount);
    expect(co.options.currency).toBe(optionsExtended.currency);
    expect(co.options.name).toBe(optionsExtended.name);
    expect(co.options.description).toBe(optionsExtended.description);
    expect(co.options.image).toBe(optionsExtended.image);
    expect(Object.keys(co.options.notes).length).toBe(Object.keys(optionsExtended.notes).length);
    expect(co.options.prefill.name).toBe(optionsExtended.prefill.name);
    expect(co.options.prefill.contact).toBe(optionsExtended.prefill.contact);
    expect(co.options.prefill.email).toBe(optionsExtended.prefill.email);
    expect(co.options.method.wallet).toBe(optionsExtended.method.wallet);
    for(var i in co.options.notes){
      expect(co.options.notes[i]).toBe(optionsExtended.notes[i]);
    }
    expect(co.options.handler).toBe(optionsExtended.handler);
  });

  it('should not set unknown option', function(){
    expect(co.options.unwanted).toBeUndefined();
  });

  it("should convert types", function(){
    var local = jQuery.extend({}, custom);
    local.amount = 1000;
    var co = new Razorpay(local);
    expect(co.options.amount).toBe(String(local.amount));
  });

  it("should set signature", function(){
    var local = jQuery.extend({}, custom);
    local.signature = 'asdasd';
    var co = new Razorpay(local);
    expect(co.options.signature).toBe(local.signature);
  })

  it("should leave signature blank if not set", function(){
    expect(co.options.signature).toBe('');
  })
});

describe("init options validation", function(){
  var init_options, field;

  beforeEach(function(){
    init_options = jQuery.extend(true, {}, options);
  });

  describe("should throw error if", function(){
    afterEach(function(){
      try{
        base_validateOptions(init_options);
        expect(true).toBe(false); // shouldn't reach here
      } catch(e){
        expect(e.message.indexOf(field) > 0);
      }
    });

    it('no key specified', function(){
      field = 'key';
      delete init_options.key;
    });

    it('blank key specified', function(){
      field = 'key';
      init_options.key = '';
    });

    it('when notes has more than 15 fields', function(){
      init_options.notes = {};
      for(var i = 0; i < 16; i++){
        init_options.notes['note-' + i] = i;
      }
      field = 'notes';
    });

    it('invalid amount', function(){
      field = 'amount';
      init_options.amount = 99;
    })
  });

  describe("should not return error", function(){
    afterEach(function(){
      expect(function(){validateOverrides(init_options, false)}).not.toThrow();
    });

    it("when handler is not defined", function(){
      delete init_options.handler;
    });

    it("when description is not defined", function(){
      delete init_options.description;
    });

    it("when image is not defined", function(){
      delete init_options.image;
    });

    it("when notes is not defined", function(){
      delete init_options.notes;
    });

    it("when amount is in string", function(){
      init_options.amount = '1000';
    });

    it("when amount is in integer", function(){
      init_options.amount = 1000;
    })
  });
})

describe("nextRequestRedirect", function(){
  it("should post form with all fields", function(){
    var nextRequestData = {
      url: 'someurl',
      method: 'post',
      content: {
        field1: 'val1',
        field2: 'val2'
      }
    };

    var spy = jasmine.createSpy();

    spyOn(HTMLFormElement.prototype, 'submit').and.callFake(function(){
      expect(jQuery(this).serialize()).toBe('field1=val1&field2=val2');
      this.parentNode.removeChild(this); // clean up
      spy();
    });

    discreet.nextRequestRedirect(nextRequestData);
  })
})