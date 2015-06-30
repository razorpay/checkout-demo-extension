var discreet = Razorpay.prototype.discreet;
var options = {
  'key': 'key_id',
  'amount': '5100',
  'name': 'Merchant Name',
  'netbanking': 'true',
  'prefill': {
    'name': 'Shashank Mehta',
    'email': 'sm@razorpay.com',
    'contact': '9999999999'
  }
}

var cc = {
  number: '4012001037141112',
  expiry: '05 / 19',
  cvv: '888'
}

describe("open method", function(){
  var rzp;

  beforeEach(function(){
    rzp = new Razorpay(options);
    rzp.open();
  })

  it("should attach xdm listener", function(){
    expect(discreet.isOpen).toBe(true);
    expect(typeof discreet.xdm._listener).toBe('function');
  })

  it("should append iframe", function(){
    expect(rzp.checkoutFrame).toBeDefined();
    expect(document.body.contains(rzp.checkoutFrame.parentNode)).toBe(true);
  })

  afterEach(function(){
    discreet.onClose();
  })
})

describe("close method", function(){
  var rzp;

  it("should clean up various properties", function(done){
    rzp = new Razorpay(options);
    rzp.open();
    setTimeout(function(){
      discreet.onClose.call(rzp);
      expect(discreet.isOpen).toBe(false);
      expect(discreet.xdm._listener).toBe(null);
      expect(rzp.checkoutFrame).not.toBeVisible();
      done();
    })
  })
})

describe("normalize image option if", function(){
  var baseUrl = location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '');

  it("path relative url", function(){
    var opts = {image: 'abcdef'};
    discreet.setImageOption(opts);
    expect(opts.image).toBe(baseUrl + '/abcdef');
  })

  it("server relative url", function(){
    var opts = {image: '/hello/world'};
    discreet.setImageOption(opts);
    expect(opts.image).toBe(baseUrl + '/hello/world');
  })
  
  it("absolute url", function(){
    var opts = {image: 'https://hello/world'};
    discreet.setImageOption(opts);
    expect(opts.image).toBe('https://hello/world');
  })

  it("base64", function(){
    var base64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAL4AAAC+CAIAAAAEFiLKAAAAA3NCSVQICAjb4U/';
    var opts = {image: base64};
    discreet.setImageOption(opts);
    expect(opts.image).toBe(base64);
  })

})

describe("onFrameMessage ", function(){
  var rzp;

  beforeEach(function(){
    rzp = new Razorpay(options);
    rzp.open();
  });

  afterEach(function(){
    discreet.onClose();
  });

  it("load, ", function(){
    postMessage({source: "frame", event: "load"}, '*');
    
    it("meta viewport is to be set", function(done){
      setTimeout(function(){
        expect(document.querySelector('meta[name=viewport]').content).toBe('width=device-width, initial-scale=1');
        done();
      })
    })

    it("image option is to be normalized", function(done){
      var spy = jasmine.createSpy();
      spyOn(discreet, 'setImageOption').and.callFake(spy);
      setTimeout(function(){
        expect(spy).toHaveBeenCalled();
      })
    })
 
    it("init options are to be sent to frame", function(done){
      var spy = jasmine.createSpy();
      spyOn(discreet, 'sendFrameMessage').and.callFake(function(response){
        if(this === rzp && response.context === location.href){
          var o = response.options;
          if(o.key && o.amount){
            spy();
          }
        }
      });
      setTimeout(function(){
        expect(spy).toHaveBeenCalled();
      })
    })
  })

  it("success, handler is to be called", function(done){
    var spy = jasmine.createSpy();
    rzp.options.handler = function(data){
      if(this === null && data == "payment_id") spy();
    };
    postMessage({source: "frame", event: "success", data: "payment_id"}, '*');
    setTimeout(function(){
      expect(rzp.checkoutFrame.getAttribute('removable')).toBe("true");
      done();
    })
  })

  it("dismiss, modal.ondismiss is to be called", function(done){
    var spy = jasmine.createSpy();
    spyOn(rzp.options.modal, 'ondismiss').and.callFake(spy);
    postMessage({source: "frame", event: "dismiss"}, '*');
    setTimeout(function(){
      expect(spy).toHaveBeenCalled();
      done();
    })
  })

  it("hidden, onClose is to be called", function(done){
    var spy = jasmine.createSpy();
    spyOn(discreet, 'onClose').and.callFake(function(){
      if(this === rzp) spy();
    });
    postMessage({source: "frame", event: "hidden"}, '*');
    setTimeout(function(){
      expect(spy).toHaveBeenCalled();
      done();
    })
  })
})

/**
 * validateOptions method in Razorpay calls validateCheckout
 * which tests Checkout specific options only
 */
describe("checkout validate", function(){
  var init_options, errors, field;

  describe("should throw error if", function(){
    beforeEach(function(){
       init_options = jQuery.extend(true, {}, options);
    });

    afterEach(function(){
      errors = discreet.validateOptions(init_options, false);
      expect(errors.length).toBe(1);
      expect(errors[0].field).toBe(field);
    });

    it("amount is invalid", function(){
      field = 'amount';
      init_options.amount = 'amount';
    });

    it("when amount not specified", function(){
      delete init_options.amount;
      field = 'amount';
    });

    it("when amount is less than 0", function(){
      init_options.amount = '-10';
      field = 'amount';
    });

    it("when amount is in decimal", function(){
      init_options.amount = '10.10';
      field = 'amount';
    });

    it("when handler is not a function", function(){
      init_options.handler = 'string';
      field = 'handler';
    });

    it("when merchant name is not passed", function(){
      delete init_options.name;
      field = 'name';
    })

    it("display_currency is present and not USD", function(){
      init_options.display_currency = 'YEN';
      field = 'display_currency';
    })

    it("display_currency is USD and  display_amount is not there", function(){
      field = 'display_amount';
      init_options.display_currency = 'USD';
    })

    it("display_currency is USD and display_amount is invalid", function(){
      field = 'display_amount';
      init_options.display_currency = 'USD';
      init_options.display_amount = 'swag';
    })
  })
})

// // Modal functionality
// describe("Razorpay modal", function(){
//   var cancelSpy;
//   var hiddenSpy;
//   var co;
//   beforeEach(function(){
//     cancelSpy = jasmine.createSpy();
//     hiddenSpy = jasmine.createSpy();
//     var opts = $.extend(coData.options, {
//       oncancel: cancelSpy,
//       onhidden: hiddenSpy
//     })
//     co = new Razorpay(opts);
//     co.open();
//   });

//   afterEach(function(){
//     $('.rzp-container').remove();
//   });

//   it("should call cancel callback", function(){
//     co.modal.hide()
//     setTimeout(function(){
//       expect(cancelSpy).toHaveBeenCalled();
//     }, 100)
//   });
// });
