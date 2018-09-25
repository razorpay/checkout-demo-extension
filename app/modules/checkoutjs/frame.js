import { RazorpayConfig, makeUrl, makePrefParams } from 'common/Razorpay';
import Track from 'tracker';
import { iPhone } from 'common/useragent';

const { screen, scrollTo } = global;

const ua_iPhone = iPhone;
var doc, head, docStyle;

var ch_PageY = 0;
// there is no "position: fixed" in iphone
var containerHeight = 460;
var merchantMarkup = {
  overflow: '',
  metas: null,
  orientationchange: function() {
    merchantMarkup.resize.call(this);
    merchantMarkup.scroll.call(this);
  },

  resize: function() {
    var height = global.innerHeight || screen.height;
    CheckoutFrame.container.style.position =
      height < 450 ? 'absolute' : 'fixed';
    this.el.style.height = Math.max(height, containerHeight) + 'px';
  },

  // scroll manually in iPhone
  scroll: function() {
    if (typeof global.pageYOffset !== 'number') {
      return;
    }
    if (global.innerHeight < containerHeight) {
      var maxY = containerHeight - global.innerHeight;
      if (global.pageYOffset > maxY + 120) {
        _Doc.smoothScrollTo(maxY);
      }
    } else if (!this.isFocused) {
      _Doc.smoothScrollTo(0);
    }
  },
};

function getMetas() {
  if (!merchantMarkup.metas) {
    merchantMarkup.metas = _Doc.querySelectorAll(
      'head meta[name=viewport],' + 'head meta[name="theme-color"]'
    );
  }

  return merchantMarkup.metas;
}

function restoreMetas($metas) {
  if ($metas) {
    _Arr.loop($metas, _El.detach);
  }
  var oldMeta = getMetas();
  if (oldMeta) {
    _Arr.loop(oldMeta, _El.appendTo(head));
  }
}

function restoreOverflow() {
  docStyle.overflow = merchantMarkup.overflow;
}

// to handle absolute/relative url of options.image
function sanitizeImage(options) {
  var image = options.image;
  if (image && _.isString(image)) {
    if (_.isBase64Image(image)) {
      return;
    }
    if (image.indexOf('http')) {
      // not 0
      var baseUrl =
        location.protocol +
        '//' +
        location.hostname +
        (location.port ? ':' + location.port : '');
      var relUrl = '';
      if (image[0] !== '/') {
        relUrl += location.pathname.replace(/[^/]*$/g, '');
        if (relUrl[0] !== '/') {
          relUrl = '/' + relUrl;
        }
      }
      options.image = baseUrl + relUrl + image;
    }
  }
}

function makeCheckoutUrl(rzp) {
  var url = RazorpayConfig.frame;

  if (!url) {
    url = makeUrl('checkout');

    var urlParams = makePrefParams(rzp);
    if (!urlParams) {
      url += '/public';
    } else {
      url = _.appendParamsToUrl(url, urlParams);
    }
  }

  return url;
}

function setBackdropColor(value) {
  // setting unsupported value throws error in IE
  try {
    CheckoutFrame.backdrop.style.background = value;
  } catch (e) {}
}

function setTestRibbonVisible() {
  if (CheckoutFrame.ribbon) {
    CheckoutFrame.ribbon.style.opacity = 1;
  }
}

function setTestRibbonInvisible() {
  if (CheckoutFrame.ribbon) {
    CheckoutFrame.ribbon.style.opacity = 0;
  }
}

var loader;
function appendLoader($parent, parent) {
  if (!loader) {
    try {
      loader = document.createElement('div');
      loader.className = 'razorpay-loader';
      var style =
        'margin:-25px 0 0 -25px;height:50px;width:50px;animation:rzp-rot 1s infinite linear;-webkit-animation:rzp-rot 1s infinite linear;border: 1px solid rgba(255, 255, 255, 0.2);border-top-color: rgba(255, 255, 255, 0.7);border-radius: 50%;';
      if (parent) {
        style +=
          'margin: 100px auto -150px;border: 1px solid rgba(0, 0, 0, 0.2);border-top-color: rgba(0, 0, 0, 0.7);';
      } else {
        style += 'position:absolute;left:50%;top:50%;';
      }
      loader.setAttribute('style', style);
      loader |> _El.appendTo($parent);
    } catch (e) {}
  }
}

export default function CheckoutFrame(rzp) {
  doc = document.body;
  head = document.head;
  docStyle = doc.style;
  if (rzp) {
    this.getEl(rzp);
    return this.openRzp(rzp);
  }
  this.getEl();
  this.time = _.now();
}

CheckoutFrame.prototype = {
  getEl: function(rzp) {
    if (!this.el) {
      var style =
        'opacity: 1; height: 100%; position: relative; background: none; display: block; border: 0 none transparent; margin: 0px; padding: 0px; z-index: 2;';
      var attribs = {
        style: style,
        allowtransparency: true,
        frameborder: 0,
        width: '100%',
        height: '100%',
        allowpaymentrequest: true,
        src: makeCheckoutUrl(rzp),
      };

      attribs['class'] = 'razorpay-checkout-frame';
      this.el = _El.create('iframe') |> _El.setAttributes(attribs);
    }
    return this.el;
  },

  openRzp: function(rzp) {
    var el =
      this.el
      |> _El.setStyles({
        // by the time checkout opens, other plugins might resize iframe
        width: '100%',
        height: '100%',
      });
    var parent = rzp.get('parent');
    if (parent) {
      parent = _Doc.resolveElement(parent);
    }
    var parent2 = parent || CheckoutFrame.container;
    appendLoader(parent2, parent);

    if (rzp !== this.rzp) {
      if (_El.parent(el) !== parent2) {
        parent2 |> _El.append(el);
      }
      this.rzp = rzp;
    }

    if (parent) {
      el |> _El.setStyle('minHeight', '530px');
      this.embedded = true;
    } else {
      parent2 |> _El.setStyle('display', 'block') |> _El.offsetWidth;
      setBackdropColor(rzp.get('theme.backdrop_color'));
      if (/^rzp_t/.test(rzp.get('key'))) {
        setTestRibbonVisible();
      }
      this.setMetaAndOverflow();
    }

    // bind after setMetaAndOverflow, which might trigger scroll
    this.bind();
    this.onload();
  },

  makeMessage: function() {
    var rzp = this.rzp;
    var options = rzp.get();

    var response = {
      integration: Track.props.integration,
      referer: location.href,
      options: options,
      id: rzp.id,
      openedAt: rzp.openedAt,
    };

    _Obj.loop(rzp.modal.options, function(option, i) {
      options['modal.' + i] = option;
    });

    if (this.embedded) {
      delete options.parent;
      response.embedded = true;
    }

    sanitizeImage(options);
    return response;
  },

  close: function() {
    setBackdropColor('');
    setTestRibbonInvisible();
    restoreMetas(this.$metas);
    restoreOverflow();

    // unbind before triggering scroll
    this.unbind();
    if (ua_iPhone) {
      scrollTo(0, merchantMarkup.oldY);
    }
  },

  bind: function() {
    if (!this.listeners) {
      this.listeners = [];
      var eventPairs = {};

      if (ua_iPhone) {
        eventPairs.orientationchange = merchantMarkup.orientationchange;

        if (!this.rzp.get('parent')) {
          // eventPairs.scroll = merchantMarkup.scroll;
          eventPairs.resize = merchantMarkup.resize;
        }
      }

      _Obj.loop(eventPairs, (listener, event) => {
        this.listeners.push(
          window |> _El.on(event, _Func.bind(listener, this))
        );
      });
    }
  },

  unbind: function() {
    this.listeners |> _Arr.callAll;
    this.listeners = null;
  },

  setMetaAndOverflow: function() {
    if (!head) {
      return;
    }

    _Arr.loop(getMetas(), meta => _El.detach(meta));

    this.$metas = [
      _El.create('meta')
        |> _El.setAttributes({
          name: 'viewport',
          content:
            'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no',
        }),
      _El.create('meta')
        |> _El.setAttributes({
          name: 'theme-color',
          content: this.rzp.get('theme.color'),
        }),
    ];

    _Arr.loop(this.$metas, _El.appendTo(head));

    merchantMarkup.overflow = docStyle.overflow;
    docStyle.overflow = 'hidden';

    if (ua_iPhone) {
      merchantMarkup.oldY = global.pageYOffset;
      global.scrollTo(0, 0);
      merchantMarkup.orientationchange.call(this);
    }
  },

  postMessage: function(response) {
    if (typeof response !== 'object') {
      // TODO roll
    }
    response.id = this.rzp.id;
    response = _Obj.stringify(response);
    this.el.contentWindow.postMessage(response, '*');
  },

  onmessage: function(e) {
    var data = _Obj.parse(e.data);
    if (!data) {
      return;
    }

    var event = data.event;
    var rzp = this.rzp;
    // source check
    if (
      !e.origin ||
      data.source !== 'frame' ||
      // (event !== 'load' && rzp && rzp.id !== data.id) ||
      e.source !== this.el.contentWindow
      // this.el.src.indexOf(e.origin)
    ) {
      return;
    }
    data = data.data;
    this['on' + event](data);

    if (event === 'dismiss' || event === 'fault') {
      Track(rzp, event, data);
    }
  },

  onload: function() {
    if (this.rzp) {
      this.postMessage(this.makeMessage());
    }
  },

  onfocus: function() {
    this.isFocused = true;
  },

  onblur: function() {
    this.isFocused = false;
    merchantMarkup.orientationchange.call(this);
  },

  onrender: function() {
    if (loader) {
      loader |> _El.detach;
      loader = null;
    }
  },

  onredirect: function(data) {
    _Doc.redirect(data);
  },

  onsubmit: function(data) {
    if (data.method === 'wallet') {
      // check if it was one of the external wallets
      var rzp = this.rzp;
      _Arr.loop(rzp.get('external.wallets'), function(walletName) {
        if (walletName === data.wallet) {
          try {
            rzp.get('external.handler').call(rzp, data);
          } catch (e) {
            console.error(e);
          }
        }
      });
    }
  },

  ondismiss: function(data) {
    this.close();
    let dismiss = this.rzp.get('modal.ondismiss');
    if (_.isFunction) {
      setTimeout(() => dismiss(data));
    }
  },

  onhidden: function() {
    this.afterClose();
    let hidden = this.rzp.get('modal.onhidden');
    if (_.isFunction(hidden)) {
      hidden();
    }
  },

  // this is onsuccess method
  oncomplete: function(data) {
    this.close();
    var rzp = this.rzp;
    var handler = rzp.get('handler');
    Track(rzp, 'checkout_success', data);
    if (_.isFunction(handler)) {
      setTimeout(function() {
        handler.call(rzp, data);
      }, 200);
    }
  },

  onpaymenterror: function(data) {
    try {
      this.rzp.emit('payment.error', data);
      this.rzp.emit('payment.failed', data);
    } catch (e) {}
  },

  onfailure: function(data) {
    this.ondismiss();
    global.alert('Payment Failed.\n' + data.error.description);
    this.onhidden();
  },

  onfault: function(message) {
    this.rzp.close();
    global.alert('Oops! Something went wrong.\n' + message);
    this.afterClose();
  },

  afterClose: function() {
    CheckoutFrame.container.style.display = 'none';
  },
};
