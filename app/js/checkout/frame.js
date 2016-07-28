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
    if (isNumber(top)) {
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
  var image = options.image;
  if (image && isString(image)) {
    if(discreet.isBase64Image(image)){
      return;
    }
    if(image.indexOf('http')){ // not 0
      var baseUrl = location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '');
      var relUrl = '';
      if(image[0] !== '/'){
        relUrl += location.pathname.replace(/[^\/]*$/g,'');
        if(relUrl[0] !== '/'){
          relUrl = '/' + relUrl;
        }
      }
      options.image = baseUrl + relUrl + image;
    }
  }
}

function makeCheckoutUrl(rzp){
  var url = RazorpayConfig.frame;

  if (!url) {
    url = makeUrl('checkout');

    var urlParams = makePrefParams(rzp);
    if (!urlParams) {
      urlParams = {};
      url += '/public';
    }

    if(RazorpayConfig.js){
      urlParams.checkout = RazorpayConfig.js;
    }

    var paramsArray = [];
    each(
      urlParams,
      function(key, val){
        paramsArray.push(key + '=' + val);
      }
    )

    if(paramsArray.length){
      url += '?' + paramsArray.join('&');
    }
  }
  return url;
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

var loader;
function appendLoader($parent, parent){
  if(!loader){
    try{
      loader = document.createElement('div');
      loader.className = 'razorpay-loader';
      var style = "margin:-25px 0 0 -25px;height:50px;width:50px;animation:rzp-rot 1s infinite linear;-webkit-animation:rzp-rot 1s infinite linear;border: 1px solid rgba(255, 255, 255, 0.2);border-top-color: rgba(255, 255, 255, 0.7);border-radius: 50%;"
      if(parent){
        style += 'margin: 100px auto -150px;border: 1px solid rgba(0, 0, 0, 0.2);border-top-color: rgba(0, 0, 0, 0.7);';
      } else {
        style += 'position:absolute;left:50%;top:50%;';
      }
      loader.setAttribute('style', style);
      $parent.append(loader);
    } catch(e){}
  }
}

function CheckoutFrame(rzp){
  if(rzp){
    this.getEl(rzp);
    return this.openRzp(rzp);
  }
  this.getEl();
  this.time = now();
}

CheckoutFrame.prototype = {
  getEl: function(rzp){
    if(!this.el){
      var style = 'height: 100%; position: relative; background: none; display: block; border: 0 none transparent; margin: 0px; padding: 0px;';
      this.el = $(document.createElement('iframe'))
        .attr({
          'class': 'razorpay-checkout-frame', // quotes needed for ie
          style: style,
          allowtransparency: true,
          frameborder: 0,
          width: '100%',
          height: '100%',
          src: makeCheckoutUrl(rzp)
        }
      )[0];
    }
    return this.el;
  },

  openRzp: function(rzp){
    var el = this.el;
    this.bind();
    var parent = rzp.get('parent');
    var $parent = $(parent || frameContainer);
    appendLoader($parent, parent);

    if (rzp !== this.rzp) {
      if(this.el.parentNode !== $parent[0]) {
        $parent.append(this.el);
      }
      this.rzp = rzp;
    }

    if (parent) {
      this.el.style.minHeight = '530px';
      this.embedded = true;
    } else {
      $parent.css('display', 'block').reflow();
      setBackdropColor(rzp.get('theme.backdrop_color'));
      if(/^rzp_t/.test(rzp.get('key'))){
        setTestRibbonVisible();
      }
      this.setMetaAndOverflow();
    }
    this.onload();
  },

  makeMessage: function(){
    var rzp = this.rzp;
    var options = rzp.get();

    var response = {
      context: location.href,
      options: options,
      id: rzp.id
    }

    each(
      rzp.modal.options,
      function(i, option){
        options['modal.' + i] = option;
      }
    )

    if(this.embedded){
      delete options.parent;
      response.embedded = true;
    }

    sanitizeImage(options);
    return response;
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
      e.source !== this.el.contentWindow
      // this.el.src.indexOf(e.origin)
    ){
      return;
    }
    data = data.data;
    invoke('on' + event, this, data);

    if (event === 'dismiss' || event === 'fault') {
      track(rzp, event, data);
    }
  },

  onload: function() {
    if(loader){
      $(loader).remove();
      // show it only once.
      loader = true;
    }
    if (this.rzp) {
      this.postMessage(this.makeMessage());
    }
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
              roll('merc', e);
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
          invoke(this.get('handler'), this, data);
        }
        catch(e){
          roll('merc', e);
          throw e;
        }
      },
      rzp,
      null,
      200
    );
  },

  onpaymenterror: function(data){
    try{
      this.rzp.emit('payment.error', data);
    } catch(e){}
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
