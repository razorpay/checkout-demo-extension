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

function makeCheckoutUrl(key){
  var params = [];
  var url = discreet.makeUrl() + 'checkout';

  if(/^rzp_t/.test(key)){
    params.push('new=1')
  }

  if(RazorpayConfig.jspath){
    params.push('checkout=' + RazorpayConfig.jspath);
  }

  if(key){
    params.push('key_id='+key);
  } else {
    url += '/public';
  }

  if(params.length){
    params = '?' + params.join('&');
  } else {
    params = '';
  }
  return url + params;
}

function makeCheckoutMessage(rzp){
  var options = rzp.get();
  var response = {
    context: location.href,
    options: options,
    config: RazorpayConfig,
    id: rzp.id
  }

  each(
    rzp.modal.options,
    function(i, option){
      options['modal.' + i] = option;
    }
  )

  if(options.parent){
    response.embedded = true;
  }

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

function setTestRibbonVisible(){
  testRibbon.style.opacity = 1.0;
}

function setTestRibbonInvisible(){
  testRibbon.style.opacity = 0.0;
}

function CheckoutFrame(rzp){
  if(rzp){
    this.getEl(rzp);
    return this.openRzp(rzp);
  }
  this.getEl();
}

CheckoutFrame.prototype = {
  getEl: function(rzp){
    if(!this.el){
      var key = rzp && rzp.get('key');
      var iframe = $(document.createElement('iframe'))
        .attr({
          'class': 'razorpay-checkout-frame', // quotes needed for ie
          allowtransparency: true,
          frameborder: 0,
          width: '100%',
          height: '100%',
          src: makeCheckoutUrl(key)
        }
      )
      this.el = iframe[0];

      setTimeout(function() {
        iframe.attr({
          style: 'min-height: 530px; height: 100%; position: relative; background: none; display: block; border: 0 none transparent; margin: 0px; padding: 0px;'
        });
      });
    }
    return this.el;
  },

  openRzp: function(rzp){
    var el = this.el;
    this.bind();
    var parent = rzp.get('parent');
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
      setBackdropColor(rzp.get('theme.backdrop_color'));
      if(/^rzp_t/.test(rzp.get('key'))){
        setTestRibbonVisible();
      }
      this.setMetaAndOverflow();
    }
  },

  close: function(){
    setBackdropColor('');
    setTestRibbonInvisible();
    restoreMeta(this.$meta);
    restoreOverflow();
  },

  bind: function(){
    if(!this.listeners){
      this.listeners = [];
      var eventPairs = { message: this.onmessage };

      if(shouldFixFixed){
        eventPairs.orientationchange = merchantMarkup.orientationchange;
        eventPairs.scroll = merchantMarkup.scroll;
      }

      each(
        eventPairs,
        function(event, listener){
          this.listeners.push(
            $(window).on(event, listener, null, this)
          )
        },
        this
      )
    }
  },

  unbind: function(){
    invokeEach(this.listeners);
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
    var rzp = this.rzp;
    // source check
    if(
      !e.origin ||
      data.source !== 'frame' ||
      // (event !== 'load' && rzp && rzp.id !== data.id) ||
      e.source !== this.el.contentWindow ||
      this.el.getAttribute('src').indexOf(e.origin)
    ){
      return;
    }
    data = data.data;
    invoke('on' + event, this, data);

    if(event === 'dismiss' || event === 'fault' && rzp.isLiveMode()){
      track(rzp, event);
    }
  },

  onload: function() {
    $('.razorpay-backdrop.anim').removeClass('anim');
    invoke('loadedCallback', this);
    this.hasLoaded = true;
  },

  onredirect: function(data){
    discreet.redirect(data);
  },

  onsubmit: function(data){
    if(data.method === 'wallet'){
      // check if it was one of the external wallets
      var rzp = this.rzp;
      each(
        rzp.get('external.wallets'),
        function(i, walletName){
          if(walletName === data.wallet){
            try{
              rzp.get('external.handler').call(rzp, data);
            } catch(e){
              track(rzp, 'js_error', e);
            }
          }
        }
      )
    }
  },

  ondismiss: function(){
    this.close();
    invoke(this.rzp.get('modal.ondismiss'));
  },

  onhidden: function(){
    this.afterClose();
    invoke(this.rzp.get('modal.onhidden'));
  },

  // this is onsuccess method
  oncomplete: function(data){
    this.close();
    var rzp = this.rzp;
    track(rzp, 'checkout_success', data);
    invoke(
      function(){
        try{
          this.get('handler')(data);
        }
        catch(e){
          track(rzp, 'js_error', e);
          throw e;
        }
      },
      rzp,
      null,
      200
    );
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
