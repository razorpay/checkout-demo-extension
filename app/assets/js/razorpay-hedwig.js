/* global Razorpay */
/* jshint -W027 */
(function(){
  'use strict';

  var $ = Razorpay.$;
  var Popup = Razorpay.Popup;
  var discreet = Razorpay.discreet;
  var roll = Razorpay.roll || $.noop;

  discreet.popupClose = function(){
    try{
      if(this.popup && typeof this.popup.close == 'function'){
        this.popup.close();
        if(this.popup.window && this.popup.window.closed){
          return;
        }
        var self = this;
        var popup_close = function(){
          discreet.hedwig.sendMessage('{"pingback": "payment_complete"}', '*', self.popup.window);
        }
        if(this.popup._loaded){
          popup_close();
        } else {
          this.popup.loaded = popup_close;
        }
      }
    } catch(e){
      roll('Error closing popup', e.message);
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
      roll('unexpected api response', data);
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
        discreet.sendMetadata(this);
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
      if(response.payment_id)
        this.payment_id = response.payment_id;

      var nextRequest = response.request;
      var callback_url = this.data.callback_url;

      if(typeof nextRequest == 'object'){
        if(nextRequest.url){
          if(callback_url)
            discreet.nextRequestRedirect(nextRequest);
          else
            discreet.navigatePopup.call(this, nextRequest);
        }
      } else {
        discreet.error.call(this, response);
        roll('unexpected api response', response);
      }
    }
  }

  discreet.error = function(response){
    // this == request
    if(typeof this.error == 'function'){
      this.error.call(null, response); // dont expose request as this
    }
    if(this.popup)
      discreet.popupClose.call(this);
  }

  discreet.getAjaxSuccess = function(request){
    return function(response){
      
      if (response.razorpay_payment_id) {
        discreet.paymentSuccess.call(request, response);
      }
      else if(response.error){
        discreet.error.call(request, response);
      }

      else if(response.version){
        var successCallback = discreet.apiResponseHandler[response.version];
        if(typeof successCallback == 'function'){
          return successCallback.call(request, response);
        }
      }

      else {
        discreet.error.call(request, response);
        roll('unexpected api response', response);
      }
    }
  }
  
  // send order data to popup as soon as it gets loaded
  discreet.sendMetadata = function(request){
    var options = request.options;
    var message = {
      metadata: {
        amount: parseInt(options.amount)/100,
        description: options.description,
        name: options.name
      }
    }
    discreet.hedwig.sendMessage(message, '*', request.popup.window);
  }

  discreet.setupPopup = function(request){
    var options = request.options;

    discreet.hedwig.setupCC(options.protocol + '://' + options.hostname + '/crossCookies.php');
    discreet.xdm.addMessageListener(discreet.XDCallback, request);

    var popup = request.popup = new Popup(options.protocol + '://' + options.hostname + '/' + 'processing.php');
    if (typeof request.error == 'function'){
      popup.onClose(discreet.getPopupClose(request));
    }

    popup._loaded = false;
    popup.loaded = $.noop;
    
    try{
      var info;
      if(typeof popup.window == 'undefined'){
        info = "Popup window inaccessible";
      } else if(popup.window && popup.window.closed){
        info = "Popup window closed";
      } else {
        info = "Popup window opened";
      }
      roll(null, info, 'info');
    } catch(e){
      roll('Error accessing popup', + e.message);
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
    popup.loaded = function(){
      discreet.hedwig.sendMessage(nextRequest, '*', popup.window);
    }
    if(popup._loaded === true){
      popup.loaded();
    }
  }

  discreet.getPopupClose = function(request){
    return function(){
      discreet.xdm.removeMessageListener();

      request.error({
        error: {
          description: 'Payment cancelled'
        }
      })

      if(request.payment_id){
        $.ajax({
          url: discreet.makeUrl(request.options) + '/payments/'+request.payment_id+'/cancel',
          data: {key_id: request.options.key}
        })
      }
    }
  }
})();
