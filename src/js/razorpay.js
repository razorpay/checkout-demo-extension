/* global $,templates */
(function(){
    "use strict";

    var RazorPayScript = document.currentScript || (function() {
        var scripts = document.getElementsByTagName('script');
        return scripts[scripts.length - 1];
    })();

    var init = function(){
        $('<div class="ow-overlay ow-closed"></div>').appendTo("html");
    };

    var position = function($el) {
        $el.css("position","absolute");
        $el.css("top", ( $(window).height() - $el.height() ) / 4  + "px");
        $el.css("left", ( $(window).width() - $el.width() ) / 2 + "px");
        //The following two are needed for clearing omniWindow settings
        $el.css('margin-left','auto');
        $el.css('margin-top','auto');
        return this;
    };

    var Razorpay = function(options){
        this.configure(options);
    };

    /** This function is passed an rzp instance and it is saved in Razorpay **/
    Razorpay.prototype.setXDInstance = function(){
        Razorpay.lastXDInstance = this;
    };

    Razorpay.XDCallback = function(message){
        var rzp = Razorpay.lastXDInstance;
        rzp.preHandler();
        rzp.options.handler(message.data);
    };

    Razorpay.prototype.fieldNames = {
        number : 'input[name="card[number]"]',
        expiry : 'input[name="card[expiry]"]',
        cvv: 'input[name="card[cvv]"]',
        name: 'input[name="card[name]"]',
        email: 'input[name="udf[email]"]',
        contact: 'input[name="udf[contact]"]',
        expiryMonth: 'input[name="card[expiry_month]"]',
        expiryYear: 'input[name="card[expiry_year]"]'
    };

    Razorpay.prototype.preValidate = function($form){
        //Card Number
        $form.find(this.fieldNames.number).payment('formatCardNumber');
        $form.find(this.fieldNames.expiry).payment('formatCardExpiry');
        $form.find(this.fieldNames.cvv).payment('formatCardCVC');

        //Attach a focusout handler to show card type
        $form.find(this.fieldNames.number).off('focusout').focusout(function(){
            var cardType = $.payment.cardType(this.value);
            if(cardType!=null){
                $form.find('.rzp-card_image').addClass(cardType);
            }
        });
    };

    Razorpay.prototype.postValidate = function($form){
        $form.find('input').removeClass('rzp-invalid');
        var cardNumber = $form.find(this.fieldNames.number).val();
        var expiryMonth = $form.find(this.fieldNames.expiryMonth).val();
        var expiryYear = $form.find(this.fieldNames.expiryYear).val();
        var cvv = $form.find(this.fieldNames.cvv).val();
        var name = $form.find(this.fieldNames.name).val();
        var email = $form.find(this.fieldNames.email).val();
        var contact = $form.find(this.fieldNames.contact).val();

        var errors = [];

        if(name === ''){
            $form.find(this.fieldNames.name).addClass('rzp-invalid');
            errors.push('Missing Name');
        }
        if(name.length>100){
            $form.find(this.fieldNames.name).addClass('rzp-invalid');
            errors.push('Maximum name length is 100');
        }
        if(email === ''){
            $form.find(this.fieldNames.email).addClass('rzp-invalid');
            errors.push('Missing email address');
        }
        if(email.length>250){
            $form.find(this.fieldNames.email).addClass('rzp-invalid');
            errors.push('Maximum email length is 250');
        }
        if(contact === ''){
            $form.find(this.fieldNames.contact).addClass('rzp-invalid');
            errors.push('Missing contact number');
        }
        if(contact.length>12 || contact.length<8){
            $form.find(this.fieldNames.contact).addClass('rzp-invalid');
            errors.push('Contact number should be between 8 and 12 digits long');
        }
        if(!/^\d+$/.test(contact)){
            $form.find(this.fieldNames.contact).addClass('rzp-invalid');
            errors.push('Contact number should be made of entirely digits');
        }
        if(!$.payment.validateCardNumber(cardNumber)){
            $form.find(this.fieldNames.number).addClass('rzp-invalid');
            errors.push('Invalid Credit Card Number');
        }
        if(!$.payment.validateCardExpiry(expiryMonth, expiryYear)){
            $form.find(this.fieldNames.expiry).addClass('rzp-invalid');
            errors.push('Invalid Expiry Date');
        }
        if(!$.payment.validateCardCVC(cvv)){
            $form.find(this.fieldNames.cvv).addClass('rzp-invalid');
            errors.push('Invalid CVV Number');
        }
        return errors;
    };

    Razorpay.prototype.clearSubmission = function(){
        this.$el.find('.rzp-submit').removeAttr('disabled');
        this.$el.data('busy', false);
    };

    Razorpay.prototype.createlightBox = function(template){
        if(this.options.id){
            //Lets remove the div first
            $('#'+this.options.id).remove();
        }
        this.options.id = (Math.random()).toString(36).replace(/[^a-z]+/g, '');
        var html = $.tmpl(template, this.options);
        html.appendTo('body');
        this.$el = $('#'+this.options.id);
        this.preValidate(this.$el.find('form.rzp-body'));
        var self = this;
        this.$el.find('form.rzp-body').submit(function(e){
            //Handles the form submission
            var submission  = self.formsubmit(this);//submission stores whether we are submitting the form or not
            if(submission){
                self.$el.find('.rzp-submit').attr('disabled','disabled');//Disable the input button to prevent double submissions
                //Marks the modal window as busy so it is not closable
                self.$el.data('busy', true);
            }
            else{
                self.clearSubmission();
            }
            e.preventDefault();//So that form is not submitted by the browser, but by us over ajax
        });
    };

    Razorpay.prototype.breakExpiry = function(expiry){
        //Returns month, year as a tuple inside an object
        return {
            month: expiry.substr(0,2), 
            //strip all spaces and backslashes, and then cut off first two digits (month);
            year: expiry.replace(/[ \/]/g,'').substr(2)
        };
    };
    Razorpay.prototype.formsubmit = function(form){
        var merchantKey = this.options.key;
        var $form = $(form);
        var expiry = this.breakExpiry($form.find(this.fieldNames.expiry).val());
        $form.find(this.fieldNames.expiryMonth).val(expiry.month);
        $form.find(this.fieldNames.expiryYear).val(expiry.year);

        var data = $form.serialize();

        var errors = this.postValidate($form);
        var self = this;
        if(errors.length > 0){//If we have more than one errors

            //Shake the modal window
            this.$el.addClass('rzp-shake');
            
            window.setTimeout(function(){self.$el.removeClass("rzp-shake");}, 150);

            var template = '{{each err}}\
                    <li>${$value}<li>\
                {{/each}}';
            var div = document.createElement('div');
            $.tmpl(template,{err:errors}).appendTo(div);
            this.$el.find('.rzp-error_box').html(div.innerHTML);
            return false;
        }
        else{
            //Cleanup errors created by any previous attempts
            this.$el.find('.rzp-error_box').html('');
        }

        $.ajax({
            url: this.options.protocol+'://'+merchantKey+'@'+this.options.hostname+'/transactions/jsonp',
            dataType: 'jsonp',
            context: this,
            success: this.handleAjaxResponse,
            timeout: 35000,//35 seconds = 30s for gateway + 5s for razorpay
            error: this.handleAjaxError,
            data: data
        });
        return true;
    };

    Razorpay.prototype.handleAjaxError = function(){
        this.$el.find('.rzp-error_box').html('<li>There was an error in handling your request</li>');
        this.clearSubmission();
    };

    Razorpay.prototype.handleAjaxResponse = function(response){
        if(response.exception){
            this.$el.find('.rzp-error_box').html('<li>There was an error in handling your request</li>');
            this.clearSubmission();
        }
        else if(response.error){
            var message = response.error.message || 'There was an error in handling your request';
            this.$el.find('.rzp-error_box').html('<li>'+message+'</li>');
            this.clearSubmission();
        }
        else if(response.callbackUrl){
            this.$el.html('<iframe></iframe>');
            var autosubmitformTemplate = templates['templates/autosubmit.tmpl'];
            var div = document.createElement('div');
            $.tmpl(autosubmitformTemplate, response).appendTo(div);
            this.$el.find('iframe').get(0).contentWindow.document.write(div.innerHTML);
            //This form should autosubmit
            //Now we need to resize the modal box so as to accomodate 3dsecure.
            $(this.$el).width('1000px').height('500px');
            $(this.$el.find('iframe')).width('1000px').height('500px');
            position(this.$el);
            //Make this instance of rzp the instance called by the XDCallback
            this.setXDInstance();
        }
        else{
            this.preHandler();
            this.options.handler(response);
        }
    };

    Razorpay.prototype.hide = function(){
        this.clearSubmission();
        this.$modal.trigger('hide.ow');
    };

    Razorpay.prototype.options = {
        protocol: 'https',
        hostname: 'api.razorpay.com',
        prefill: {
            name: "",
            contact: "",
            email: ""
        },
        //These fields are specified by the merchant
        udf:{
        }
    };//We can specify any default options here

    /** This function is called just before control is passed on to the handler specified in options */
    Razorpay.prototype.preHandler = function(){
        this.hide();//Hide the modal window when the transaction is complete
        //Prepare the lightBox for re-opening
        this.createlightBox(templates['templates/modal.tmpl']);
    };

    //default handler for success
    //default handler does not care about error or success messages, it just submits everything via the form
    Razorpay.prototype.options.handler = function(data){
        var inputs='';
        for(var i in data)
        {
            //For fields like udf, which are an object themselves
            if(typeof data[i]==='object'){
                for(var j in data[i]){
                    inputs+='<input type="hidden" name="'+i+'['+j+']" value="'+data[i][j]+'">';
                }
            }
            else{
                inputs+='<input type="hidden" name="'+i+'" value="'+data[i]+'">';
            }
        }
        var RazorPayForm = RazorPayScript.parentElement;
        $(inputs).appendTo(RazorPayForm);
        $(RazorPayForm).submit();
    };

    Razorpay.prototype.setEndpoint = function(protocol, hostname){
        this.options.protocol = protocol;
        this.options.hostname = hostname;
    };
    /** Now everything is defined */
    //Start by creating a new button to press

    Razorpay.prototype.addButton = function(){
        var button = document.createElement('button');
        button.setAttribute('id','rzp-button');
        var self = this;
        $(button).click(function(e){
            self.open();
            e.preventDefault();
        }).html('Pay with Card')
        .appendTo('body');
    };

    Razorpay.prototype.validateOptions = function(){
        if(typeof this.options.amount === 'undefined'){
            throw new Error("No amount specified");
        }
        if(this.options.amount < 0){
            throw new Error("Invalid amount specified");
        }
        if(["https", "http"].indexOf(this.options.protocol) < 0){
            throw new Error("Invalid Protocol specified");
        }
        if(!$.isFunction(this.options.handler)){
            throw new Error("Handler must be a function");
        }
        if(typeof this.options.key === 'undefined'){
            throw new Error("No merchant key specified");
        }
        for(var i in this.options.udf){
            if(i==='contact'){
                throw new Error("You cannot pass the contact field via udf. Use the prefill option, or use another field name like contact2.");
            }
            if(i==='email'){
                throw new Error("You cannot pass the email field via udf. Use the prefill option, or use another field name like email2");
            }
        }
    };
    Razorpay.prototype.open = function(options){
        this.options = $.extend({}, this.options, options);
        this.createlightBox(templates['templates/modal.tmpl']);
        this.$modal = this.$el.rzpomniWindow();
        this.$modal.trigger('show');
        position(this.$el);
    };
    Razorpay.prototype.configure = function(options){
        if(typeof options === 'undefined'){
            throw new Error("No options specified");
        }
        if(typeof options['key'] === "undefined"){
            throw new Error("No merchant key specified");
        }
        this.options = $.extend({}, this.options, options);
    };
    
    (function(){

        var key = $(RazorPayScript).data('key');
        if(key && key.length>0){
            //If we have a key set, that means we are in auto mode and need to display the button automatically
            var rzp = new Razorpay($(RazorPayScript).data());
            rzp.addButton();//We leave this unstyled
        }

        window['Razorpay'] = Razorpay;
        init();

    })();

    /* global rzpXD */
    rzpXD.receiveMessage(Razorpay.XDCallback);
})();