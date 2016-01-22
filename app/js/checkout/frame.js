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
    if(!this.isOpen || typeof window.pageYOffset !== 'number'){
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
    if(discreet.isBase64Image(options.image)){
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
  if(options.key){
    return discreet.makeUrl() + 'checkout?key_id=' + options.key;
  }
  return discreet.makeUrl(true) + 'checkout.php';
}

function makeCheckoutMessage(rzp){
  var options = {};
  var response = {
    context: location.href,
    options: options,
    config: RazorpayConfig,
    id: rzp.id
  }

  each(
    rzp.options, function(i, value){
      if(typeof value !== 'function'){
        options[i] = value;
      }
    }
  )

  each(
    rzp.modal.options,
    function(i, option){
      rzp.options.modal[i] = option;
    }
  )

  if(options.parent){
    response.embedded = true;
  }
  delete options.parent;

  sanitizeImage(options);

  if(isCriOS){
    options.redirect = true;
    if(/^data:image\//.test(options.image)){
      options.image = '';
    }
  }
  return response;
}

function setBackdropColor(value){
  // setting unsupported value throws error in IE
  try{ frameBackdrop.style.background = value; }
  catch(e){}
}

function CheckoutFrame(rzp){
  if(rzp){
    this.getEl(rzp.options);
    return this.openRzp(rzp);
  }
  this.getEl(Razorpay.defaults);
}

CheckoutFrame.prototype = {
  getEncodedMessage: function(){
    return _btoa(stringify(makeCheckoutMessage(this.rzp)));
  },

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

  openRzp: function(rzp){
    this.bind();
    var parent = rzp.options.parent;
    var $parent = $(parent || frameContainer);
    var message;

    if(rzp !== this.rzp){
      message = makeCheckoutMessage(rzp);

      if(!this.rzp && !this.el.parentNode){
        $parent.append(this.el);
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
      this.embedded = true;
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
  },

  bind: function(){
    if(!this.listeners){
      this.listeners = {};
      var eventPairs = { message: this.onmessage };

      if(shouldFixFixed){
        eventPairs.orientationchange = merchantMarkup.orientationchange;
        eventPairs.scroll = merchantMarkup.scroll;
      }

      if(isCriOS){
        eventPairs.unload = function(){
          this.el.contentWindow.close();
        }
      }

      each(
        eventPairs,
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
      function(event, listener){
        $(window).off(event, listener);
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
    response = stringify(response);
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
      // (event !== 'load' && data.id !== this.rzp.id) ||
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
      invoke(cb.onsubmit, cb, stringify(data));
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
    invoke('handler', this.rzp.options, data, 200);
  },

  onfailure: function(data){
    this.ondismiss();
    alert('Payment Failed.\n' + data.error.description);
    this.onhidden();
  },

  onfault: function(message){
    this.rzp.close();
    alert('Oops! Something went wrong.\n' + message);
  },

  afterClose: function(){
    frameContainer.style.display = 'none';
    this.unbind();
  }
}