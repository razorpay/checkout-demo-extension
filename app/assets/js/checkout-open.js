/* global Razorpay */
/* jshint -W027 */

(function(){
  'use strict';

  var $ = Razorpay.prototype.$;
  var doT = Razorpay.prototype.doT;
  var discreet = Razorpay.prototype.discreet;

  Razorpay.prototype.open = function() {
    if(discreet.isOpen){
      return;
    }
    discreet.isOpen = true;
    var $body = $('body')
    discreet.merchantData.bodyOverflow = $body[0].style.overflow; // dont use $body.css, that will give real css value, we want just the js override, preferably blank string.
    $body.css('overflow', 'hidden');

    discreet.xdm.addMessageListener(discreet.onFrameMessage, this);

    if(!this.checkoutFrame){
      var parent = $(this.options.parent);
      if(!parent.is(':visible'))
        parent = $body
      this.checkoutFrame = discreet.createFrame(this);
      parent.append(this.checkoutFrame);
    } else {
      discreet.setMetaViewport();
      this.checkoutFrame.show();
      discreet.sendFrameMessage.call(this, {event: 'open'});
    }
  }

  discreet.createFrame = function(rzp){
    var frame = $(document.createElement('iframe'));
    var src = discreet.currentScript.src;
    if(/^https?:\/\/[^\.]+.razorpay.com/.test(src)){
      src = discreet.makeUrl(rzp) + '/checkout?key_id=' + rzp.options.key;
    } else {
      src = src.replace(/(js\/lib\/)?[^\/]+$/,'') + 'checkout.html';
    }

    frame.attr({
      'class': 'razorpay-checkout-frame',
      'style': 'transition: 0.25s background;z-index: 9999; display: block; background: rgba(0, 0, 0, 0.1); border: 0px none transparent; overflow: hidden; visibility: visible; margin: 0px; padding: 0px; position: fixed; left: 0px; top: 0px; width: 100%; height: 100%;',
      'allowtransparency': 'true',
      'frameborder': '0',
      'src': src
    });
    return frame;
  }

  Razorpay.prototype.close = function(){
    if(discreet.isOpen){
      discreet.sendFrameMessage.call(this, {event: 'close'});
    }
  }

  discreet.onClose = function(){
    discreet.xdm.removeMessageListener();
    discreet.isOpen = false;
    $('body').css('overflow', discreet.merchantData.bodyOverflow);

    if(discreet.merchantData.metaViewport){
      var $head = $('head');
      $head.find('meta[name=viewport]').remove();
      $head.append(discreet.merchantData.metaViewport); // please do not chain
      discreet.merchantData.metaViewport = null;
    }
      
    if(this.checkoutFrame){
      this.checkoutFrame.hide();
      if(this.checkoutFrame.data('removable')){
        this.checkoutFrame.remove();
        this.checkoutFrame = null;
      }
    }
  }

  discreet.sendFrameMessage = function(response){
    if(typeof response !== 'string'){
      response = JSON.stringify(response)
    }
    this.checkoutFrame.prop('contentWindow').postMessage(response, '*');
  }

  // to handle absolute/relative url of options.image
  discreet.setImageOption = function(options){
    if(options.image && typeof options.image == 'string'){
      if(/data:image\/[^;]+;base64/.test(options.image)){
        return;
      }
      if(options.image.indexOf('http')){ // not 0
        var baseUrl = location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '');
        if(options.image[0] != '/'){
          baseUrl += '/' + location.pathname.replace(/[^\/]*$/g,'');
        }
        options.image = baseUrl + options.image;
      }
    }
  }

  discreet.setMetaViewport = function(){
    if(!discreet.merchantData.metaViewport){
      discreet.merchantData.metaViewport = $('meta[name]').filter(function(i, el){
        var name = el.getAttribute('name');
        return (typeof name == 'string') && (name.toLowerCase() == 'viewport');
      }).remove();
      $('head').append('<meta name="viewport" content="width=device-width, initial-scale=1">');
    }
  }

  discreet.onFrameMessage = function(e, data){
    // this == rzp
    if((typeof e.origin != 'string') || !this.checkoutFrame || this.checkoutFrame.prop('src').indexOf(e.origin) || (data.source != 'frame')){ // source check
      return;
    }
    var event = data.event;

    if(event == 'load'){
      discreet.setMetaViewport();
      var options = {};
      for(var i in this.options){
        var value = this.options[i];
        if(typeof value != 'function' && i != 'parent'){
          options[i] = value;
        }
      }
      discreet.setImageOption(options);

      var response = {
        context: location.href,
        options: options
      }
      return discreet.sendFrameMessage.call(this, response);
    }

    else if (event == 'submit'){
      if(window.CheckoutBridge && typeof window.CheckoutBridge.onsubmit == 'function'){
        window.CheckoutBridge.onsubmit(JSON.stringify(data.data));
      }
    }

    else if (event == 'dismiss'){
      if(typeof this.options.modal.ondismiss == 'function')
        this.options.modal.ondismiss()
    }

    else if (event == 'hidden'){
      discreet.onClose.call(this);
      if(typeof this.options.modal.onhidden == 'function')
        this.options.modal.onhidden();
    }

    else if (event == 'success'){
      if(this.checkoutFrame){
        this.checkoutFrame.data('removable', true);
      }
      if(typeof this.options.handler == 'function'){
        this.options.handler.call(null, data.data);
      }
    } else if (event == 'error'){
      alert("Oops! Something went wrong.");
      this.close();
    }
  }

  /**
    default handler for success
    it just submits everything via the form
    @param  {[type]} data [description]
    @return {[type]}    [description]
  */
  discreet.defaultPostHandler = function(data){
    var inputs = "";
    for (var i in data) {
      if (typeof data[i] === "object") {
        for (var j in data[i]) {
          inputs += "<input type=\"hidden\" name=\"" + i + "[" + j + "]\" value=\"" + data[i][j] + "\">";
        }
      } else {
        inputs += "<input type=\"hidden\" name=\"" + i + "\" value=\"" + data[i] + "\">";
      }
    }
    var RazorPayForm = discreet.currentScript.parentElement;
    $(inputs).appendTo(RazorPayForm);
    $(RazorPayForm).submit();
  };

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
    options.handler = discreet.defaultPostHandler;
    return options;
  };

  discreet.addButton = function(rzp){
    var button = document.createElement('input');
    var form = discreet.currentScript.parentNode;
    button.type = 'submit';
    button.value = rzp.options.buttontext;
    button.className = 'razorpay-payment-button';
    $(form).submit(function(e){
      if(discreet.isOpen){
        return;
      }
      e.preventDefault();
      rzp.open();
      return false;
    }).append(button);
  };
  var key = discreet.currentScript.getAttribute('data-key');
  if (key && key.length > 0){
    var opts = $(discreet.currentScript).data();
    var options = discreet.parseScriptOptions(opts);
    discreet.addButton(new Razorpay(options));
  }

  discreet.validateCheckout = function(options, errors){
    if(options.display_currency){
      if(options.display_currency === 'USD'){
        options.display_amount = String(options.display_amount).replace(/([^0-9\. ])/g,'');
        if(!options.display_amount){
          errors.push({
            message: 'Invalid display_amount specified',
            field: 'display_amount'
          });
        }
      } else {
        errors.push({
          message: 'Invalid display currency specified',
          field: 'display_currency'
        });
      }
    }
  }

})()
