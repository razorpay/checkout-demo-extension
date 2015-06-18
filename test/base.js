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
  protocol: 'http',
  hostname: 'api.razorpay.dev'
}
// var $ = Razorpay.prototype.$;

describe("new Razorpay", function(){
  var rzp;

  it("without options should fail", function(){
    expect(function(){new Razorpay()}).toThrow();
  });

  it("should create Razorpay instance", function(){
    rzp = new Razorpay(options);
    expect(rzp).toBeDefined();
  });
})

describe("configure method", function(){
  var co;
  var custom = $.extend(true, {}, optionsExtended);
  custom.unwanted = 'fake';

  beforeEach(function(){
    co = new Razorpay(custom);
  });

  it("should override default options", function(){
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
    for(var i in co.options.notes){
      expect(co.options.notes[i]).toBe(optionsExtended.notes[i]);
    }
    expect(co.options.handler).toBe(optionsExtended.handler);
  });

  it("should not set unknown option", function(){
    expect(co.options.unwanted).toBeUndefined();
  });

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

describe("init options validation", function(){
  var init_options, field;

  beforeEach(function(){
    init_options = jQuery.extend(true, {}, options);
  });

  describe("should throw error if", function(){
    afterEach(function(){
      var errors = Razorpay.prototype.validateOptions(init_options, false);
      expect(errors.length).toBe(1);
      expect(errors[0].field).toBe(field);
    });

    it("no options passed", function(){
      field = '';
      init_options = '';
    });

    it("invalid options passed", function(){
      field = '';
      init_options = 'options';
    });

    it("no key specified", function(){
      field = 'key';
      delete init_options.key;
    });

    it("blank key specified", function(){
      field = 'key';
      init_options.key = '';
    });

    it("when notes has more than 15 fields", function(){
      init_options.notes = {};
      for(var i = 0; i < 16; i++){
        init_options.notes['note-' + i] = i;
      }
      field = 'notes';
    });
  });

  describe("should not return error", function(){
    afterEach(function(){
      var errors = Razorpay.prototype.validateOptions(init_options, false);
      expect(errors.length).toBe(0);
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