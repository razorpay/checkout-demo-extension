var options = {
	'key': 'key_id',
	'amount': '5100',
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

describe("Checkout should handle frame message", function(){
	var co, co_opts;
//   var co;
//   var custom = $.extend(true, {}, coData.options);
//   custom.unwanted = 'fake';

	beforeEach(function(){
		co_opts = $.extend(true, {}, options);
	});
})

describe("checkout validate", function(){
  var init_options, errors, field;

	describe("should throw error if", function(){
		beforeEach(function(){
		   init_options = jQuery.extend(true, {}, options);
		});

		afterEach(function(){
		  expect(errors.length).toBe(1);
		  expect(errors[0].field).toBe(field);
		});

		it("display_currency is present and not USD", function(){
			init_options.display_currency = 'YEN';
		  field = 'display_currency';
		  errors = Razorpay.prototype.validateOptions(init_options, false);
		})

		it("display_currency is USD and  display_amount is not there", function(){
		  field = 'display_amount';
			init_options.display_currency = 'USD';
		  errors = Razorpay.prototype.validateOptions(init_options, false);
		})

		it("display_currency is USD and display_amount is invalid", function(){
		  field = 'display_amount';
			init_options.display_currency = 'USD';
			init_options.display_amount = 'swag';
		  errors = Razorpay.prototype.validateOptions(init_options, false);
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
