/* global Razorpay */
/* jshint -W027 */
(function(){
  'use strict';

  var $ = Razorpay.prototype.$;
  var discreet = Razorpay.prototype.discreet;
  
  Razorpay.configure = function(overrides) {
    discreet.defaults = discreet.configure(overrides);
  }

  /**
    method for payment data submission to razorpay api
    @param request  contains payment data and optionally callbacks to success, error and element to put iframe in
  */
  Razorpay.payment = {
    authorize: function(request, throwError){
      if(typeof request != 'object' || typeof request.data !== 'object'){
        return false;
      }
      var rdata = request.data;
      var options = request.options;
      if(!options)
        options = request.options = JSON.parse(JSON.stringify(discreet.defaults));

      var defaultFields = ['amount', 'notes', 'currency'];
      for(var i=0; i<defaultFields.length;i++){
        var field = defaultFields[i];
        if(!(field in rdata) && field in options)
          rdata[field] = options[field];
      }

      if(!rdata.key_id)
        rdata.key_id = options.key;
      var errors = this.validate(rdata);
      if(errors && errors.length){
        if(throwError){
          throw new Error("Field: " + errors[0].field + "; Error:" + errors[0].message);
        }
        return false;
      }

      for(var i in rdata.notes){
        rdata['notes['+i+']'] = rdata.notes[i];
      }
      delete rdata.notes;
      
      var url = discreet.makeUrl(options);

      if(options.redirect){
        var form = document.createElement('form');
        form.setAttribute('action', url + '/payments');
        form.setAttribute('method', 'post');
        var formHTML = '';

        for(i in rdata){
          var j = i.replace(/"/g,''); // attribute sanitize
          formHTML += '<input type="hidden" name="'+j+'" value="'+rdata[i]+'">';
        }
        form.innerHTML = formHTML;
        document.body.appendChild(form);
        form.submit();
        return true;
      } else {
        if(!rdata.callback_url && options.callback_url) rdata.callback_url = options.callback_url;
        if(!rdata.callback_url) discreet.setupPopup(request);
        
        return $.ajax({
          url: url + options.jsonpUrl,
          dataType: 'jsonp',
          success: discreet.getAjaxSuccess(request),
          timeout: 35000,
          error: request.error,
          data: rdata
        });
      }
    },

    getMethods: function(callback){
      return $.ajax({
        url: discreet.makeUrl(discreet.defaults) + discreet.defaults.methodsUrl,
        data: {key_id: discreet.defaults.key},
        timeout: 30000,
        dataType: 'jsonp',
        success: function(response){
          if(typeof callback == 'function'){
            callback(response);
          }
        },
        complete: function(xhr, status){
          if(status != "success" && typeof callback == 'function'){
            var response = xhr.responseJSON;
            if(!response || !('error' in response))
              response = {error: true};
            callback(response);
          }
        }
      });
    },
    /**
    * Validation of data during the time of submitting data
    * to our server through the ajax request
    */
    validate: function(data, throwError){
      var errors = [];

      var amount = parseInt(data.amount);
      if (!amount || typeof amount !== 'number' || amount < 0 || String(amount).indexOf('.') !== -1) {
        errors.push({
          message: 'Invalid amount specified',
          field: 'amount'
        });
      }

      if (typeof data.key_id === "undefined") {
        errors.push({
          message: "No merchant key specified",
          field: "key"
        });
      }

      if (data.key_id === "") {
        errors.push({
          message: "Merchant key cannot be empty",
          field: "key"
        });
      }

      if(errors.length && throwError){
        throw new Error("Field: " + errors[0].field + "; Error:" + errors[0].message);
      } else {
        return errors;
      }
    }
  }
})();