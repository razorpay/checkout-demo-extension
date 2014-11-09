/* global $,templates */
(function() {
    "use strict";

    var RazorPayScript = document.currentScript || (function() {

        var scripts = document.getElementsByTagName('script');

        return scripts[scripts.length - 1];
    })();

    var init = function() {
        $('<div class="ow-overlay ow-closed"></div>').appendTo("html");
    };

    var position = function($el) {
        $el.css("position","absolute");

        $el.css("top", ( $(window).height() - $el.height() ) / 4  + "px");

        $el.css("left", ( $(window).width() - $el.width() ) / 2 + "px");

        //
        // The following two are needed for
        // clearing omniWindow settings
        //

        $el.css('margin-left','auto');

        $el.css('margin-top','auto');

        return this;
    };

    var Razorpay = function(options) {
        this.configure(options);
    };

    /**
     * This function is passed an rzp instance and
     * it is saved in Razorpay
     */
    Razorpay.prototype.setXDInstance = function() {
        Razorpay.lastXDInstance = this;
    };

    Razorpay.XDCallback = function(message) {
        var rzp = Razorpay.lastXDInstance;
        rzp.preHandler();

        if(message.data.error && message.data.error.description){
            //In case of error reopen box and show error
            rzp.open();
            rzp.handleAjaxResponse(message.data);
        }
        else{
            rzp.options.handler(message.data);
        }
    };

    Razorpay.prototype.fieldNames = {
        number : 'input[name="card[number]"]',
        expiry : 'input[name="card[expiry]"]',
        cvv: 'input[name="card[cvv]"]',
        name: 'input[name="card[name]"]',
        expiryMonth: 'input[name="card[expiry_month]"]',
        expiryYear: 'input[name="card[expiry_year]"]',
        email: 'input[name="email"]',
        contact: 'input[name="contact"]',
        bank: 'select[name="bank"]'
    };

    Razorpay.prototype.preValidate = function($form) {
        //
        // Card Number
        //
        $form.find(this.fieldNames.number).payment('formatCardNumber');

        $form.find(this.fieldNames.expiry).payment('formatCardExpiry');

        $form.find(this.fieldNames.cvv).payment('formatCardCVC');

        //
        // Attach a focusout handler to show card type
        //
        $form.find(this.fieldNames.number).off('focusout').focusout(function() {
            var cardType = $.payment.cardType(this.value);

            if (cardType != null) {
                $form.find('.rzp-card_image').addClass(cardType);
            }
        });
    };

    /**
     * Validates form fields for Card submission
     *
     * @param  {[type]} $form
     * @return array            array of error messages
     */
    Razorpay.prototype.postValidateCard = function($form) {
        $form.find('input').removeClass('rzp-invalid');

        var cardNumber = $form.find(this.fieldNames.number).val();
        var expiryMonth = $form.find(this.fieldNames.expiryMonth).val();
        var expiryYear = $form.find(this.fieldNames.expiryYear).val();
        var cvv = $form.find(this.fieldNames.cvv).val();
        var name = $form.find(this.fieldNames.name).val();
        var email = $form.find(this.fieldNames.email).val();
        var contact = $form.find(this.fieldNames.contact).val();

        var errors = [];

        if (name === '') {
            $form.find(this.fieldNames.name).addClass('rzp-invalid');
            errors.push('Missing Name');
        }

        if (name.length > 100) {
            $form.find(this.fieldNames.name).addClass('rzp-invalid');
            errors.push('Maximum name length is 100');
        }

        if (email === '') {
            $form.find(this.fieldNames.email).addClass('rzp-invalid');
            errors.push('Missing email address');
        }

        if (email.length > 255) {
            $form.find(this.fieldNames.email).addClass('rzp-invalid');
            errors.push('Maximum email length is 255');
        }

        if (contact === '' ) {
            $form.find(this.fieldNames.contact).addClass('rzp-invalid');
            errors.push('Missing contact number');
        }

        if ((contact.length > 12) ||
            (contact.length < 10)) {
            $form.find(this.fieldNames.contact).addClass('rzp-invalid');
            errors.push('Contact number should be between 10 and 12 digits long');
        }

        if (!/^\d+$/.test(contact)) {
            $form.find(this.fieldNames.contact).addClass('rzp-invalid');
            errors.push('Contact number should be made of entirely digits');
        }

        if (!$.payment.validateCardNumber(cardNumber)) {
            $form.find(this.fieldNames.number).addClass('rzp-invalid');
            errors.push('Invalid Credit Card Number');
        }

        if (!$.payment.validateCardExpiry(expiryMonth, expiryYear)) {
            $form.find(this.fieldNames.expiry).addClass('rzp-invalid');
            errors.push('Invalid Expiry Date');
        }

        if (!$.payment.validateCardCVC(cvv)) {
            $form.find(this.fieldNames.cvv).addClass('rzp-invalid');
            errors.push('Invalid CVV Number');
        }

        return errors;
    };

    /**
     * Validates form fields for Net Banking submission
     *
     * @param  {[type]} $form
     * @return array            array of error messages
     */
    Razorpay.prototype.postValidateNB = function($form) {
        $form.find('input').removeClass('rzp-invalid');

        var bank = $form.find(this.fieldNames.bank).val();

        var errors = [];

        if (bank === '') {
            $form.find(this.fieldNames.bank).addClass('rzp-invalid');
            errors.push('Bank not selected.');
        }

        return errors;
    };

    Razorpay.prototype.clearSubmission = function() {
        this.$el.find('.rzp-submit').removeAttr('disabled');
        this.$el.data('busy', false);
    };

    Razorpay.prototype.createlightBox = function(template) {
        if (this.options.id) {
            //
            // Lets remove the div first
            //
            $('#' + this.options.id).parent().remove();
        }

        this.options.id = (Math.random()).toString(36).replace(/[^a-z]+/g, '');

        var html = $((Handlebars.compile(template))(this.options));
        html.appendTo('body').show()[0].offsetWidth;
        html.addClass('shown').click(function(e){
            if(this === e.target){
                $(this).remove()
            }
        })

        this.$el = $('#' + this.options.id);
        this.preValidate(this.$el.find('form.rzp-body'));
        var self = this;

        this.$el.find('form.rzp-body').submit(function(e) {
            //
            // Handles the form submission
            //
            var submission  = self.formsubmit(this);

            //
            // submission stores whether we are submitting the form or not
            //
            if (submission) {
                //
                // Disable the input button to prevent double submissions
                //
                self.$el.find('.rzp-submit').attr('disabled','disabled');

                //
                // Marks the modal window as busy so it is not closable
                //

                self.$el.data('busy', true);
            }
            else {
                self.clearSubmission();
            }

            //
            // So that form is not submitted by the browser,
            // but by us over ajax
            //
            e.preventDefault();
        });
    };

    Razorpay.prototype.breakExpiry = function(expiry) {
        //
        // Returns month, year as a tuple inside an object
        //
        return {
            month: expiry.substr(0,2),

            //
            // Strip all spaces and backslashes,
            // and then cut off first two digits (month);
            //
            year: expiry.replace(/[ \/]/g,'').substr(2)
        };
    };

    Razorpay.prototype.formsubmit = function(form) {
        var merchantKey = this.options.key;
        var $form = $(form);

        if($form.find(this.fieldNames.bank).length === 0) {
            // CC/DC Submission
            //
            // Break expiry date into month and year
            //
            var expiry = this.breakExpiry($form.find(this.fieldNames.expiry).val());

            $form.find(this.fieldNames.expiryMonth).val(expiry.month);
            $form.find(this.fieldNames.expiryYear).val(expiry.year);

            //
            // Prevent 'expiry' field from being submitted
            // since expiry month and year are being submitted individually
            //
            $form.find(this.fieldNames.expiry).prop('disabled', true);

            var data = $form.serialize();

            //
            // Renable after getting required data
            //
            $(this.fieldNames.expiry).prop('disabled', false);  

            var errors = this.postValidateCard($form);
        } else {
            var data = $form.serialize();

            var errors = this.postValidateNB($form);
        }

        var self = this;

        //
        // If we have more than one errors
        //
        if (errors.length > 0) {
            //
            // Shake the modal window
            //
            this.shake();

            var template = '{{#each err}}\
                    <li>{{$value}}<li>\
                {{/each}}';

            var div = document.createElement('div');

            $((Handlebars(template))({err:errors})).appendTo(div);

            this.$el.find('.rzp-error_box').html(div.innerHTML);

            return false;
        }
        else {
            //
            // Cleanup errors created by any previous attempts
            //
            this.$el.find('.rzp-error_box').html('');
        }

        $.ajax({
            url: this.options.protocol +'://' + merchantKey + '@' + this.options.hostname + '/' +
                this.options.version + this.options.jsonpUrl,
            dataType: 'jsonp',
            context: this,
            success: this.handleAjaxResponse,
            timeout: 35000, // 35 seconds = 30s for gateway + 5s for razorpay
            error: this.handleAjaxError,
            data: data
        });

        return true;
    };

    Razorpay.prototype.handleAjaxError = function() {
        this.$el.find('.rzp-error_box').html('<li>There was an error in handling your request</li>');
        this.clearSubmission();
    };

    Razorpay.prototype.handleAjaxResponse = function(response) {

        if (response.http_status_code != 200 && response.error)
        {
            this.shake();
            if (response.error.field)
            {
                if (this.$el.find('input[name="'+response.error.field+'"]').length)
                {
                    this.$el.find('input[name="'+response.error.field+'"]').addClass('rzp-invalid');
                }
            }


            var defaultMessage = 'There was an error in handling your request';
            var message = response.error.description || defaultMessage;

            this.$el.find('.rzp-error_box').html('<li>' + message + '</li>');
            this.clearSubmission();

        }
        else if (response.callbackUrl) {
            //
            // If a proper response with callbackUrl has been received, then an
            // iframe needs to be opened
            //
            this.$el.html('<iframe></iframe>');

            var autosubmitformTemplate = templates.autosubmit;
            var div = document.createElement('div');
            $((Handlebars.compile(autosubmitformTemplate))(response)).appendTo(div);
            this.$el.find('iframe').get(0).contentWindow.document.write(div.innerHTML);

            //
            // This form should autosubmit
            // Now we need to resize the modal box so as to accomodate 3dsecure.
            //
            $(this.$el).width('1000px').height('500px');
            $(this.$el.find('iframe')).width('1000px').height('500px');

            position(this.$el);

            //
            // Make this instance of rzp the instance called by the XDCallback
            //
            this.setXDInstance();
        }
        else if (response.redirectUrl) {
            //
            // If a proper response with redirectUrl has been received, then an
            // iframe needs to be opened
            //
            this.$el.html('<iframe src=' + response.redirectUrl + '></iframe>');

            //
            // This form should autosubmit
            // Now we need to resize the modal box so as to accomodate 3dsecure.
            //
            $(this.$el).width('1000px').height('500px');
            $(this.$el.find('iframe')).width('1000px').height('500px');

            position(this.$el);

            //
            // Make this instance of rzp the instance called by the XDCallback
            //
            this.setXDInstance();
        }
        else if (response.status) {
            this.preHandler();

            this.options.handler(response);
        }
        else {
            this.$el.find('.rzp-error_box').html('<li>There was an error in handling your request</li>');

            this.clearSubmission();
        }
    };

    Razorpay.prototype.shake = function() {
        var self = this;

        this.$el.addClass('rzp-shake');

        window.setTimeout(function() {
            self.$el.removeClass("rzp-shake");
        }, 150);
    };

    Razorpay.prototype.hide = function() {
        this.clearSubmission();
        this.$modal.trigger('hide.ow');
    };

    Razorpay.prototype.options = {
        protocol: 'https',
        hostname: 'api.razorpay.com',
        version: 'v1',
        jsonpUrl: '/payments/create/jsonp',
        prefill: {
            name: "",
            contact: "",
            email: ""
        },
        // These fields are specified by the merchant
        udf: {
        }
    };

    //
    // We can specify any default options here
    //

    /**
     * This function is called just before control is passed on
     * to the handler specified in options
     */
    Razorpay.prototype.preHandler = function() {
        //
        // Hide the modal window when the transaction is complete
        //
        this.hide();

        // Prepare the lightBox for re-opening
        this.createlightBox(templates.modal);
    };

    /**
     * default handler for success
     * default handler does not care about error or success messages,
     * it just submits everything via the form
     * @param  {[type]} data [description]
     * @return {[type]}      [description]
     */
    Razorpay.prototype.options.handler = function(data) {
        var inputs = '';
        for (var i in data) {
            // For fields like udf, which are an object themselves
            if (typeof data[i] === 'object') {
                for (var j in data[i]) {
                    inputs+='<input type="hidden" name="'+i+'['+j+']" value="'+data[i][j]+'">';
                }
            }
            else {
                inputs+='<input type="hidden" name="'+i+'" value="'+data[i]+'">';
            }
        }
        var RazorPayForm = RazorPayScript.parentElement;
        $(inputs).appendTo(RazorPayForm);
        $(RazorPayForm).submit();
    };

    Razorpay.prototype.setEndpoint = function(protocol, hostname) {
        this.options.protocol = protocol;
        this.options.hostname = hostname;
    };

    /**
     * Now everything is defined
     */

    //
    // Start by creating a new button to press
    //

    /**
     * Creates a new button to press
     */
    Razorpay.prototype.addButton = function() {
        var button = document.createElement('button');
        button.setAttribute('id','rzp-button');
        var self = this;
        $(button).click(function(e) {
            self.open();
            e.preventDefault();
        }).html('Pay with Card')
        .appendTo('body');
    };

    Razorpay.prototype.validateOptions = function() {
        if (typeof this.options.amount === 'undefined') {
            throw new Error("No amount specified");
        }

        if (this.options.amount < 0) {
            throw new Error("Invalid amount specified");
        }

        if (["https", "http"].indexOf(this.options.protocol) < 0) {
            throw new Error("Invalid Protocol specified");
        }

        if (!$.isFunction(this.options.handler)) {
            throw new Error("Handler must be a function");
        }

        if (typeof this.options.key === 'undefined') {
            throw new Error("No merchant key specified");
        }

        if (Object.keys(this.options.udf).length > 15) {
            throw new Error("You can only pass at most 13 fields in the udf object");
        }
    };

    Razorpay.prototype.open = function(options) {
        this.options = $.extend({}, this.options, options);
        this.createlightBox(templates.modal);
        this.$modal = this.$el.rzpomniWindow();
        this.$modal.trigger('show');
        if(this.options.netbanking === true)
            $('.rzp-tabs-container').easytabs();
        position(this.$el);
    };

    Razorpay.prototype.configure = function(options) {
        //
        // The following loop converts property names of the form
        //  x.y = "Value" to proper objects x = {y:"Value"}
        //
        for (var i in options) {
            var ix = i.indexOf('.');

            if (ix > -1) {
                //
                // We have a dot in an option name
                // Break it into 2
                //
                var dotPosition = ix;

                // Get the category
                var category = i.substr(0, dotPosition);
                // Get the property (after the dot)
                var property = i.substr(dotPosition + 1);

                options[category] = options[category] || {};

                options[category][property] = options[i];

                // Delete the existing property
                delete(options[i]);
            }
        }

        if (typeof options === 'undefined') {
            throw new Error("No options specified");
        }

        if (typeof options['key'] === "undefined") {
            throw new Error("No merchant key specified");
        }

        this.options = $.extend({}, this.options, options);
    };

    (function() {

        var key = $(RazorPayScript).data('key');

        if (key && key.length > 0) {
            //
            // If we have a key set, that means we are in auto mode
            // and need to display the button automatically
            //
            var rzp = new Razorpay($(RazorPayScript).data());

            // We leave this unstyled
            rzp.addButton();
        }

        window['Razorpay'] = Razorpay;
        init();

    })();

    //
    // global rzpXD
    //
    rzpXD.receiveMessage(Razorpay.XDCallback);
})();
