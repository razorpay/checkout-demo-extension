/* global Razorpay */
/* jshint -W027 */
(function(){
  'use strict';

  var $ = Razorpay.prototype.$;
  var Hedwig = Razorpay.prototype.Hedwig;
  var Popup = Razorpay.prototype.Popup;
  var discreet = Razorpay.prototype.discreet;

  discreet.popupClose = function(){
    try{
      if(this.popup && typeof this.popup.close == 'function'){
        this.popup.close();
        if(this.popup.window && this.popup.window.closed){
          return;
        }
        var self = this;
        var popup_close = function(){
          self.rzp.hedwig.sendMessage('{"pingback": "payment_complete"}', '*', self.popup.window);
        }
        if(this.popup._loaded){
          popup_close();
        } else {
          this.popup.loaded = popup_close;
        }
      }
    } catch(e){
      window.Rollbar && Rollbar.error("Error closing popup: " + e.message);
    }
  }
  discreet.paymentSuccess = function(data){
    // this == request
    if(this.popup && typeof this.popup.close == 'function'){
      discreet.popupClose.call(this);
    }
    if(typeof this.success == 'function' && typeof data.razorpay_payment_id == 'string' && data.razorpay_payment_id){
      var returnObj = 'signature' in data ? data : {razorpay_payment_id: data.razorpay_payment_id};
      this.success.call(null, returnObj); // dont expose request as this
    } else if(typeof this.error == 'function'){
      this.error({description: 'Unable to parse server response'});
    }
  }

  discreet.XDCallback = function(message, data){
    // this == request
    // checking source url
    if(!(this.popup.window === message.source || /^https:\/\/[a-z]+\.razorpay\.com/.test(message.origin))){
      return;
    }

    if(data.source === 'popup'){
      if(!this.popup._loaded){
        this.popup._loaded = true;
        this.popup.loaded();
      }
      return;
    }

    if(typeof this.popup != 'undefined'){
      discreet.popupClose.call(this);
    }

    if (data.error && data.error.description){
      if(typeof this.error === 'function'){
        this.error(data);
      }
    } else {
      discreet.paymentSuccess.call(this, data);
    }
    // remove postMessage listener
    discreet.xdm.removeMessageListener();
  };

  discreet.apiResponseHandler = {
    '1' : function(response){
      // this == request

      var payment_id = response.payment_id;
      this.payment_id = payment_id;
      var error = response.error;
      var request = response.request;
      var success = response.success;

      if(!payment_id || typeof error == 'object'){
        return discreet.error.call(this, response);
      }

      else if(success){
        discreet.paymentSuccess.call(this, {razorpay_payment_id: payment_id});
      }

      else if(typeof request == 'object'){
        if(request.url){
          return discreet.navigatePopup.call(this, request);
        }
      }
    }
  }

  discreet.error = function(response){
    // this == request
    discreet.popupClose.call(this);
    if(typeof this.error == 'function'){
      this.error.call(null, response); // dont expose request as this
    }
  }

  discreet.getAjaxSuccess = function(request){
    return function(response){
      if(response.version){
        var successCallback = discreet.apiResponseHandler[response.version];
        if(typeof successCallback == 'function'){
          return successCallback.call(request, response);
        }
      }
      if (response.razorpay_payment_id) {
        discreet.paymentSuccess.call(request, response);
      }
      // else version 0
      else if (response.http_status_code !== 200){
        discreet.error.call(request, response);
      }

      else if (response.callbackUrl){
        var nextRequest = {
          autosubmit: response.data,
          rzp: 1
        }
        nextRequest.autosubmit.callbackUrl = response.callbackUrl;
        discreet.navigatePopup.call(request, nextRequest);
      }

      else if (response.redirectUrl){
        var nextRequest = {
          location: response.redirectUrl,
          rzp: 1
        };
        discreet.navigatePopup.call(request, nextRequest);
      }

      else discreet.error.call(request, response);
    }
  }
  discreet.setupPopup = function(request){
    var rzp = request.rzp;
    if(!rzp.hedwig){
      rzp.hedwig = new Hedwig({
        ccHubLocation: rzp.options.protocol + '://' + rzp.options.hostname + '/crossCookies.php'
      });
    }

    discreet.xdm.addMessageListener(discreet.XDCallback, request);

    var popup = request.popup = new Popup(rzp.options.protocol + '://' + rzp.options.hostname + '/' + 'processing.php');
    if (typeof request.error == 'function'){
      popup.onClose(discreet.getPopupClose(request));
    }

    popup._loaded = false;
    popup.loaded = function(){};
    try{
      var info;
      if(typeof popup.window == 'undefined'){
        info = "Popup window inaccessible";
      } else if(popup.window && popup.window.closed){
        info = "Popup window closed";
      } else {
        info = "Popup window opened";
      }
      window.Rollbar && Rollbar.info(info);
    } catch(e){
      window.Rollbar && Rollbar.error("Error accessing popup: " + e.message);
    }
  }

  discreet.navigatePopup = function(nextRequest){
    // this == request
    var popup = this.popup;
    if(!(popup instanceof Popup)){
      return this.error({
        error: {
          description: 'Unable to navigate to bank site'
        }
      });
    }
    var rzp = this.rzp;
    popup.loaded = function(){
      rzp.hedwig.sendMessage(nextRequest, '*', popup.window);
    }
    if(popup._loaded === true){
      popup.loaded();
    }
  }

  discreet.getPopupClose = function(request){
    return function(){
      request.error({
        error: {
          description: 'Payment cancelled'
        }
      })
      // if(request.payment_id)
      //   $.get(discreet.makeUrl(request.rzp) + '/payments/'+request.payment_id+'/cancel');
    }
  }

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
      var redirForm = $('<form style="display: none" action="'+url+'/payments" method="post"></form>');
      var formHTML = '';
      for(var i in rdata){
        var j = i.replace(/"/g,''); // attribute sanitize
        formHTML += '<input type="hidden" name="'+j+'" value="'+rdata[i]+'">';
      }
      redirForm.html(formHTML).appendTo('body');
      redirForm[0].submit();
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

  Razorpay.prototype.getMethods = function(callback){
    var rzp = this;
    return $.ajax({
      url: discreet.makeUrl(this) + this.options.methodsUrl,
      data: {key_id: this.options.key},
      timeout: 30000,
      dataType: 'jsonp',
      success: function(response){
        if (!('error' in response)){
          delete response.version;
          rzp.paymentMethods = response;
        }
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
  }

  discreet.initRazorpay = function(){
    if(typeof this.hedwig === 'undefined'){
      this.hedwig = new Hedwig({
        ccHubLocation: this.options.protocol + '://' + this.options.hostname + '/crossCookies.php'
      });
    }
  }

})();
