/* global describe, it, Razorpay, expect, endpoint, afterEach, beforeEach, spyOn, rzpXD */
"use strict";

describe("Available modules", function(){
    it("should include jQuery", function(){
        expect($).toBeDefined();
    });
    it("should include jQuery.payment", function(){
        expect($.payment).toBeDefined();
    });
    it("should include omniWindow", function(){
        expect($.fn.rzpomniWindow).toBeDefined();
    });
    //This is our cross domain communication library
    it("should include XD", function(){
        expect(rzpXD).toBeDefined();
    });
    it("should include Razorpay", function(){
        expect(Razorpay).toBeDefined();
    });
});
describe("breakExpiry", function(){

    var expiry;
    var rzp = new Razorpay({key:'d9c6bf091a1a64cb5678d8c1d5e7360f'});

    afterEach(function(){
        expiry = rzp.breakExpiry(expiry);
        expect(expiry.month).toBe('05');
        if(expiry.year.length === 2){
            expect(expiry.year).toBe('19');
        }
        else if(expiry.year.length === 4){
            expect(expiry.year).toBe('2019');   
        }
        else{
            throw "Invalid Year Error";
        }
    });

    it("should work with spaces", function(){
        expiry = '05 / 19';
    });

    it("should work without spaces", function(){
        expiry = '05/19';
    });

    it("should work with 4 digit years", function(){
        expiry = '05/2019';
    });

    it("should work with 4 digit years (with spaces)", function(){
        expiry = '05 / 2019';
    });
});

describe("overlay", function(){
    it("should be present in DOM", function(){
        expect($('.ow-overlay')).toBeInDOM();
    });
    it("should be hidden", function(){
        expect($('.ow-overlay')).toHaveClass('ow-closed');
    });
    it("should be single", function(){
        expect($('.ow-overlay').length).toBe(1);
    });
});

describe("Razorpay", function() {

    var rzp;
    var options = {
        'amount':'20',
        'name':'Razorpay',
        'description':'Karma',
        'image':'https://api.razorpay.com/test/merchant/vk.jpg',
        'key': 'd9c6bf091a1a64cb5678d8c1d5e7360f'
    };

    var prefillOptions = {
        name: 'Harshil Mathur',
        contact: '9999999999',
        email: 'harshil@razorpay.com'
    };

    beforeEach(function(){
        //This is to reset options after every test
        rzp = new Razorpay(options);

        //This won't run on wercker where env.js is missing
        if(typeof endpoint !== 'undefined'){
            rzp.setEndpoint(endpoint.protocol, endpoint.hostname);
        }
    });
    

    it("should throw an error on missing merchant key", function(){
        var newOptions = $.extend({}, options); 
        delete newOptions['key'];
        expect(function(){
            new Razorpay(newOptions);
        }).toThrow(new Error("No merchant key specified"));
    });

    it("addButton should work", function() {
        //Since karma is automatically injecting the scripts, we cannot add the data- parameters to the script tag
        //Therefore we must manually add the button
        rzp.addButton();
        expect($('#rzp-button')).toBeInDOM();
    });

    it('open should work', function(){
        
        rzp.open(); //Show the modal

        expect(rzp.$el).toBeVisible();

        rzp.$el.find('input').removeAttr('required'); //This is so that chrome does not freak out about "required" attibutes

        rzp.$el.find('.rzp-submit').click();
        
    });

    it("should accept arguments to .open and use them", function(){
        rzp.open({
            prefill:prefillOptions
        });
        var $form = rzp.$el.find('.rzp-body');
        expect($form.find(rzp.fieldNames.name)).toHaveValue(prefillOptions.name);
        expect($form.find(rzp.fieldNames.contact)).toHaveValue(prefillOptions.contact);
        expect($form.find(rzp.fieldNames.email)).toHaveValue(prefillOptions.email);
    });

    it("should show no errors after filling the form", function(){
        //This is to fill the name, email, and contact
        rzp.open({
            prefill:prefillOptions
        });
        var $form = rzp.$el.find('.rzp-body');
        //We are using a CC here, so as to avoid having to press the button inside the iframe (3d secure)
        $form.find(rzp.fieldNames.number).val('4012001038443335');
        $form.find(rzp.fieldNames.expiryMonth).val('05');
        $form.find(rzp.fieldNames.expiryYear).val('19');
        $form.find(rzp.fieldNames.cvv).val('888');
        var errors = rzp.postValidate($form);
        expect(errors).toEqual([]);
    });
    
    it("should call the handler function after its done", function(done){

        //Fake ajax call
        //@link http://www.htmlgoodies.com/html5/javascript/testing-ajax-event-handlers-using-jasmine-spies.html
        spyOn($, "ajax").and.callFake(function(options){
            //We make sure that the context for the success request is set to the context passed to $.ajax (rzp object)
            var ajaxSuccess = $.proxy(options.success, options.context);
            ajaxSuccess({
                "id":"e6091ef0f6d911e398770090f5fbf011"
            });
        });

        rzp.open({
            prefill:prefillOptions,
            handler: function(){
                done();
            }
        });
        
        var $form = rzp.$el.find('.rzp-body');

        $form.find(rzp.fieldNames.number).val('4012001038443335');
        $form.find(rzp.fieldNames.cvv).val('888');
        //We manually set the expiry here because we are testing user-click based form submission, which uses expiry and breaks it down into two fields
        $form.find(rzp.fieldNames.expiry).val('05 / 19');
        
        rzp.$el.find('.rzp-submit').click();
    });
});

describe("Errors", function(){
    var error, options;

    afterEach(function(){
        expect(function(){
            var rzp = new Razorpay(options);
            rzp.validateOptions();
        }).toThrow(new Error(error));
    });

    it("should be thrown on missing options", function(){
        error = "No options specified";
    });

    it("should be thrown on missing key", function(){
       options = {};
       error = "No merchant key specified";
    });

    it("should be thrown on missing amount", function(){
        options = {key:1};
        error = "No amount specified";
    });

    it("should be thrown on invalid amount", function(){
        error = "Invalid amount specified";
        options = {key:1,amount:-1};
    });

    it("should be be thrown on handler not being a function", function(){
        options = {key:1, amount:10, handler: false};
        error = "Handler must be a function";
    });

    it("should be thrown on invalid protocol", function(){
        options = {key:1, amount:10, protocol: 'ftp'};
        error = "Invalid Protocol specified";
    });

    it("should be thrown on udf.contact being set", function(){
        options = {key:1, amount:10, udf:{contact:"9999999999"}};
        error = "You cannot pass the contact field via udf. Use the prefill option, or use another field name like contact2";
    });

    it("should be thrown on udf.email being set", function(){
        options = {key:1, amount:1, udf:{email:"nemo@gmail.com"}};
        error = "You cannot pass the email field via udf. Use the prefill option, or use another field name like email2";
    });

    it("should be thrown on more than 13 udf fields", function(){
        options = {
            key: 1,
            amount: 2,
            udf:{
            }
        };
        for(var i =1;i<=14;i++){
            options.udf[i] = "Dummy Test";
        }
        error = "You can only pass at most 13 fields in the udf object";
    });
});