/* global Razorpay */
/* jshint -W027 */
(function(){
  'use strict';

  var $ = Razorpay.prototype.$;
  var Hedwig = Razorpay.prototype.Hedwig;
  var Popup = Razorpay.prototype.Popup;
  var discreet = Razorpay.prototype.discreet;

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

    // Close the popup in case of netbanking
    if(typeof this.popup !== 'undefined'){
      this.popup.close();
    }

    if (data.error && data.error.description){
      if(typeof this.error === 'function'){
        this.error(data);
      }
    } else {
      if(typeof this.success === 'function'){
        this.success(data);
      }
    }

    // remove postMessage listener
    discreet.removeMessageListener();
  };

  discreet.apiResponseHandler = {
    '1' : function(response){
      // this == request

      var payment_id = response.payment_id;
      var error = response.error;
      var request = response.request;
      var success = response.success;

      if(!payment_id || typeof error == 'object'){
        return discreet.error.call(this, response);
      }

      else if(success){
        return 
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
    if(this.popup && typeof this.popup.close == 'function'){
      this.popup.close();
    }
    if(typeof this.error == 'function'){
      this.error.call(null, response); // dont expose request as this
    }
  }
  discreet.success = function(response){
    // this == request
    if(this.popup && typeof this.popup.close == 'function'){
      this.popup.close();
    }
    if(typeof this.success == 'function'){
      this.success.call(null, response); // dont expose request as this
    }
  }

  discreet.getSuccessHandler = function(request){
    return function(response){
      if(response.version){
        var successCallback = discreet.apiResponseHandler[response.version];
        if(typeof successCallback == 'function'){
          return successCallback.call(request, response);
        }
      }    

      // else version 0
      if (response['http_status_code'] !== 200){
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
        }
        discreet.navigatePopup.call(request, nextRequest);
      }
      
      else if (response.razorpay_payment_id) {
        response.payment_id = response.razorpay_payment_id;
        response.success = true;
        delete response.razorpay_payment_id;
        discreet.success.call(request, response);
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
    
    discreet.addMessageListener(discreet.XDCallback, request);

    var popup = request.popup = new Popup(rzp.options.protocol + '://' + rzp.options.hostname + '/' + 'processing.php');

    if (typeof request.error == 'function'){
      popup.onClose(discreet.getPopupClose(request));
    }
    
    popup._loaded = false;
    popup.loaded = function(){};
  }

  discreet.navigatePopup = function(nextRequest){
    // this == request
    var popup = this.popup;
    if(!popup){
      return this.error({
        error: {
          description: 'Unable to navigate to bank site'
        }
      })
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
    }
  }

  /**
    method for payment data submission to razorpay api
    @param request  contains payment data and optionally callbacks to success, error and element to put iframe in
  */
  Razorpay.prototype.submit = function(request){

    // TODO better validation
    // data['card[number]'] = data['card[number]'].replace(/\ /g, '');
    // data['card[expiry_month]'] = expiry[0];
    // data['card[expiry_year]'] = expiry[1];
    if(typeof request.data !== 'object'){
      return false;
    }

    var errors = this.validateData(request.data);
    if(errors && errors.length){
      return false;
    }

    request.data.key_id = this.options.key;
    request.rzp = this;

    discreet.setupPopup(request);

    return $.ajax({
      url: discreet.makeUrl(this) + this.options.jsonpUrl,
      dataType: 'jsonp',
      success: discreet.getSuccessHandler(request),
      timeout: 35000,
      error: request.error,
      data: request.data
    });
  };

  discreet.initRazorpay = function(){
    if(typeof this.hedwig === 'undefined'){
      this.hedwig = new Hedwig({
        ccHubLocation: this.options.protocol + '://' + this.options.hostname + '/crossCookies.php'
      });
    }
    // this.getNetbankingList();
  }
  
})();
