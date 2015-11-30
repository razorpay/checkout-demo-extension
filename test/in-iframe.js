var orig_methods = window.payment_methods = {
  "card": true,
  "netbanking": {"HDFC":"HDFC Bank", "UTIB":"Axis Bank","BARB":"Bank of Baroda","SBIN":"State Bank of India"},
  "wallet": {
    "paytm": true
  }
};

function expectVisibleTab(tab){
  return function(){
    expect(jQuery('#tab-' + tab)).toBeVisible();
    expect(jQuery('#method-'+tab+'-tab').hasClass('active')).toBe(true);
  }
}

function openCheckoutForm(options, data){
  jQuery('#container').remove();
  _$el = _modal = null;
  handleMessage({
    event: 'open',
    options: options,
    data: data
  });
}

var coOptions = {
  'key': 'key_id',
  'amount': '5100',
  'name': 'Daft Punk',
  'description': 'Tron Legacy',
  'method': {
    'netbanking': true,
    'card': true,
    'wallet': true
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
  it("modal template", function(){
    expect(templates.modal).toBeDefined();
  })
})

describe("init options.method: ", function(){
  var opts, disableTab;

  it("hide netbanking if method.netbanking == false", function(){
    disableTab = 'netbanking';
  })
  it("hide card if method.card == false", function(){
    disableTab = 'card';
  })

  beforeEach(function(){
    opts = JSON.parse(JSON.stringify(coOptions));
  })

  afterEach(function(){
    opts.method[disableTab] = false;
    openCheckoutForm(opts);
    expect(jQuery('.tab-content').length).toBe(2);
    expect(jQuery('#tab-'+disableTab).length).toBe(0);
  })
})

describe("nextRequestRedirect", function(){
  it("should postMessage data to parent if inside iframe", function(){
    var parent = window.parent;
    window.parent = {postMessage: jQuery.noop};

    var nextRequestData = {};
    var spy = jasmine.createSpy();

    spyOn(Razorpay, 'sendMessage').and.callFake(function(msg){
      if(msg.event == 'redirect' && msg.data == nextRequestData)
        spy();
    })

    discreet.nextRequestRedirect(nextRequestData);
    window.parent = parent;
  })
})

describe("payment authorization", function(){
  var opts;

  beforeEach(function(){
    opts = jQuery.extend(true, {}, coOptions);
  })

  describe("error handler should", function(){
    var response = {error: {}};

    beforeEach(function(){
      openCheckoutForm(opts);
    })


    it("display default error discription", function(){
      frameDiscreet.errorHandler(response);
      expect(jQuery('#fd')).toBeVisible();
      expect(jQuery('#fd-t').html().length > 0).toBe(true);
    })

    it("display custom error description", function(){
      var str = 'hello error';
      response.error.description = str;
      frameDiscreet.errorHandler(response);
      expect(jQuery('#fd')).toBeVisible();
      expect(jQuery('#fd-t').html()).toBe(str);
    })

    it("focus related field and apply invalid", function(){
      var field_el = jQuery('input[name]:not([type=hidden]):eq(1)');
      response.error.field = field_el.prop('name');
      frameDiscreet.errorHandler(response);
      expect(jQuery('#fd')).toBeVisible();
      expect(field_el[0]).toBe(document.activeElement);
      expect(field_el.parent().hasClass('invalid')).toBe(true);
    })
  })

  it("success handler should hide form", function(){
    openCheckoutForm(opts);
    var spy = jasmine.createSpy();
    spyOn(frameDiscreet, 'hide').and.callFake(spy);
    frameDiscreet.successHandler();
    expect(spy).toHaveBeenCalled();
  })
})

describe("init options.method", function(){
  var opts, disable;

  beforeEach(function(){
    opts = jQuery.extend(true, {}, coOptions);
    delete opts.method;
    window.payment_methods = JSON.parse(JSON.stringify(orig_methods));
  })

  afterEach(function(){
    openCheckoutForm(opts);
    var countVisible = (3 - disable.length);
    expect(jQuery('#tabs').hasClass('tabs-' + countVisible)).toBe(true);
    expect(jQuery('#tabs li').length).toBe(countVisible);

    disable.forEach(function(meth){
      expect(jQuery('#tab-' + meth).length).toBe(0);
    })

    var active;
    for(var m2 in window.payment_methods){
      if(disable.indexOf(m2) < 0){
        expect(jQuery('#tab-' + m2)).toBeVisible();

        // depends on payment_methods order, should be same as order of visible tabs
        if(!active){
          active = jQuery('#tabs li.active').attr('data-target');
          expect(active).toBe('tab-' + m2);
        }
      }
    }

    window.payment_methods = orig_methods;
  })

  it("should enable all options by default and show card initially", function(){
    disable = [];
  });

  for(var m in window.payment_methods){
    // disable 1 tab, m is disabled one
    it("should hide " + m + " if specified false", (function(m){
      return function(){
        var disableVal = m == 'wallet' ? {} : false;
        window.payment_methods[m] = disableVal;
        disable = [m];
      }
    })(m))

    // disable 2 tabs, m is enabled one
    it("should hide " + m + " if specified false", (function(m){
      return function(){
        disable = Object.keys(window.payment_methods);
        disable.splice(disable.indexOf(m), 1);
        disable.forEach(function(disabledTab){
          var disableVal = disabledTab == 'wallet' ? {} : false;
          window.payment_methods[disabledTab] = disableVal;
        })
      }
    })(m))
  }
})

// Tests on Credit Card page
describe("Razorpay card tab", function(){
  var $name, $email, $contact;

  beforeEach(function(){
    openCheckoutForm(coOptions);
    $name    = jQuery('.input[name="card[name]"]');
    $email   = jQuery('.input[name="email"]');
    $contact = jQuery('.input[name="contact"]');
  });

  it("should load modal and prefill fields", function(){
    expect(jQuery('.modal')).toBeVisible();
    expect($name.val()).toBe(coOptions.prefill.name);
    expect($email.val()).toBe(coOptions.prefill.email);
    expect($contact.val()).toBe(coOptions.prefill.contact);
  });
});

describe("Razorpay card tab submit", function(){
  var spyCalled;
  var spyNotCalled;
  var $ccNumber, $ccExpiry, $ccCVV;
  var $name, $email, $contact;
  var $nbLink, $nbBank;
  var $ccForm, $ccSubmit;
  var customOptions;

  [
    function(o){o.method.netbanking = false},
    function(o){o.method.wallet = {}},
    jQuery.noop
  ].forEach(function(operation){

    beforeEach(function(){
      spyCalled    = jasmine.createSpy();
      spyNotCalled = jasmine.createSpy();

      customOptions = JSON.parse(JSON.stringify(coOptions));
    });

    function launch(){
      // For opening the modal
      operation(customOptions);
      openCheckoutForm(customOptions);

      $ccNumber    = jQuery('.input[name="card[number]"]');
      $ccExpiry    = jQuery('.input[name="card[expiry]"]');
      $ccCVV       = jQuery('.input[name="card[cvv]"]');
      $name        = jQuery('.input[name="card[name]"]');
      $email       = jQuery('.input[name="email"]');
      $contact     = jQuery('.input[name="contact"]');
      $ccSubmit    = jQuery('#submitbtn');
      $ccForm      = jQuery('#form');
    }

    function addAllCC(){
      $ccNumber.sendkeys(cc.number);
      $ccExpiry.val(cc.expiry);
      $ccCVV.sendkeys(cc.cvv);
    }

    afterEach(function(){
      sendclick($ccSubmit[0]);
      expect(spyCalled).toHaveBeenCalled();
      expect(spyNotCalled).not.toHaveBeenCalled();
    })

    describe("with all details in place", function(){
      var field;
      var value;

      afterEach(function(){
        addAllCC();

        spyOn(Razorpay.payment, 'authorize').and.callFake(function(options){
          spyCalled();
          expect(options.data[field]).toBe(value);
        });
      });

      it("should submit with all details in place", function(){
        launch();
      });

      describe(": in submitted data", function(){
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
      $ccExpiry.val(cc.expiry);
      $ccCVV.val(cc.cvv);

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

      beforeEach(function(){
        launch();
        addAllCC();
        spyCalled();

        data = frameDiscreet.getFormData(jQuery('.modal form'), true);
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
  })
});


describe("Razorpay open netbanking page and submit method", function(){
  var opts;
  var spyCalled, spyNotCalled;
  var $nbBank, $nbSubmit;

  var launch = function(operation){
    operation(opts);
    openCheckoutForm(opts);
    $nbBank = jQuery('select[name="bank"]');
    sendclick(jQuery('#tabs li[data-target="tab-netbanking"]')[0]);
  }

  beforeEach(function(){
    spyCalled    = jasmine.createSpy();
    spyNotCalled = jasmine.createSpy();
    opts = JSON.parse(JSON.stringify(coOptions));
  });

  afterEach(function(){
    sendclick(jQuery('#submitbtn')[0]);
    expect(spyCalled).toHaveBeenCalled();
    expect(spyNotCalled).not.toHaveBeenCalled();
    frameDiscreet.hide();
    jQuery('#container').remove();
  });

  [
    function(o){o.method.card = false},
    function(o){o.method.wallet = {}},
    jQuery.noop
  ].forEach(function(operation){

    it("should show netbanking form on clicking", function(){
      launch(operation);
      var active = jQuery('li.active');
      expect(active.length).toBe(1);
      expect(active.attr('data-target')).toBe('tab-netbanking');
      spyCalled();
    });

    it("should select bank", function(){
      launch(operation);
      var netb_bank = jQuery('#netb-banks label');
      sendclick(netb_bank[0]);
      expect(jQuery('select').val()).toBe(netb_bank.children('input').val());
      spyCalled();
    });

    it("should submit with all details in place", function(){
      launch(operation);
      $nbBank.val('SBIN');

      spyOn(Razorpay.payment, 'authorize').and.callFake(function(){
        spyCalled();
      });
    });

    it("should not submit without bank selected", function(){
      launch(operation);
      spyCalled();
      spyOn(Razorpay.payment, 'authorize').and.callFake(function(){
        spyNotCalled();
      });
    });

    it("should not submit without email", function(){
      launch(operation);
      $nbBank.val('SBIN');
      jQuery('.input[name="email"]').val('');

      spyCalled();
      spyOn(Razorpay.payment, 'authorize').and.callFake(function(){
        spyNotCalled();
      });
    });

    it("should not submit without contact", function(){
      launch(operation);
      $nbBank.val('SBIN');
      jQuery('.input[name="contact"]').val('');

      spyCalled();
      spyOn(Razorpay.payment, 'authorize').and.callFake(function(){
        spyNotCalled();
      });
    });
  });
});

describe("Razorpay netbanking getFormData method", function(){
  var opts, data;

  [
    function(o){o.method.card = false},
    function(o){o.method.wallet = {}},
    jQuery.noop
  ].forEach(function(operation){

    beforeEach(function(){
      opts = JSON.parse(JSON.stringify(coOptions));
      operation(opts);
      openCheckoutForm(opts);
      sendclick(jQuery('#tabs li[data-target="tab-netbanking"]')[0]);
      jQuery('select[name="bank"]').val('SBIN');
      data = frameDiscreet.getFormData();
    });

    describe("", function(){
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
});

describe("CheckoutBridge should", function(){
  var message = {event: 'evt'};

  beforeEach(function(){
    CheckoutBridge = {onevt: jQuery.noop};
  })

  afterEach(function(){
    CheckoutBridge = undefined;
  })

  it("be notified if present", function(){
    var spy = jasmine.createSpy();
    spyOn(frameDiscreet, 'notifyBridge').and.callFake(function(msg){
      if(msg == message)
        spy()
    });
    Razorpay.sendMessage(message);
  })

  it("be called with given event", function(){
    var spy = jasmine.createSpy();
    spyOn(CheckoutBridge, 'onevt').and.callFake(spy);
    frameDiscreet.notifyBridge(message);
    expect(spy).toHaveBeenCalled();
  })

  it("be called with given event and data", function(){
    message.data = {'some': 'data'};
    var spy = jasmine.createSpy();
    spyOn(CheckoutBridge, 'onevt').and.callFake(function(msg){
      if(msg == JSON.stringify(message.data))
        spy()
    })

    frameDiscreet.notifyBridge(message);
    expect(spy).toHaveBeenCalled();
  })

  it("not be notified if absent", function(){
    CheckoutBridge = null;
    var spy = jasmine.createSpy();
    spyOn(frameDiscreet, 'notifyBridge').and.callFake(spy);
    Razorpay.sendMessage(message);
    expect(spy).not.toHaveBeenCalled();
  })
})

describe("handleMessage should", function(){
  var opts, spyCalled, spyNotCalled;

  beforeEach(function(){
    spyCalled = jasmine.createSpy();
    spyNotCalled = jasmine.createSpy();
  })

  afterEach(function(){
    openCheckoutForm(opts);
    expect(spyCalled).toHaveBeenCalled();
    expect(spyNotCalled).not.toHaveBeenCalled();
  })

  it("signal fault if Razorpay instantiation fails", function(){
    opts = 11;
    spyOn(Razorpay, 'sendMessage').and.callFake(function(m){
      expect(m.event).toBe('fault');
      spyCalled();
    })
    spyOn(frameDiscreet, 'showModal').and.callFake(spyNotCalled);
  })

  it("showModal on passing options", function(){
    opts = coOptions;
    spyOn(frameDiscreet, 'showModal').and.callFake(spyCalled);
  })
})

describe("set url query params", function(){
  it("", function(){
    frameDiscreet.setQueryParams('qwe=asd&poe.level2=hjk&bnm=786');
    expect(qpmap.qwe).toBe('asd');
    expect(qpmap.poe.level2).toBe('hjk');
    expect(qpmap.bnm).toBe('786');
  })
})

describe('existing query params should', function(){

  afterEach(function(){
    qpmap = {};
  })

  it('set error', function(done){
    frameDiscreet.setQueryParams('error.description=asd');
    openCheckoutForm(coOptions);
    spyOn(frameDiscreet, 'errorHandler').and.callFake(function(response){
      expect(response.error.description).toBe('asd');
      done();
    })
  })

  it('set tab', function(){
    frameDiscreet.setQueryParams('tab=netbanking');
    openCheckoutForm(coOptions);
    expectVisibleTab('netbanking')();
  })
})

describe('ios CheckoutBridge', function(){
  it('should be set up if relevant query params', function(){
    qpmap.platform = 'ios';
    delete window.CheckoutBridge;
    iosBridge();

    expect(window.CheckoutBridge).toBeDefined();
    ['load','dismiss','submit','fault','success'].forEach(function(method){
      expect(typeof CheckoutBridge['on' + method]).toBe('function');
    })
  })
})

describe('close button should close modal', function(){
  it('', function(){
    var spy = jasmine.createSpy();
    var spy2 = jasmine.createSpy();
    openCheckoutForm(coOptions);
    spyOn(Razorpay.payment, 'cancel').and.callFake(spy);
    spyOn(_modal, 'hide').and.callFake(spy2);
    sendclick(jQuery('#modal-close')[0]);
    expect(spy).toHaveBeenCalled();
    expect(spy2).toHaveBeenCalled();
  })
})

describe('handleMessage should invoke dataHandler if initial data is passed as', function(){
  var spy, data, shouldCall;

  afterEach(function(){
    spy = jasmine.createSpy();
    spyOn(frameDiscreet, 'dataHandler').and.callFake(spy);
    openCheckoutForm(coOptions, data);
    var expectation = expect(spy);
    if(!shouldCall)
      expectation = expectation.not
    expectation.toHaveBeenCalled();
  })

  it('nothing', noop);
  it('invalid json string', function(){
    data = "asdaff";
  })
  it('object', function(){
    shouldCall = true;
    data = {};
  })
  it('valid json string', function(){
    shouldCall = true;
    data = '{}';
  })
})

describe('dataHandler should', function(){
  var data, expectation;

  afterEach(function(){
    openCheckoutForm(coOptions, data);
    expectation();
  })

  it('show tab netbanking', function(){
    data = {
      method: 'netbanking',
      bank: 'SBIN'
    }
    expectation = function(){
      expectation = expectVisibleTab('netbanking');
      expect(jQuery('#bank-select').val()).toBe('SBIN');
    }
  })
  it('show tab card', function(){
    data = {
      method: 'card'
    }
    expectation = expectVisibleTab('card');
  })
})