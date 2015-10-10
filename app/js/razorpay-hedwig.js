/* global Razorpay */
/* jshint -W027 */
(function(){
  'use strict';

  var $ = Razorpay.$;
  var Popup = Razorpay.Popup;
  var discreet = Razorpay.discreet;
  var roll = Razorpay.roll || $.noop;

  var popupClose = function(){
    try{
      if(this.popup && typeof this.popup.close == 'function' && this.popup.window){
        this.popup.close();
        if(!this.popup.window.closed)
          roll('Popup window not closed');
      }
    } catch(e){
      roll('Error closing popup: ' + e.message);
    }
  }

  discreet.paymentSuccess = function(data){
    // this == request
    if(this.popup && typeof this.popup.close == 'function'){
      popupClose.call(this);
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

    if(typeof this.popup != 'undefined') popupClose.call(this);

    if (data.error && data.error.description){
      if(typeof this.error === 'function'){
        this.error(data);
      }
    } else {
      discreet.paymentSuccess.call(this, data);
    }
    // remove postMessage listener
    $.removeMessageListener();
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
    if(this.popup) popupClose.call(this);
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

  discreet.setupPopup = function(request, url){
    var options = request.options;
    var data = request.data;

    discreet.hedwig.setupCC(options.protocol + '://' + options.hostname + '/crossCookies.php');
    $.addMessageListener(discreet.XDCallback, request);

    var popup = request.popup = new Popup('about:blank');
    popup.window.document.write(Razorpay.templates.popup({
      data: request.data,
      image: request.options.image,
      url: url
    }));
    popup.window.document.close();

    if (typeof request.error == 'function'){
      popup.onClose(getPopupClose(request));
    }

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
    discreet.hedwig.sendMessage(nextRequest, '*', popup.window);
  }

  var getPopupClose = function(request){
    return function(){
      $.removeMessageListener();

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
  /* INLINE_TESTING */
})();
