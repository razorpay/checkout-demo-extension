var options = {
  'key': 'key_id',
  'amount': '40000'
}

var optionsExtended = {
  'key': 'key_id',
  'amount': '5100',
  'currency': 'INR',
  'display_currency': 'INR',
  'display_amount': '1000',
  'name': 'Daft Punk',
  'description': 'Tron Legacy',
  'image': 'https://i.imgur.com/3g7nmJC.png',
  'netbanking': true,
  'signature': 'random',
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
