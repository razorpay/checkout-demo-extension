/* global Razorpay */
/* jshint -W027 */
(function(){
  'use strict';

  var $ = Razorpay.prototype.$;
  var discreet = Razorpay.prototype.discreet;

  /**
    method for payment data submission to razorpay api
    @param request  contains payment data and optionally callbacks to success, error and element to put iframe in
  */
  Razorpay.prototype.submit = function(request, throwError){
    if(typeof request != 'object' || typeof request.data !== 'object'){
      return false;
    }

    var rdata = request.data;

    var defaultFields = ['amount', 'notes', 'currency'];
    for(var i=0; i<defaultFields.length;i++){
      var field = defaultFields[i];
      if(!(field in rdata) && field in this.options)
        rdata[field] = this.options[field];
    }

    var errors = this.validateData(rdata);
    if(errors && errors.length){
      if(throwError){
        throw new Error("Field: " + errors[0].field + "; Error:" + errors[0].message);
      }
      return false;
    }

    rdata.key_id = this.options.key;

    var url = discreet.makeUrl(this);
    if(this.options.redirect){
      var form = document.createElement('form');
      form.setAttribute('action', url + '/payments');
      form.setAttribute('method', 'post');

      var formHTML = '';
      for(var i in rdata.notes){
        rdata['notes['+i+']'] = rdata.notes[i];
      }
      delete rdata.notes;
      for(i in rdata){
        var j = i.replace(/"/g,''); // attribute sanitize
        formHTML += '<input type="hidden" name="'+j+'" value="'+rdata[i]+'">';
      }
      form.innerHTML = formHTML;
      document.body.appendChild(form);
      form.submit();
      return true;
    } else {
      request.rzp = this;
      discreet.setupPopup(request);
    }

    return $.ajax({
      url: url + this.options.jsonpUrl,
      dataType: 'jsonp',
      success: discreet.getAjaxSuccess(request),
      timeout: 35000,
      error: request.error,
      data: rdata
    });
  };

  /**
   * Validation of data during the time of submitting data
   * to our server through the ajax request
   */
  Razorpay.prototype.validateData = function(data, throwError){
    var errors = [];

    var amount = parseInt(data.amount);
    if (!amount || typeof amount !== 'number' || amount < 0 || String(amount).indexOf('.') !== -1) {
      errors.push({
        message: 'Invalid amount specified',
        field: 'amount'
      });
    }

    if (typeof this.options.key === "undefined") {
      errors.push({
        message: "No merchant key specified",
        field: "key"
      });
    }

    if (this.options.key === "") {
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
  };

})();
