/* global Razorpay */
/* jshint -W027 */

!function(){
  'use strict';

  var $ = Razorpay.$;
  var Popup = Razorpay.Popup;
  var discreet = Razorpay.discreet;
  var roll = Razorpay.roll || $.noop;

  var popupRequest = null;

  discreet.setupPopup = function(request, url){
    if(popupRequest){
      return console.error('Razorpay: another payment popup is open');
    }
    popupRequest = request;
    var options = request.options;
    var data = request.data;
    if(request.postmessage === false){
      window.onComplete = _rahe.onComplete;
    }
    else {
      $.addMessageListener(_rahe.onmessage, request);
    }

    try{
      var popup = request.popup = new Popup('');
      popup.window.document.write(Razorpay.templates.popup({
        data: request.data,
        image: options.image,
        url: url
      }));
      popup.window.document.close();

      popup.onClose(function(){
        _rahe.onComplete('{"error":{"description":"Payment cancelled"}}');
      })
      var info;
      if(typeof popup.window == 'undefined'){
        info = "Popup window inaccessible";
      } else if(popup.window && popup.window.closed){
        info = "Popup window closed";
      } else {
        info = "Popup window opened";
      }
      roll(info, {image: options.image, name: options.name, description: options.description});
    } catch(e){
      roll('Error accessing popup: ' + e.message);
    }
  }

  var _rahe = {
    onmessage: function(e){
      if(discreet.makeUrl(popupRequest.options).indexOf(e.origin) !== 0){
        return roll('message received from origin', e.origin);
      }
      _rahe.onComplete(e.data);
    },
    onComplete: function(data){
      if(typeof popupRequest !== 'object')
        return;

      if(typeof data === 'string')
        data = JSON.parse(data);

      var popupRequest2 = popupRequest; // make a copy
      setTimeout(function(){
        _rahe.handleResponse(popupRequest2, data);
      })

      try{
        popupRequest.popup.close();
      } catch(e){
        roll(e.message);
      }
      popupRequest = null;
      $.removeMessageListener();
      return true; // if true, popup closes itself.
    },
    handleResponse: function(popupRequest, data){
      if (data.error && data.error.description){
        if(typeof popupRequest.error === 'function'){
          popupRequest.error(data);
        }
      }
      else if(typeof popupRequest.success == 'function' && typeof data.razorpay_payment_id == 'string' && data.razorpay_payment_id){
        var returnObj = 'signature' in data ? data : {razorpay_payment_id: data.razorpay_payment_id};
        popupRequest.success.call(null, returnObj); // dont expose request as this
      }
      else if(typeof popupRequest.error == 'function'){
        popupRequest.error({description: 'Unable to parse server response'});
        roll('unexpected api response', data);
      }
    }
  }
  // discreet.apiResponseHandler = {
  //   '1' : function(response){
  //     // this == request
  //     if(response.payment_id)
  //       this.payment_id = response.payment_id;

  //     var nextRequest = response.request;
  //     var callback_url = this.data.callback_url;

  //     if(typeof nextRequest == 'object'){
  //       if(nextRequest.url){
  //         if(callback_url)
  //           discreet.nextRequestRedirect(nextRequest);
  //         else
  //           discreet.navigatePopup.call(this, nextRequest);
  //       }
  //     } else {
  //       discreet.error.call(this, response);
  //       roll('unexpected api response', response);
  //     }
  //   }
  // }

  // discreet.error = function(response){
  //   // this == request
  //   if(typeof this.error == 'function'){
  //     this.error.call(null, response); // dont expose request as this
  //   }
  //   if(this.popup) popupClose.call(this);
  // }

  // discreet.getAjaxSuccess = function(request){
  //   return function(response){

  //     if (response.razorpay_payment_id) {
  //       discreet.paymentSuccess.call(request, response);
  //     }
  //     else if(response.error){
  //       discreet.error.call(request, response);
  //     }

  //     else if(response.version){
  //       var successCallback = discreet.apiResponseHandler[response.version];
  //       if(typeof successCallback == 'function'){
  //         return successCallback.call(request, response);
  //       }
  //     }

  //     else {
  //       discreet.error.call(request, response);
  //       roll('unexpected api response', response);
  //     }
  //   }
  // }


  // discreet.navigatePopup = function(nextRequest){
  //   // this == request
  //   var popup = this.popup;
  //   if(!(popup instanceof Popup)){
  //     return this.error({
  //       error: {
  //         description: 'Unable to navigate to bank site'
  //       }
  //     });
  //   }
  //   _hedwig.sendMessage(nextRequest, '*', popup.window);
  // }
  /* INLINE_TESTING */
}();
