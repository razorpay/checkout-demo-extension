/* global Razorpay */
/* jshint -W027 */

(function(){
  'use strict';

  var $ = Razorpay.prototype.$;
  var doT = Razorpay.prototype.doT;

  var discreet = {};

  discreet.rzpscript = document.currentScript || (function() {
    var scripts;
    scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
  })();
  discreet.baseUrl = discreet.rzpscript.src.replace(/(js\/)?[^\/]+$/,'');

  Razorpay.prototype.open = function(){
    this.hedwig.receiveMessage(discreet.XDCallback, this);
    var frame = document.createElement('iframe');
    this.checkoutFrame = frame;
    frame.className = 'razorpay-checkout-frame';
    frame.style='z-index: 9999; display: block; background: rgba(0, 0, 0, 0.1); border: 0px none transparent; overflow: hidden; visibility: visible; margin: 0px; padding: 0px; position: fixed; left: 0px; top: 0px; width: 100%; height: 100%;';
    frame.allowtransparency='true';
    frame.frameborder='0';
    frame.src = discreet.baseUrl + 'checkout.html';
    
    var parent = $(this.options.parent);
    if(!parent.is(':visible'))
      parent = $(document.body)
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
    }).appendTo(discreet.rzpscript.parentNode);
  };

  var key = discreet.rzpscript.getAttribute('data-key');
  if (key && key.length > 0){
    var opts = $(discreet.rzpscript).data();
    var options = discreet.parseScriptOptions(opts);
    discreet.addButton(new Razorpay(options));
  }

})()