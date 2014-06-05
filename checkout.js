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
        $el = $($el);
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
        $form.find('.card_image').css('background', "url('icons/"+cardType+".png') no-repeat right center");

    }
    function postValidate($form){
        var cardNumber = $form.find('input[name="card[number]"]').val();
        var expiry_month = $form.find('input[name="card[expiry_month]"]').val();
        var expiry_year = $form.find('input[name="card[expiry_year]"]').val();
        var cvc = $form.find('input[name="card[cvv]"]').val();
        return $.payment.validateCardNumber(cardNumber) 
                && $.payment.validateCardExpiry(expiry_month, expiry_year) 
                && $.payment.validateCardCVC(cvc);
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
            $('form.body').submit(function(e){
                //Disable the input button
                $('form .submit').attr('disabled','disabled');
                //Marks the modal window as busy so it is not closable
                $('div.modal').data('busy', true);
                //Handles the form submission
                formsubmit.call(this,e);
                e.preventDefault();//So that form is not submitted by the browser, but by us over ajax
            });
        });
    }

    function formsubmit(e){
        var merchant_key = $(this).find('input[name="key"]').val();
        var expiry = $(this).find('input[name="card[expiry]"]').val();
        $(this).find('input[name="expiry"]').remove();//Remove the singly expiry field
        $(this).append("<input type='hidden' name='card[expiry_month]' value='"+expiry.substr(0,2)+"'>");
        $(this).append("<input type='hidden' name='card[expiry_year]' value='"+expiry.substr(-2)+"'>");
        var data = $(this).serialize();
        if(!postValidate($(this))){
            alert("Form validation failed");
            return false;
        }
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
        }).error()
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