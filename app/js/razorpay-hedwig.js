/* global Razorpay */
/* jshint -W027 */

!function(){
  'use strict';

  var $ = Razorpay.$;
  var Popup = Razorpay.Popup;
  var discreet = Razorpay.discreet;
  var roll = Razorpay.roll || $.noop;

<<<<<<< HEAD
  var popupClose = function(){
    try{
      if(this.popup && typeof this.popup.close == 'function' && this.popup.window){
        this.popup.close();
        if(!this.popup.window.closed){
          this.popup.window.postMessage('pingback', '*');
          roll('Popup window not closed');
        }
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
=======
  var popupRequest = null;
>>>>>>> popup2

  window.onComplete = function(data){
    data = JSON.parse(data);
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
    try{
      popupRequest.popup.close();
    } catch(e){
      roll(e.message);
    }
    popupRequest = null;
    return true; // if true, popup closes itself.
  }

  discreet.setupPopup = function(request, url){
    popupRequest = request;
    var options = request.options;
    var data = request.data;

    var popup = request.popup = new Popup('');

    popup.onClose(function(){
      window.onComplete('{"error":{"description":"Payment cancelled"}}');
    })

<<<<<<< HEAD
=======
    popup.window.document.write(Razorpay.templates.popup({
      data: request.data,
      image: options.image,
      url: url
    }));
    popup.window.document.close();

>>>>>>> popup2
    try{
      var popup = request.popup = new Popup('');
      popup.window.document.write(Razorpay.templates.popup({
        data: request.data,
        image: options.image,
        url: url
      }));
      popup.window.document.close();

      if (typeof request.error == 'function'){
        popup.onClose(getPopupClose(request));
      }

      var info;
      if(typeof popup.window == 'undefined'){
        info = "Popup window inaccessible";
      } else if(popup.window && popup.window.closed){
        info = "Popup window closed";
      } else {
        info = "Popup window opened";
      }
<<<<<<< HEAD
      roll(info, {image:options.image, name: options.name, description: options.description}, 'info');
=======
      roll(info, {image: options.image, name: options.name, description: options.description});
>>>>>>> popup2
    } catch(e){
      roll('Error accessing popup: ' + e.message);
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
