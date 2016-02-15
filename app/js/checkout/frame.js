var ch_PageY = 0;
// there is no "position: fixed" in iphone
var docStyle = doc.style;
var merchantMarkup = {
  overflow: '',
  meta: null,

  orientationchange: function(){
    this.el.style.height = Math.max(window.innerHeight || 0, 480) + 'px';
  },

  // scroll manually in iPhone
  scroll: function(){
    if(typeof window.pageYOffset !== 'number'){
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

  options.redirect = !!rzp.options.redirect();

  if(options.parent){
    response.embedded = true;
  }
  delete options.parent;

  sanitizeImage(options);
  return response;
}

function getEncodedMessage(rzp){
  return _btoa(stringify(makeCheckoutMessage(rzp)));
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

  getEl: function(options){
    if(!this.el){
      this.el = $(document.createElement('iframe'))
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
    var el = this.el;
    this.bind();
    var parent = rzp.options.parent;
    var $parent = $(parent || frameContainer);
    var message;

    if(rzp !== this.rzp){
      message = makeCheckoutMessage(rzp);

      if(!this.rzp && this.el.parentNode !== $parent[0]){
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
      this.el.removeAttribute('style');
      this.embedded = true;
      this.afterClose = noop;
    }
    else {
      $parent.css('display', 'block').reflow();
      setBackdropColor(rzp.options.theme.backdrop_color);
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
    if(typeof response !== 'object'){
      // TODO roll
    }
    response.id = this.rzp.id;
    response = stringify(response);
    this.el.contentWindow.postMessage(response, '*');
  },

  afterLoad: function(handler){
    if(this.hasLoaded === true){
      handler.call(this);
    } else {
      this.loadedCallback = handler;
    }
  },

  onmessage: function(e){
    var data;
    try{
      data = JSON.parse(e.data);
    }
    catch(err){
      return;
    }

    var event = data.event;
    // source check
    if(
      !e.origin ||
      data.source !== 'frame' ||
      (event !== 'load' && this.rzp && this.rzp.id !== data.id) ||
      e.source !== this.el.contentWindow ||
      this.el.getAttribute('src').indexOf(e.origin)
    ){
      return;
    }
    data = data.data;
    invoke('on' + event, this, data);

    if(event === 'dismiss' || event === 'fault'){
      track.call(this.rzp, event, data);
    }
  },

  onload: function() {
    invoke('loadedCallback', this);
    this.hasLoaded = true;
  },

  onredirect: function(data){
    discreet.nextRequestRedirect(data);
  },

  onsubmit: function(data){
    var cb = window.CheckoutBridge;
    if(typeof cb === 'object'){
      invoke('onsubmit', cb, stringify(data));
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

  // this is onsuccess method
  oncomplete: function(data){
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
    this.afterClose();
  },

  afterClose: function(){
    frameContainer.style.display = 'none';
    this.unbind();
  }
}