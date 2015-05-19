var options = {
  'key': 'key_id',
  'amount': '40000'
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
  'netbanking': true,
  'handler': function (transaction) {
    alert("You have successfully purchased " + options.description);
  },
  'oncancel': function(){},
  'onhidden': function(){},
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
    expect(Object.keys(co.options.notes).length).toBe(Object.keys(optionsExtended.notes).length)
    expect(co.options.prefill.name).toBe(optionsExtended.prefill.name);
    expect(co.options.prefill.contact).toBe(optionsExtended.prefill.contact);
    expect(co.options.prefill.email).toBe(optionsExtended.prefill.email);
    for(var i in co.options.notes){
      expect(co.options.notes[i]).toBe(optionsExtended.notes[i]);
    }
  });

  it("should not set unknown option", function(){
    expect(co.options.unwanted).toBeUndefined();
  });

  it("should set handler as null if not passed", function(){
    var local = $.extend({}, custom);
    delete local.handler;
    var co = new Razorpay(local);
    expect(co.options.handler).toBe(null);
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

describe("init options validation", function(){
  var init_options, errors, field;

  describe("should throw error if", function(){
    beforeEach(function(){
       init_options = jQuery.extend(true, {}, options);
    });
    afterEach(function(){
      expect(errors.length).toBe(1);
      expect(errors[0].field).toBe(field);
    });

    it("no options passed", function(){
      field = '';
      var init_options;
      errors = Razorpay.prototype.validateOptions(init_options, false);
    });
    it("invalid options passed", function(){
      field = '';
      init_options = 'options';
      errors = Razorpay.prototype.validateOptions(init_options, false);
    });
    it("no key specified", function(){
      field = 'key';
      delete init_options.key;
      errors = Razorpay.prototype.validateOptions(init_options, false);
    });
    it("blank key specified", function(){
      field = 'key';
      init_options.key = '';
      errors = Razorpay.prototype.validateOptions(init_options, false);
    });
    it("amount is invalid", function(){
      field = 'amount';
      init_options.amount = 'amount';
      errors = Razorpay.prototype.validateOptions(init_options, false);
    });
  });
})

describe("getNetbankingList should", function(){
  it("set rzp.netbankingList and call back", function(){
    var nblist = [];
    var spyCalled = jasmine.createSpy();
    rzp = new Razorpay(options);
    spyOn(Razorpay.prototype.$, 'ajax').and.callFake(function(options){
      options.success(nblist);
    });
    rzp.getNetbankingList(spyCalled);
    expect(rzp.netbankingList).toBe(nblist);
    expect(spyCalled).toHaveBeenCalled();
  })
})
