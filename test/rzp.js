/* global describe, it, Razorpay, expect, runs, waitsFor, endpoint */
describe("Razorpay", function() {
    "use strict";
    var rzp = new Razorpay();
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

    it("should show no errors after filling the form", function(){
        var $form = $('form.body');
        //We are using a CC here, so as to avoid having to press the button inside the iframe (3d secure)
        $form.find('input[name="card[number]"]').val('4012001038443335');
        $form.find('input[name="card[expiry]"]').val('05 / 19');
        $form.find('input[name="card[cvv]"]').val('888');
        $form.find('input[name="card[name]"]').val('Abhay Rana');
        $form.find('input[name="udf[contact]"]').val('9458113956');
        $form.find('input[name="udf[email]"]').val('nemo@razorpay.com');

        //Add handler to rzp
        var flag = false;
        rzp.options.handler = function(transaction){
            expect(transaction.status).toEqual('auth');
            expect(transaction.amount).toEqual(options.amount);
            expect(transaction.status).toEqual('auth');
            flag = true;
        };

        runs(function(){
            $('.submit').click();
            expect($('.error_box')).toContainHtml('');//there should be no errors
        });

        waitsFor(function(){
            //flag is set to true when handler is called
            //thus we're checking handler to have been called
            return flag;
        }, "Handler function should be called", 20000);
    });
});