/* global Razorpay */
/* jshint -W027 */

(function(){
  'use strict';

  var $ = Razorpay.prototype.$;
  var doT = Razorpay.prototype.doT;
  var discreet = Razorpay.prototype.discreet;

  Razorpay.prototype.open = function(){
    var $body = $('body')
    discreet.merchantData.bodyOverflow = $body[0].style.overflow; // dont use $body.css, that will give real css value, we want just the js override, preferably blank string.
    $body.css('overflow', 'hidden');

    this.hedwig.receiveMessage(discreet.XDCallback, this);
    var frame = document.createElement('iframe');
    this.checkoutFrame = frame;
    frame.className = 'razorpay-checkout-frame';
    frame.setAttribute('style', 'z-index: 9999; display: block; background: rgba(0, 0, 0, 0.1); border: 0px none transparent; overflow: hidden; visibility: visible; margin: 0px; padding: 0px; position: fixed; left: 0px; top: 0px; width: 100%; height: 100%;');
    frame.setAttribute('allowtransparency', 'true');
    frame.setAttribute('frameborder', '0');
    frame.src = discreet.checkoutUrl + 'checkout.html';
    
    var parent = $(this.options.parent);
    if(!parent.is(':visible'))
      parent = $body
    parent.append(frame);
  }

  discreet.parseScriptOptions = function(options){
    var category, dotPosition, i, ix, property;
    for (i in options) {
      ix = i.indexOf(".");
      if (ix > -1) {
        dotPosition = ix;
        category = i.substr(0, dotPosition);
        property = i.substr(dotPosition + 1);
        options[category] = options[category] || {};
        options[category][property] = options[i];
        delete options[i];
      }
    }
    return options;
  };

  discreet.addButton = function(rzp){
    var button = document.createElement('input');
    button.type = 'button';
    button.value = 'Pay Now';
    button.className = 'razropay-payment-button';
    $(button).click(function(e){
      rzp.open();
      e.preventDefault();
    }).appendTo(discreet.currentScript.parentNode);
  };

  var key = discreet.currentScript.getAttribute('data-key');
  if (key && key.length > 0){
    var opts = $(discreet.currentScript).data();
    var options = discreet.parseScriptOptions(opts);
    discreet.addButton(new Razorpay(options));
  }

  discreet.onFrameMessage = function(data){
    // this == rzp
    if(!this.checkoutFrame){
      return;
    }
    var event = data.event;
    if(event == 'load'){
      var options = {
        prefill: this.options.prefill,
        notes: this.options.notes
      }
      for(var i in this.options){
        var value = this.options[i];
        if(typeof value == 'function'){
          options[i] = true; // indicating callbacks do exist
        } else if(typeof value != 'object'){ // safe for stringify
          options[i] = value;
        }
      }

      var response = {
        options: options
      }
      return this.checkoutFrame.contentWindow.postMessage(JSON.stringify(response), '*');
    } else if (event == 'submit'){
      
    } else if (event == 'cancel'){
      if(typeof this.options.oncancel == 'function')
        this.options.oncancel()
    } else if (event == 'hidden'){
      if(typeof this.options.onhidden == 'function')
        this.options.onhidden()
    }
  }
})()