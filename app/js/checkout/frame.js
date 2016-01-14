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
    //
  },

  openRzp: function(rzp){
    this.unrzp();

    var $parent = rzp.options.parent;
    if($parent){
      this.afterClose = noop;
    }
    else {
      $parent = frameContainer;
    }

    $parent = $($parent);
    $parent.append(this.el);
    $parent.css('display', 'block').reflow();

    setBackdropColor(rzp.options.theme.backdropColor);
    this.rzp = rzp;
    this.afterLoad(function(){
      this.postMessage(this.makeFrameOptions());
    })
  },

  bind: function(){
    this.listener = $(window).on('message', this.onmessage, null, this);
  },

  makeFrameOptions: function(){
    var rzp = this.rzp;
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
      config: RazorpayConfig
    }
    response.id = rzp.id;
    return response;
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
    if(this.loaded){
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
    var handler = this['on' + event];
    if(typeof handler === 'function'){
      handler.call(this, data);
    }

    if(event === 'dismiss' || event === 'fault'){
      track.call(this.rzp, event, data);
    }
  },

  onload: function() {
    if(this.loaded){
      this.loaded();
    }
    this.loaded = true;
  },

  onredirect: function(data){
    discreet.nextRequestRedirect(data);
  },

  onsubmit: function(data){
    var cb = window.CheckoutBridge;
    if(cb && typeof cb.onsubmit === 'function'){
      cb.onsubmit(JSON.stringify(data));
    }
  },

  ondismiss: function(){
    setBackdropColor('');
    invoke(this.rzp.options.modal.ondismiss);
  },

  onhidden: function(){
    this.afterClose();
    invoke(this.rzp.options.modal.onhidden);
  },

  onsuccess: function(data){
    invoke(this.rzp.options.handler, data, 300);
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

  afterClose: function(){
    
  }
}