/* global Razorpay */
/* jshint -W027 */

(function(){
  'use strict';

  var doT = Razorpay.prototype.doT;
  var discreet = Razorpay.prototype.discreet;

  Razorpay.prototype.open = function() {
    var body = discreet.bodyEl = document.getElementsByTagName('body')[0];
    if(!body){
      setTimeout(this.open());
    }
    if(discreet.isOpen){
      return;
    }

    discreet.isOpen = true;
    discreet.merchantData.bodyOverflow = body.style.overflow;
    body.style.overflow = 'hidden';

    discreet.xdm.addMessageListener(discreet.onFrameMessage, this);

    if(!discreet.frameContainer){
      var parent = discreet.frameContainer = document.createElement('div');
      parent.className = 'razorpay-frame-container';
      var style = parent.style;
      style.zIndex = '99999';
      style.position = 'relative';
      body.appendChild(parent);
    }

    if(!this.checkoutFrame){
      this.checkoutFrame = discreet.createFrame(this.options);
      discreet.frameContainer.appendChild(this.checkoutFrame);
    } else {
      this.checkoutFrame.style.display = 'block';
      discreet.setMetaViewport();
      discreet.sendFrameMessage.call(this, {event: 'open'});
    }
  }

  discreet.createFrame = function(options){
    var frame = document.createElement('iframe');
    var src = discreet.currentScript.src;
    if(/^https?:\/\/[^\.]+.razorpay.com/.test(src)){
      src = discreet.makeUrl(options) + '/checkout?key_id=' + options.key;
    } else {
      src = src.replace(/(js\/lib\/)?[^\/]+$/,'') + 'checkout.html';
    }

    var attrs = {
      'class': 'razorpay-checkout-frame', // quotes needed for ie
      style: 'transition: 0.25s background; display: block; background: rgba(0, 0, 0, 0.1); border: 0px none transparent; overflow: hidden; visibility: visible; margin: 0px; padding: 0px; position: fixed; left: 0px; top: 0px; width: 100%; height: 100%;',
      allowtransparency: true,
      frameborder: 0,
      width: '100%',
      height: '100%',
      src: src
    };
    for(var i in attrs){
      frame.setAttribute(i, attrs[i]);
    }
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
    discreet.bodyEl.style.overflow = discreet.merchantData.bodyOverflow;

    var meta = discreet.metaViewportTag;
    if(meta){
      var parent = discreet.metaViewportTag.parentNode;
      parent && parent.removeChild(meta);
    }

    meta = discreet.merchantData.metaViewport;
    if(meta){
      var head = document.getElementsByTagName('head')[0];
      head && !meta.parentNode && head.appendChild(meta);
      discreet.merchantData.metaViewport = null;
    }

    if(this.checkoutFrame){
      this.checkoutFrame.style.display = 'none';
      if(this.checkoutFrame.getAttribute('removable')){
        this.checkoutFrame.parentNode && this.checkoutFrame.parentNode.removeChild(this.checkoutFrame);
        this.checkoutFrame = null;
      }
    }
  }

  discreet.sendFrameMessage = function(response){
    if(typeof response !== 'string'){
      response = JSON.stringify(response)
    }
    this.checkoutFrame.contentWindow.postMessage(response, '*');
  }

  // to handle absolute/relative url of options.image
  discreet.setImageOption = function(options){
    if(options.image && typeof options.image == 'string'){
      if(/data:image\/[^;]+;base64/.test(options.image)){
        return;
      }
      if(options.image.indexOf('http')){ // not 0
        var baseUrl = location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '');
        var relUrl = '';
        if(options.image[0] != '/'){
          relUrl += location.pathname.replace(/[^\/]*$/g,'');
          if(relUrl[0] != '/'){
            relUrl = '/' + relUrl;
          }
        }
        options.image = baseUrl + relUrl + options.image;
      }
    }
  }

  discreet.setMetaViewport = function(){
    if(typeof document.querySelector != 'function'){
      return;
    }
    var head = document.querySelector('head')
    if(!head){
      return;
    }

    var meta = head.querySelector('meta[name=viewport]');

    if(meta){
      if(/width=device-width, ?initial-scale=1/.test(meta.getAttribute('content'))){
        return;
      }
      discreet.merchantData.metaViewport = meta;
      meta.parentNode.removeChild(meta);
    }

    if(!discreet.metaViewportTag){
      meta = discreet.metaViewportTag = document.createElement('meta');
      meta.setAttribute('name', 'viewport');
      meta.setAttribute('content', 'width=device-width, initial-scale=1');
    }

    if(!discreet.metaViewportTag.parentNode){
      head.appendChild(discreet.metaViewportTag);
    }
  }

  discreet.onFrameMessage = function(e, data){
    // this == rzp
    if((typeof e.origin != 'string') || !this.checkoutFrame || this.checkoutFrame.src.indexOf(e.origin) || (data.source != 'frame')){ // source check
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
        this.checkoutFrame.setAttribute('removable', true);
      }
      if(typeof this.options.handler == 'function'){
        this.options.handler.call(null, data.data);
      }
    } else if (event == 'fault'){
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
    RazorPayForm.innerHTML += inputs;
    RazorPayForm.submit();
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
        var opt = options[i];
        if(opt === 'true')
          opt = true;
        else if(opt === 'false')
          opt = false;
        options[category][property] = opt;
        delete options[i];
      }
    }
    if(options.method)
      discreet.parseScriptOptions(options.method);
  };

  discreet.addButton = function(rzp){
    var button = document.createElement('input');
    var form = discreet.currentScript.parentNode;
    button.type = 'submit';
    button.value = rzp.options.buttontext;
    button.className = 'razorpay-payment-button';
    form.appendChild(button);
    form.onsubmit = function(e){
      if(discreet.isOpen){
        return;
      }
      e.preventDefault();
      rzp.open();
      return false;
    }
  };

  /**
  * This checks whether we are in automatic mode
  * If yes, it puts in the button
  */
  discreet.automaticCheckoutInit = function(){
    var key = discreet.currentScript.getAttribute('data-key');
    if (key && key.length > 0){
      var attrs = discreet.currentScript.attributes;
      var opts = {};
      for(var i=0; i<attrs.length; i++){
        var name = attrs[i].name
        if(/^data-/.test(name)){
          name = name.replace(/^data-/,'');
          opts[name] = attrs[i].value;
        }
      }
      discreet.parseScriptOptions(opts);
      opts.handler = discreet.defaultPostHandler;
      var rzp = new Razorpay(opts);
      discreet.addButton(rzp);
    }
  }

  discreet.validateCheckout = function(options, errors){
    var amount = parseInt(options.amount);
    options.amount = String(options.amount);
    if (!amount || typeof amount !== 'number' || amount < 0 || options.amount.indexOf('.') !== -1) {
      errors.push({
        message: 'Invalid amount specified',
        field: 'amount'
      });
    }

    if (typeof options.name === 'undefined'){
      errors.push({
        message: 'Merchant name cannot be empty',
        field: 'name'
      })
    }

    if (options.handler && typeof options.handler != 'function'){
      errors.push({
        message: 'Handler must be a function',
        field: 'handler'
      });
    }

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

  // Get the ball rolling in case we are in manual mode
  discreet.automaticCheckoutInit();

})()
