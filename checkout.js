//Start by creating a new button to press
var button = document.createElement('button');

var RazorPayScript = document.currentScript || (function() {
    var scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
})();

var RazorPayForm = $(RazorPayScript).parent();

button.onclick = createLightBox('./template.html');

$.fn.Rzpcenter = function () {
   this.css("position","absolute");
   this.css("top", ( $(window).height() - this.height() ) / 2  + "px");
   this.css("left", ( $(window).width() - this.width() ) / 2 + "px");
   //The following two are needed for clearing omniWindow settings
   this.css('margin-left','auto');
   this.css('margin-top','auto');
   return this;
}

function createLightBox(template_url){
    //Make an ajax request to template_url, fetch the template
    //replace the contents

    //Create the overlay
    $('<div class="ow-overlay ow-closed"></div> ').appendTo("body");

    

    $.get(template_url, function(template){
        var html = $.tmpl(template, $(RazorPayScript).data());
        html.appendTo('body');
        
        $modal = $('div.modal').omniWindow()
        $modal.trigger('show');


        //Attach some evens to the modal

        $('.close-button').click(function(e){
            e.preventDefault();
            $modal.trigger('hide');
        });

        $('form.body').submit(formsubmit);
        $('div.modal').data('busy', true);
        //Marks the modal window as busy so it is not closable
    });
}

function formsubmit(e){
    var merchant_key = $(this).find('input[name="key"]').val();
    var expiry = $(this).find('input[name="card[expiry]"]').val();
    $(this).find('input[name="expiry"]').remove();//Remove the singly expiry field
    $(this).append("<input type='hidden' name='card[expiry_month]' value='"+expiry.substr(0,2)+"'>");
    $(this).append("<input type='hidden' name='card[expiry_year]' value='"+expiry.substr(-2)+"'>");
    var data = $(this).serialize();
    $.getJSON('https://'+merchant_key+'@api.razorpay.com/transactions/jsonp?callback=?', data, function(response){
        if(response.callbackUrl){
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
            $('div.modal, div.modal iframe').width('800px').height('500px');
            $('div.modal').Rzpcenter();
            XD.receiveMessage(function(message){
                successCall(message.data);
            });
        }else{
            successCall(response);
        }
    });
    e.preventDefault();
}

function successCall(data){
    var inputs='';
    for(i in data)
    {
        //For fields like udf, which are an array themselves
        if(typeof data[i]=='object')
            for(j in data[i])
                inputs+='<input type="hidden" name="'+i+'['+j+']" value="'+data[i][j]+'">'
        else
            inputs+='<input type="hidden" name="'+i+'" value="'+data[i]+'">'
    }
    $(RazorPayForm).html(inputs);
    $(RazorPayForm).submit();
}