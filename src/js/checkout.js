/* global $ */
(function(){
    "use strict";

    var RazorPayScript = document.currentScript || (function() {
        var scripts = document.getElementsByTagName('script');
        return scripts[scripts.length - 1];
    })();

    var center = function (selector) {
        var $el = $(selector);
        $el.css("position","absolute");
        $el.css("top", ( $(window).height() - $el.height() ) / 2  + "px");
        $el.css("left", ( $(window).width() - $el.width() ) / 2 + "px");
        //The following two are needed for clearing omniWindow settings
        $el.css('margin-left','auto');
        $el.css('margin-top','auto');
        return this;
    };

    function showLightBox(){
        var $modal = $('div.modal').omniWindow();
        $modal.trigger('show');
    }
    function preValidate($form){
        //Card Number
        $form.find('input[name="card[number]"]').payment('formatCardNumber');
        $form.find('input[name="card[expiry]"]').payment('formatCardExpiry');
        $form.find('input[name="card[cvv]"]').payment('formatCardCVC');

        //Attach a focusout handler to show card type
        $form.find('input[name="card[number]"]').off().focusout(function(){
            var cardType = $.payment.cardType(this.value);
            if(cardType!=null){
                $form.find('.card_image').css('background', "url('icons/"+cardType+".png') no-repeat right center");
            }
        });
    }
    function postValidate($form){
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
    }

    function clearSubmission(){
        $('form.body .submit').removeAttr('disabled');
        $('div.modal').data('busy', false);
    }
    function createlightBox(templateUrl){
        //Make an ajax request to template_url, fetch the template
        //replace the contents

        //Create the overlay

        $.get(templateUrl, function(template){
            var html = $.tmpl(template, $(RazorPayScript).data());
            html.appendTo('body');
            preValidate($('form.body'));
            $('form.body').submit(function(e){
                //Handles the form submission
                var submission  = formsubmit.call(this,e);//This variable stores whether we are submitting the form or not
                if(submission){
                    $('form.body .submit').attr('disabled','disabled');//Disable the input button to prevent double submissions
                    //Marks the modal window as busy so it is not closable
                    $('div.modal').data('busy', true);
                }
                else{
                    clearSubmission();
                }
                e.preventDefault();//So that form is not submitted by the browser, but by us over ajax
            });
        });
    }

    function formsubmit(){
        
        var merchantKey = $(this).find('input[name="key"]').val();
        var expiry = $(this).find('input[name="card[expiry]"]').val();
        $(this).append("<input type='hidden' name='card[expiry_month]' value='"+expiry.substr(0,2)+"'>");
        $(this).append("<input type='hidden' name='card[expiry_year]' value='"+expiry.replace(/[ \/]/g,'').substr(2)+"'>");
        //strip all spaces and backslashes, and then cut off first two digits (month);

        var data = $(this).serialize();
        var errors = postValidate($(this));
        if(errors.length > 0){//If we have more than one errors
            //Cleanup a bit
            $(this).find("input[name='card[expiry_month]']").remove();
            $(this).find("input[name='card[expiry_year]']").remove();

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
        $(this).find('input[name="expiry"]').remove();//Remove the singly expiry field
        $.getJSON('http://'+merchantKey+'@api.razorpay.dev/transactions/jsonp?callback=?', data, function(response){
            if(response.exception){
                $('form .submit .text').text('Server Error').show().parent().addClass('error');
                clearSubmission();
            }
            else if(response.error){
                $('.error_box').html('<li>'+response.error.message+'</li>');
                clearSubmission();
            }
            else if(response.callbackUrl){
                $('div.modal').html('<iframe></iframe>');

                var autosubmitformTemplate = '<!doctype html> \
                    <html> \
                        <head>\
                        </head>\
                        <body>\
                            <form method="POST" action = "${data.url}" id="rzp-dcform">\
                                <input type="hidden" name="PaReq" value="${data.PAReq}">\
                                <input type="hidden" name="MD" value="${data.paymentid}">\
                                <input type="hidden" name="TermUrl" value="${callbackUrl}">\
                                <input style="display:none" type="submit" value="Submit">\
                            </form>\
                            Your request is being processed\
                            <script>\
                                var form = document.getElementById(\'rzp-dcform\');\
                                form.submit();\
                            </script>\
                        </body>\
                    </html>';
                var div = document.createElement('div');
                $.tmpl(autosubmitformTemplate, response).appendTo(div);
                $('div.modal iframe').get()[0].contentWindow.document.write(div.innerHTML);
                //This form should autosubmit
                //Now we need to resize the modal box so as to accomodate 3dsecure.
                $('div.modal, div.modal iframe').width('1000px').height('500px');
                center('div.modal');
                /* global XD */
                XD.receiveMessage(function(message){
                    successCall(message.data);
                });
            }else{
                successCall(response);
            }
        });
        return true;
    }

    function successCall(data){
        var inputs='';
        for(var i in data)
        {
            //For fields like udf, which are an array themselves
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
        $(RazorPayForm).html(inputs);
        $(RazorPayForm).submit();
    }

    /** Now everything is defined */
    //Start by creating a new button to press
    var button = document.createElement('button');
    $(button).click(function(e){
        showLightBox();
        e.preventDefault();
    }).html('Pay with Card')
    .appendTo('body');
    createlightBox('src/templates/modal.tmpl');//Create the lightbox but don't show it yet
    $('<div class="ow-overlay ow-closed"></div> ').appendTo("body");
})();