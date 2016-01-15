var ch_PageY = 0;
// there is no "position: fixed" in iphone
var docStyle = doc.style;
var merchantMarkup = {
  overflow: '',
  meta: null,

  orientationchange: function(){
    this.el.style.height = Math.max(window.innerHeight || 0, 490) + 'px';
  },

  // scroll manually in iPhone
  scroll: function(){
    if(!isOpen || typeof window.pageYOffset !== 'number'){
      return;
    }

    var top;
    var offTop = frameContainer.offsetTop - pageYOffset;
    var offBot = frameContainer.offsetHeight + offTop;
    if(ch_PageY < pageYOffset){
      if(offBot < 0.2*innerHeight && offTop < 0){
        top = pageYOffset + innerHeight - frameContainer.offsetHeight;
      }
    }
    else if(ch_PageY > pageYOffset){
      if(offTop > 0.1*innerHeight && offBot > innerHeight){
        top = pageYOffset;
      }
    }
    if(typeof top === 'number'){
      frameContainer.style.top = Math.max(0, top) + 'px';
    }
    ch_PageY = pageYOffset;

  }
}

function getMeta(){
  if(!merchantMarkup.meta){
    merchantMarkup.meta = qs('head meta[name=viewport]');
  }
  return merchantMarkup.meta;
}

function restoreMeta($meta){
  if($meta){
    $meta.remove();
  }
  var oldMeta = getMeta();
  if(oldMeta){
    qs('head').appendChild(oldMeta);
  }
}

function restoreOverflow(){
  docStyle.overflow = merchantMarkup.overflow;
}

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

function makeCheckoutMessage(rzp){
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

  if(isCriOS){
    options.redirect = true;
    if(/^data:image\//.test(options.image)){
      options.image = '';
    }
  }

  var response = {
    context: location.href,
    options: options,
    config: RazorpayConfig,
    id: rzp.id
  }

  return response;
}

function CheckoutFrame(rzp){
  if(rzp){
    this.getEl(rzp.options);
    return this.openRzp(rzp);
  }
  this.getEl(Razorpay.defaults);
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

  },

  destroy: function(){
    this.unbind();
  },

  openRzp: function(rzp){
    this.bind();
    var parent = rzp.options.parent;
    var $parent = $(parent || frameContainer);
    var message;

    if(rzp !== this.rzp){
      message = makeCheckoutMessage(rzp);

      if(!this.rzp){
        $parent.append(this.el);
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
      this.setMetaAndOverflow();
    }
  },

  close: function(){
    setBackdropColor('');
    restoreMeta(this.$meta);
    restoreOverflow();
    this.unbind();
  },

  bind: function(){
    if(!this.listeners){
      this.listeners = {};
      var eventPair = { message: this.onmessage };

      if(shouldFixFixed){
        eventPair.orientationchange = merchantMarkup.orientationchange;
        eventPair.scroll = merchantMarkup.scroll;
      }

      if(isCriOS){
        eventPair.unload = function(){
          this.el.contentWindow.close();
        }
      }

      each(
        eventPair,
        function(event, listener){
          this.listeners[event] = $(window).on(event, listener, null, this);
        },
        this
      )
    }
  },

  unbind: function(){
    each(
      this.listeners,
      function(eventPair){
        $(window).off(eventPair[0], eventPair[1]);
      }
    )
    this.listeners = null;
  },

  setMetaAndOverflow: function(){
    var head = qs('head');
    if(!head){
      return;
    }
    $(getMeta()).remove();

    this.$meta = $(document.createElement('meta'))
      .attr({
        name: 'viewport',
        content: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
      })

    head.appendChild(this.$meta[0]);

    merchantMarkup.overflow = docStyle.overflow;
    docStyle.overflow = 'hidden';

    if(shouldFixFixed){
      scrollTo(0, 0);
      merchantMarkup.orientationchange.call(this);
      merchantMarkup.scroll.call(this);
    }
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
    alert('Payment Failed.\n' + data.error.description);
  },

  onfault: function(message){
    alert('Oops! Something went wrong.\n' + message);
  },

  afterClose: function(){
    frameContainer.style.display = 'none';
  }
}