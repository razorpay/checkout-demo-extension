// to handle absolute/relative url of options.image
function sanitizeImage(options){
  if(options.image && typeof options.image === 'string'){
    if(/data:image\/[^;]+;base64/.test(options.image)){
      return;
    }
    if(options.image.indexOf('http')){ // not 0
      var baseUrl = location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '');
      var relUrl = '';
      if(options.image[0] !== '/'){
        relUrl += location.pathname.replace(/[^\/]*$/g,'');
        if(relUrl[0] !== '/'){
          relUrl = '/' + relUrl;
        }
      }
      options.image = baseUrl + relUrl + options.image;
    }
  }
}

function makeCheckoutUrl(options){
  this.loaded = null;
  if(options.key){
    return discreet.makeUrl() + 'checkout?key_id=' + options.key;
  }
  return discreet.makeUrl(true) + 'checkout.php';
}

function makeFrameOptions(rzp){
  var options = {};

  each(
    rzp.options, function(i, value){
      if(typeof value !== 'function'){
        options[i] = value;
      }
    }
  )
  for(var i in rzp.modal.options){
    rzp.options.modal[i] = rzp.modal.options[i];
  }
  sanitizeImage(options);

  var response = {
    context: location.href,
    options: options,
    config: RazorpayConfig,
    id: rzp.id
  }

  return response;
}

function CheckoutFrame(){
  this.getEl(Razorpay.defaults);
  this.bind();
  // this.setMeta();
}

CheckoutFrame.prototype = {
  getEl: function(options){
    if(!this.el){
      this.el = $(document.createElement(isCriOS ? 'div' : 'iframe'))
        .attr({
          'class': 'razorpay-checkout-frame', // quotes needed for ie
          style: 'height: 100%; position: relative; background: none; display: block; border: 0 none transparent; margin: 0px; padding: 0px;',
          allowtransparency: true,
          frameborder: 0,
          width: '100%',
          height: '100%',
          src: makeCheckoutUrl(options)
        }
      )[0]
    }
    return this.el;
  },

  unrzp: function(){
    if(this.loaded){
      $(window).off('message', this.listener);
      this.listener = null;
    }
  },

  openRzp: function(rzp){
    var parent = rzp.options.parent;
    var $parent = $(parent || frameContainer);

    var message;

    if(rzp !== this.rzp){
      message = makeFrameOptions(rzp);

      if(!this.rzp){
        $parent.append(this.el);
        this.bind();
      }
      else {
        this.unrzp();
      }

      this.rzp = rzp;
    }
    else {
      message = {event: 'open'};
    }

    this.afterLoad(function(){
      this.postMessage(message);
    })

    if(parent){
      this.afterClose = noop;
    }
    else {
      $parent.css('display', 'block').reflow();
      setBackdropColor(rzp.options.theme.backdropColor);
    }
  },

  bind: function(){
    if(!this.listener){
      this.listener = $(window).on('message', this.onmessage, null, this);
    }
  },

  setMeta: function(){
    var head = qs('head');
    if(!head){
      return;
    }
    $(merchantMarkup.getMeta()).remove();

    this.metaTag = $(document.createElement('meta'))
      .attr({
        name: 'viewport',
        content: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
      })[0]

    head.appendChild(this.metaTag);
  },

  postMessage: function(response){
    if(isCriOS){
      return;
    }
    if(typeof response !== 'object'){
      // TODO roll
    }
    response.id = this.rzp.id;
    response = JSON.stringify(response);
    this.el.contentWindow.postMessage(response, '*');
  },

  afterLoad: function(handler){
    if(this.loaded === true){
      handler.call(this);
    } else {
      this.loaded = handler;
    }
  },

  onmessage: function(e){
    var data = JSON.parse(e.data);
    var event = data.event;
    // source check
    if(
      !e.origin ||
      data.source !== 'frame' ||
      (event !== 'load' && data.id !== this.rzp.id) ||
      this.el.getAttribute('src').indexOf(e.origin)
    ){
      return;
    }
    data = data.data;
    invoke(this['on' + event], this, data);

    if(event === 'dismiss' || event === 'fault'){
      track.call(this.rzp, event, data);
    }
  },

  onload: function() {
    invoke(this.loaded, this);
    this.loaded = true;
  },

  onredirect: function(data){
    discreet.nextRequestRedirect(data);
  },

  onsubmit: function(data){
    var cb = window.CheckoutBridge;
    if(typeof cb === 'object'){
      invoke(cb.onsubmit, cb, JSON.stringify(data));
    }
  },

  ondismiss: function(){
    this.close();
    invoke(this.rzp.options.modal.ondismiss);
  },

  onhidden: function(){
    this.afterClose();
    invoke(this.rzp.options.modal.onhidden);
  },

  onsuccess: function(data){
    this.close();
    invoke(this.rzp.options.handler, window, data, 200);
  },

  onfailure: function(data){
    // ch_close.call(existingInstance);
    alert('Payment Failed.\n' + data.error.description);
  },

  onfault: function(message){
    alert('Oops! Something went wrong.\n' + message);
    // ch_onClose.call(existingInstance);
    // existingInstance.close();
  },

  close: function(){
    setBackdropColor('');
  },

  afterClose: function(){
    frameContainer.style.display = 'none';
  }
}