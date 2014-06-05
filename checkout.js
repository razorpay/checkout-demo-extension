(function(){
    "use strict";
    //Start by creating a new button to press
    var button = document.createElement('button');

    var RazorPayScript = document.currentScript || (function() {
        var scripts = document.getElementsByTagName('script');
        return scripts[scripts.length - 1];
    })();

    var RazorPayForm = $(RazorPayScript).parent();

    button.onclick = createLightBox('./template.html');

    var center = function (selector) {
        var $el = $(selector);
        $el.css("position","absolute");
        $el.css("top", ( $(window).height() - $el.height() ) / 2  + "px");
        $el.css("left", ( $(window).width() - $el.width() ) / 2 + "px");
        //The following two are needed for clearing omniWindow settings
        $el.css('margin-left','auto');
        $el.css('margin-top','auto');
        return this;
    }

    function preValidate($form){
        //Card Number
        $form.find('input[name="card[number]"]').payment('formatCardNumber');
        $form.find('input[name="card[expiry]"]').payment('formatCardExpiry');
        $form.find('input[name="card[cvv]"]').payment('formatCardCVC');
        var number = $form.find('input[name="card[number]"]').val();
        var cardType = $.payment.cardType(number);
        if(cardType!=null)
            $form.find('.card_image').css('background', "url('icons/"+cardType+".png') no-repeat right center");
    }
    function postValidate($form){
        var cardNumber = $form.find('input[name="card[number]"]').val();
        var expiry_month = $form.find('input[name="card[expiry_month]"]').val();
        var expiry_year = $form.find('input[name="card[expiry_year]"]').val();
        var cvc = $form.find('input[name="card[cvv]"]').val();

        var errors = [];
        if(!$.payment.validateCardNumber(cardNumber)){
            $form.find('input[name="card[number]"]').addClass('invalid');
            errors.push('Invalid Credit Card Number');
        }

        if(!$.payment.validateCardExpiry(expiry_month, expiry_year)){
            $form.find('input[name="card[expiry]"]').addClass('invalid');
            errors.push('Invalid Expiry Date');
        }

        if(!$.payment.validateCardCVC(cvc)){
            $form.find('input[name="card[cvv]"]').addClass('invalid');
            errors.push('Invalid CVV Number');
        }
        return errors;
    }

    function createLightBox(template_url){
        //Make an ajax request to template_url, fetch the template
        //replace the contents

        //Create the overlay
        $('<div class="ow-overlay ow-closed"></div> ').appendTo("body");

        $.get(template_url, function(template){
            var html = $.tmpl(template, $(RazorPayScript).data());
            html.appendTo('body');
            var $modal = $('div.modal').omniWindow();
            $modal.trigger('show');
            preValidate($('form'));
            $('form').submit(function(e){
                //Handles the form submission
                var submission  = formsubmit.call(this,e);//This variable stores whether we are submitting the form or not
                if(submission){
                    $('form .submit').attr('disabled','disabled');//Disable the input button to prevent double submissions
                    //Marks the modal window as busy so it is not closable
                    $('div.modal').data('busy', true);
                }
                else{
                    $('form .submit').removeAttr('disabled');
                    $('div.modal').data('busy', false);
                }
                e.preventDefault();//So that form is not submitted by the browser, but by us over ajax
            });
        });
    }

    function formsubmit(e){
        var merchant_key = $(this).find('input[name="key"]').val();
        var expiry = $(this).find('input[name="card[expiry]"]').val();
        
        $(this).append("<input type='hidden' name='card[expiry_month]' value='"+expiry.substr(0,2)+"'>");
        $(this).append("<input type='hidden' name='card[expiry_year]' value='"+expiry.substr(-2)+"'>");

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
            var html = $.tmpl(template,{err:errors}).appendTo(div)
            $('.error_box').html(div.innerHTML);
            return false;
        }
        $(this).find('input[name="expiry"]').remove();//Remove the singly expiry field
        $.getJSON('http://'+merchant_key+'@api.razorpay.dev/transactions/jsonp?callback=?', data, function(response){
            if(response.exception){
                $('form .submit .text').text('Server Error').show().parent().addClass('error');
                $('form .submit .ring').hide();
            }
            else if(response.callbackUrl){
                $('div.modal').html('<iframe></iframe>');

                var autosubmit_form_template = '<!doctype html> \
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
                    </html>'
                var div = document.createElement('div');
                $.tmpl(autosubmit_form_template, response).appendTo(div);
                $('div.modal iframe').get()[0].contentWindow.document.write(div.innerHTML);
                //This form should autosubmit
                //Now we need to resize the modal box so as to accomodate 3dsecure.
                $('div.modal, div.modal iframe').width('1000px').height('500px');
                center('div.modal');
                XD.receiveMessage(function(message){
                    successCall(message.data);
                });
            }else{
                successCall(response);
            }
        })
        return true;
    }

    function successCall(data){
        var inputs='';
        for(var i in data)
        {
            //For fields like udf, which are an array themselves
            if(typeof data[i]=='object')
                for(var j in data[i])
                    inputs+='<input type="hidden" name="'+i+'['+j+']" value="'+data[i][j]+'">'
            else
                inputs+='<input type="hidden" name="'+i+'" value="'+data[i]+'">'
        }
        $(RazorPayForm).html(inputs);
        $(RazorPayForm).submit();
    }
})();