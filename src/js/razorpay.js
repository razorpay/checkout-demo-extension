/* global $,templates */
(function(){
    "use strict";

    var RazorPayScript = document.currentScript || (function() {
        var scripts = document.getElementsByTagName('script');
        return scripts[scripts.length - 1];
    })();

    var center = function(selector) {
        var $el = $(selector);
        $el.css("position","absolute");
        $el.css("top", ( $(window).height() - $el.height() ) / 2  + "px");
        $el.css("left", ( $(window).width() - $el.width() ) / 2 + "px");
        //The following two are needed for clearing omniWindow settings
        $el.css('margin-left','auto');
        $el.css('margin-top','auto');
        return this;
    };

    var Razorpay = function(){
        $('<div class="ow-overlay ow-closed"></div> ').appendTo("body");
    };

    Razorpay.prototype.preValidate = function($form){
        //Card Number
        $form.find('input[name="card[number]"]').payment('formatCardNumber');
        $form.find('input[name="card[expiry]"]').payment('formatCardExpiry');
        $form.find('input[name="card[cvv]"]').payment('formatCardCVC');

        //Attach a focusout handler to show card type
        $form.find('input[name="card[number]"]').off('focusout').focusout(function(){
            var cardType = $.payment.cardType(this.value);
            if(cardType!=null){
                $form.find('.card_image').addClass(cardType);
            }
        });
    };

    Razorpay.prototype.postValidate = function($form){
        $form.find('input').removeClass('invalid');
        var cardNumber = $form.find('input[name="card[number]"]').val();
        var expiryMonth = $form.find('input[name="card[expiry_month]"]').val();
        var expiryYear = $form.find('input[name="card[expiry_year]"]').val();
        var cvc = $form.find('input[name="card[cvv]"]').val();
        var name = $form.find('input[name="card[name]"]').val();
        var email = $form.find('input[name="udf[email]"]').val();
        var contact = $form.find('input[name="udf[contact]"]').val();

        var errors = [];

        if(name === ''){
            $form.find('input[name="card[name]"]').addClass('invalid');
            errors.push('Missing Name');
        }
        if(name.length>100){
            $form.find('input[name="card[name]"]').addClass('invalid');
            errors.push('Maximum name length is 100');
        }
        if(email === ''){
            $form.find('input[name="udf[email]"]').addClass('invalid');
            errors.push('Missing email address');
        }
        if(email.length>250){
            $form.find('input[name="udf[email]"]').addClass('invalid');
            errors.push('Maximum email length is 250');
        }
        if(contact === ''){
            $form.find('input[name="udf[contact]"]').addClass('invalid');
            errors.push('Missing contact number');
        }
        if(contact.length>12 || contact.length<8){
            $form.find('input[name="udf[contact]"]').addClass('invalid');
            errors.push('Contact number should be between 8 and 12 digits long');
        }
        if(!/^\d+$/.test(contact)){
            $form.find('input[name="udf[contact]"]').addClass('invalid');
            errors.push('Contact number should be made of entirely digits');
        }
        if(!$.payment.validateCardNumber(cardNumber)){
            $form.find('input[name="card[number]"]').addClass('invalid');
            errors.push('Invalid Credit Card Number');
        }
        if(!$.payment.validateCardExpiry(expiryMonth, expiryYear)){
            $form.find('input[name="card[expiry]"]').addClass('invalid');
            errors.push('Invalid Expiry Date');
        }
        if(!$.payment.validateCardCVC(cvc)){
            $form.find('input[name="card[cvv]"]').addClass('invalid');
            errors.push('Invalid CVV Number');
        }
        return errors;
    };

    Razorpay.prototype.clearSubmission = function(){
        $('form.body .submit').removeAttr('disabled');
        $('div.modal').data('busy', false);
    };

    Razorpay.prototype.createlightBox = function(template){
        var html = $.tmpl(template, this.options);
        html.appendTo('body');
        this.preValidate($('form.body'));
        var that = this;
        $('form.body').submit(function(e){
            //Handles the form submission
            var submission  = that.formsubmit(this);//submission stores whether we are submitting the form or not
            if(submission){
                $('form.body .submit').attr('disabled','disabled');//Disable the input button to prevent double submissions
                //Marks the modal window as busy so it is not closable
                $('div.modal').data('busy', true);
            }
            else{
                that.clearSubmission();
            }
            e.preventDefault();//So that form is not submitted by the browser, but by us over ajax
        });
    };

    Razorpay.prototype.formsubmit = function(form){
        var merchantKey = $(form).find('input[name="key"]').val();
        var expiry = $(form).find('input[name="card[expiry]"]').val();
        $(form).append("<input type='hidden' name='card[expiry_month]' value='"+expiry.substr(0,2)+"'>");
        $(form).append("<input type='hidden' name='card[expiry_year]' value='"+expiry.replace(/[ \/]/g,'').substr(2)+"'>");
        //strip all spaces and backslashes, and then cut off first two digits (month);

        var data = $(form).serialize();
        var errors = this.postValidate($(form));
        if(errors.length > 0){//If we have more than one errors
            //Cleanup a bit
            $(form).find("input[name='card[expiry_month]']").remove();
            $(form).find("input[name='card[expiry_year]']").remove();

            //Shake the modal window
            $('div.modal').addClass('shake');
            window.setTimeout(function(){$('div.modal').removeClass("shake");}, 150);

            var template = '{{each err}}\
                    <li>${$value}<li>\
                {{/each}}';
            var div = document.createElement('div');
            $.tmpl(template,{err:errors}).appendTo(div);
            $('.error_box').html(div.innerHTML);
            return false;
        }
        else{
            //Cleanup errors created by any previous attempts
            $('.error_box').html('');
        }
        $(form).find('input[name="expiry"]').remove();//Remove the singly expiry field
        var that = this;
        $.getJSON(this.options.protocol+'://'+merchantKey+'@'+this.options.hostname+'/transactions/jsonp?callback=?', data, function(response){
            if(response.exception){
                $('.error_box').html('<li>There was an error in handling your request</li>');
                that.clearSubmission();
            }
            else if(response.error){
                var message = response.error.message || 'There was an error in handling your request';
                $('.error_box').html('<li>'+message+'</li>');
                that.clearSubmission();
            }
            else if(response.callbackUrl){
                $('div.modal').html('<iframe></iframe>');
                var autosubmitformTemplate = templates['templates/autosubmit.tmpl'];
                var div = document.createElement('div');
                $.tmpl(autosubmitformTemplate, response).appendTo(div);
                $('div.modal iframe').get()[0].contentWindow.document.write(div.innerHTML);
                //This form should autosubmit
                //Now we need to resize the modal box so as to accomodate 3dsecure.
                $('div.modal, div.modal iframe').width('1000px').height('500px');
                center('div.modal');
                /* global XD */
                XD.receiveMessage(function(message){
                    that.hide();
                    that.options.handler(message.data);
                });
            }else{
                that.hide();
                that.options.handler(response);
            }
        });
        return true;
    };

    Razorpay.prototype.hide = function(){
        this.clearSubmission();
        this.$modal.trigger('hide');
    };

    Razorpay.prototype.options = {
        protocol: 'https',
        hostname: 'api.razorpay.com'
    };//We can specify any default options here
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
        var that = this;
        $(button).click(function(e){
            that.open();
            e.preventDefault();
        }).html('Pay with Card')
        .appendTo('body');
    };
    Razorpay.prototype.open = function(options){
        $.extend(this.options, options);
        this.$modal = $('div.modal').omniWindow();
        this.$modal.trigger('show');
    };
    Razorpay.prototype.configure = function(options){
        $.extend(this.options, options);
        //These options will be used in creating the lightbox
        this.createlightBox(templates['templates/modal.tmpl']);//Create the lightbox but don't show it yet
    };
    
    var key = $(RazorPayScript).data('key');
    if(key && key.length>0){
        //If we have a key set, that means we are in auto mode and need to display the button automatically
        var rzp = new Razorpay();
        rzp.configure($(RazorPayScript).data());
        rzp.addButton();
    }
    window['Razorpay'] = Razorpay;

})();