/* global describe, it, Razorpay, expect, endpoint, jasmine, afterEach */
"use strict";
var rzp = new Razorpay();

describe("breakExpiry", function(){

    var expiry;

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

describe("Razorpay", function() {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;

    var options = {
        'key': 'd9c6bf091a1a64cb5678d8c1d5e7360f',
        'amount':'20',
        'name':'Google',
        'description':'Google Glass',
        'image':'https://api.razorpay.com/test/merchant/vk.jpg'
    };

    if(typeof endpoint !== 'undefined'){
        rzp.setEndpoint(endpoint.protocol, endpoint.hostname);
    }

    it("addButton should work", function() {
        //Since karma is automatically injecting the scripts, we cannot add the data- parameters to the script tag
        //Therefore we must manually add the button
        rzp.addButton();
        expect($('#rzp-button')[0]).toBeInDOM();
    });

    it('configure should work', function(){

        rzp.configure(options);//This will continue to use the default handler
        
        rzp.open(); //Show the modal
        expect($('.modal')).toBeVisible();

        $('form.body').find('input').removeAttr('required'); //This is so that chrome does not freak out about "required" attibutes

        $('.submit').click();
        expect($('.error_box li')).toHaveLength(16);
    });

    it("should accept arguments to .open and use them", function(){
        var prefillOptions = {
            name: 'Harshil Mathur',
            contact: '9999999999',
            email: 'harshil@razorpay.com'
        };
        rzp.open({
            prefill:prefillOptions
        });
        var $form = $('form.body');
        expect($form.find('input[name="card[name]"]')).toHaveValue(prefillOptions.name);
        expect($form.find('input[name="udf[contact]"]')).toHaveValue(prefillOptions.contact);
        expect($form.find('input[name="udf[email]"]')).toHaveValue(prefillOptions.email);
    });

    it("should show no errors after filling the form", function(){
        var $form = $('form.body');
        //We are using a CC here, so as to avoid having to press the button inside the iframe (3d secure)
        $form.find('input[name="card[number]"]').val('4012001038443335');
        $form.find('input[name="card[expiry_month]"]').val('05');
        $form.find('input[name="card[expiry_year]"]').val('19');
        $form.find('input[name="card[cvv]"]').val('888');
        var errors = rzp.postValidate($form);
        expect(errors).toEqual([]);
    });

    it("should call the handler function after its done", function(done){
        var $form = $('form.body');
        //We manually set the expiry here because we are testing user-click based form submission, which uses expiry and breaks it down into two fields
        $form.find('input[name="card[expiry]"]').val('05 / 19');
        $('.submit').click();
        //Add handler to rzp
        rzp.options.handler = function(transaction){
            expect(transaction.status).toEqual('auth');
            expect(transaction.amount).toEqual(options.amount);
            done();
        };
        expect($('.error_box')).toContainHtml('');//there should be no errors
    });
    it("should hide the modal after successfull transaction", function(){

        //expect(rzp.$modal).toBeHidden();
    });
});