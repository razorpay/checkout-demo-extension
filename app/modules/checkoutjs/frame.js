import { makePrefParams } from 'common/Razorpay';
import { makeUrl } from 'common/helper';
import RazorpayConfig from 'common/RazorpayConfig';
import { iPhone, shouldRedirect } from 'common/useragent';
import { COMMIT_HASH, TRAFFIC_ENV } from 'common/constants';
import Analytics, { Track } from 'analytics';
import * as AnalyticsTypes from 'analytics-types';
import {
  ACTIONS,
  CATEGORIES,
} from 'one_click_checkout/merchant-analytics/constant';
import * as _El from 'utils/DOM';
import {
  smoothScrollTo,
  querySelectorAll,
  resolveElement,
  redirectTo,
} from 'utils/doc';
import { submitForm } from 'common/form';
import * as ObjectUtils from 'utils/object';
import * as _ from 'utils/_';
import { appendLoader } from 'common/loader';
import { sendToAll, setInitialContext } from 'checkoutjs/analytics';
import { cleanupFreezeCheck } from './freeze';

const { screen, scrollTo } = global;

const ua_iPhone = iPhone;
let doc, head, docStyle;
let isCheckoutFrameLoaded = false;

// there is no "position: fixed" in iphone
let containerHeight = 460;
const merchantMarkup = {
  overflow: '',
  metas: null,
  orientationchange: function () {
    merchantMarkup.resize.call(this);
    merchantMarkup.scroll.call(this);
  },

  resize: function () {
    let height = global.innerHeight || screen.height;
    CheckoutFrame.container.style.position =
      height < 450 ? 'absolute' : 'fixed';
    this.el.style.height = Math.max(height, containerHeight) + 'px';
  },

  // scroll manually in iPhone
  scroll: function () {
    if (typeof global.pageYOffset !== 'number') {
      return;
    }
    if (global.innerHeight < containerHeight) {
      let maxY = containerHeight - global.innerHeight;
      if (global.pageYOffset > maxY + 120) {
        smoothScrollTo(maxY);
      }
    } else if (!this.isFocused) {
      smoothScrollTo(0);
    }
  },
};

function getMetas() {
  if (!merchantMarkup.metas) {
    merchantMarkup.metas = querySelectorAll(
      'head meta[name=viewport],' + 'head meta[name="theme-color"]'
    );
  }

  return merchantMarkup.metas;
}

function restoreMetas($metas) {
  if ($metas) {
    $metas.forEach(_El.detach);
  }
  let oldMeta = getMetas();
  if (oldMeta) {
    oldMeta.forEach(_El.appendTo(head));
  }
}

function restoreOverflow() {
  docStyle.overflow = merchantMarkup.overflow;
}

// to handle absolute/relative url of options.image
function sanitizeImage(options) {
  let image = options.image;
  if (image && _.isString(image)) {
    if (_.isBase64Image(image)) {
      return;
    }
    if (image.indexOf('http')) {
      // not 0
      let baseUrl =
        location.protocol +
        '//' +
        location.hostname +
        (location.port ? ':' + location.port : '');
      let relUrl = '';
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
  let url = RazorpayConfig.frame;

  if (!url) {
    url = makeUrl('checkout', false);

    let urlParams = makePrefParams(rzp);
    if (!urlParams) {
      url += '/public';
    } else {
      url = _.appendParamsToUrl(url, urlParams);
    }
  }

  // enables loading CDN based assets
  url = _.appendParamsToUrl(url, {
    traffic_env: TRAFFIC_ENV,
    build: COMMIT_HASH,
  });

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

let loader;

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
  getEl: function (rzp) {
    if (!this.el) {
      let style =
        'opacity: 1; height: 100%; position: relative; background: none; display: block; border: 0 none transparent; margin: 0px; padding: 0px; z-index: 2;';
      let attribs = {
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

  openRzp: function (rzp) {
    let el =
      this.el
      |> _El.setStyles({
        // by the time checkout opens, other plugins might resize iframe
        width: '100%',
        height: '100%',
      });
    let parent = rzp.get('parent');
    if (parent) {
      parent = resolveElement(parent);
    }
    let parent2 = parent || CheckoutFrame.container;
    if (!loader) {
      loader = appendLoader(parent2, parent);
    }

    if (rzp !== this.rzp) {
      if (_El.parent(el) !== parent2) {
        _El.append(parent2, el);
      }
      this.rzp = rzp;
    }

    setInitialContext();

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

  makeMessage: function (eventName, responseExtras) {
    let rzp = this.rzp;
    let options = rzp.get();

    let response = {
      integration: Track.props.integration,
      referer: Track.props.referer || location.href,
      options: options,
      library: Track.props.library,
      id: rzp.id,
    };

    if (eventName) {
      response.event = eventName;
    }

    if (rzp._order) {
      // _order is the order object and is added to the
      // instance from the plugin side. This is for the prefetch prefs flow
      // refer handleMessage for how it's used
      response._order = rzp._order;
    }

    if (rzp._prefs) {
      response._prefs = rzp._prefs;
    }

    if (rzp.metadata) {
      response.metadata = rzp.metadata;
    }

    if (responseExtras) {
      response.extra = responseExtras;
    }

    ObjectUtils.loop(rzp.modal.options, function (option, i) {
      options['modal.' + i] = option;
    });

    if (this.embedded) {
      delete options.parent;
      response.embedded = true;
    }

    sanitizeImage(options);
    return response;
  },

  close: function () {
    setBackdropColor('');
    setTestRibbonInvisible();
    restoreMetas(this.$metas);
    restoreOverflow();

    // unbind before triggering scroll
    this.unbind();
    if (ua_iPhone) {
      scrollTo(0, merchantMarkup.oldY);
    }
    cleanupFreezeCheck();
    Track.flush();
  },

  bind: function () {
    if (!this.listeners) {
      this.listeners = [];
      let eventPairs = {};

      if (ua_iPhone) {
        eventPairs.orientationchange = merchantMarkup.orientationchange;

        if (!this.rzp.get('parent')) {
          // eventPairs.scroll = merchantMarkup.scroll;
          eventPairs.resize = merchantMarkup.resize;
        }
      }

      ObjectUtils.loop(eventPairs, (listener, event) => {
        this.listeners.push(window |> _El.on(event, listener.bind(this)));
      });
    }
  },

  unbind: function () {
    this.listeners.forEach((fx) => {
      if (typeof fx === 'function') {
        fx();
      }
    });
    this.listeners = null;
  },

  setMetaAndOverflow: function () {
    if (!head) {
      return;
    }

    getMetas().forEach((meta) => _El.detach(meta));

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

    this.$metas.forEach(_El.appendTo(head));

    merchantMarkup.overflow = docStyle.overflow;
    docStyle.overflow = 'hidden';

    if (ua_iPhone) {
      merchantMarkup.oldY = global.pageYOffset;
      global.scrollTo(0, 0);
      merchantMarkup.orientationchange.call(this);
    }
  },

  postMessage: function (response) {
    if (typeof response !== 'object') {
      // TODO roll
    }
    response.id = this.rzp.id;
    response = JSON.stringify(response);
    this.el?.contentWindow?.postMessage(response, '*');
  },

  prefetchPrefs: function (rzp) {
    if (rzp !== this.rzp) {
      this.rzp = rzp;
    }
    this.postMessage(this.makeMessage('prefetch'));
  },

  makeCheckoutCallForShopify: function (rzp, body) {
    if (rzp !== this.rzp) {
      this.rzp = rzp;
    }
    if (!isCheckoutFrameLoaded) {
      /**
       * sometimes, Edge will not return checkout-frame.js due to the captcha changes.
       * Emitting this event will let the merchant-side script know to fallback to
       * the standard open flow.
       */
      this.onevent({
        event: 'shopify_failure',
      });
      return;
    }
    this.postMessage(this.makeMessage('1cc_shopify_checkout_initiate', body));
  },

  onmessage: function (e) {
    let data = ObjectUtils.parse(e.data);
    if (!data) {
      return;
    }

    let event = data.event;
    let rzp = this.rzp;
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

    try {
      // Only process message if the iframe origin isn't
      // tampered with or belong to razorpay domain
      if (
        RazorpayConfig.api.indexOf(e.origin) !== 0 &&
        !/.*[.]razorpay.(com|in)$/.test(e.origin)
      ) {
        Analytics.track('postmessage_origin_redflag', {
          type: AnalyticsTypes.METRIC,
          data: {
            origin: e.origin,
          },
          immediately: true,
        });

        // Commenting out `return`, as we initially want to
        // track the origins first. Based on the data
        // we will either modify the conditions or
        // simply uncomment the next line if there
        // are no unexpected origins.

        // return;
      }
    } catch (error) {
      // no-op
    }

    data = data.data;
    this['on' + event](data);

    if (event === 'dismiss' || event === 'fault') {
      Analytics.track(event, {
        data,
        r: rzp,
        immediately: true,
      });
    }
  },

  onload: function (data) {
    /**
     * 'load' event is sent when checkout-frame is loaded and initialised
     */
    if (data && data.origin === 'checkout-frame') {
      isCheckoutFrameLoaded = true;
    }
    if (this.rzp) {
      this.postMessage(this.makeMessage());
    }
  },

  onfocus: function () {
    this.isFocused = true;
  },

  onblur: function () {
    this.isFocused = false;
    merchantMarkup.orientationchange.call(this);
  },

  onrender: function () {
    if (loader) {
      loader |> _El.detach;
      loader = null;
    }
    this.rzp.emit('render');
  },

  onevent: function (data) {
    this.rzp.emit(data.event, data.data);
  },

  ongaevent: function (data) {
    const { event, category, params = {} } = data;
    this.rzp.set('enable_ga_analytics', true);
    if (window?.gtag && typeof window.gtag === 'function') {
      window.gtag('event', event, {
        event_category: category,
        ...params,
      });
    }

    if (window?.ga && typeof window.ga === 'function') {
      if (event === ACTIONS.PAGE_VIEW) {
        sendToAll('send', {
          hitType: 'pageview',
          title: category,
        });
      } else {
        sendToAll('send', {
          hitType: 'event',
          eventCategory: category,
          eventAction: event,
        });
      }
    }
  },
  onfbaevent: function (data) {
    const { eventType = 'trackCustom', event, category, params = {} } = data;
    if (window?.fbq && typeof window.fbq === 'function') {
      this.rzp.set('enable_fb_analytics', true);
      if (category) {
        params.page = category;
      }
      window.fbq(eventType, event, params);
    }
  },

  onredirect: function (data) {
    Track.flush();

    /**
     * redirect top window if no redirection target specified by merchant
     * else redirectTo will result into an error due to confusion over which
     * frame to redirect if checkout.js resides within another iframe
     *
     * Also, the reason we can't change default value of "target" option itself
     * to _top is that checkout-frame may not have permission to redirect top
     * frame due to being sandboxed based on CSP header
     * so it gotta be checkout.js which triggers the redirect
     */
    if (!data.target) {
      data.target = this.rzp.get('target') || '_top';
    }
    redirectTo(data);
  },

  onsubmit: function (data) {
    Track.flush();

    let rzp = this.rzp;

    // check if it was one of the external wallets
    if (data.method === 'wallet') {
      (rzp.get('external.wallets') || []).forEach(function (walletName) {
        if (walletName === data.wallet) {
          try {
            rzp.get('external.handler').call(rzp, data);
          } catch (e) {
            console.error(e); // eslint-disable-line no-console
          }
        }
      });
    }
    rzp.emit('payment.submit', {
      method: data.method,
    });
  },

  ondismiss: function (data) {
    this.close();
    let dismiss = this.rzp.get('modal.ondismiss');
    if (_.isFunction(dismiss)) {
      setTimeout(() => dismiss(data));
    }
  },

  onhidden: function () {
    Track.flush();
    this.afterClose();
    let hidden = this.rzp.get('modal.onhidden');
    if (_.isFunction(hidden)) {
      hidden();
    }
  },

  // this is onsuccess method
  oncomplete: function (data) {
    const options = this.rzp.get();
    const { enable_ga_analytics, enable_fb_analytics } = options;
    if (enable_ga_analytics) {
      this.ongaevent({
        event: ACTIONS.PAYMENT_SUCCESSFUL,
        category: CATEGORIES.PAYMENT_METHODS,
      });
    }
    if (enable_fb_analytics) {
      this.onfbaevent({
        event: ACTIONS.PAYMENT_SUCCESSFUL,
        category: CATEGORIES.PAYMENT_METHODS,
      });
    }
    this.close();
    let rzp = this.rzp;
    let handler = rzp.get('handler');
    Analytics.track('checkout_success', {
      r: rzp,
      data,
      immediately: true,
    });
    if (_.isFunction(handler)) {
      setTimeout(function () {
        handler.call(rzp, data);
      }, 200);
    }
  },

  onpaymenterror: function (data) {
    Track.flush();
    const options = this.rzp.get();
    const { enable_ga_analytics, enable_fb_analytics } = options;
    if (enable_ga_analytics) {
      this.ongaevent({
        event: ACTIONS.PAYMENT_FAILED,
        category: CATEGORIES.PAYMENT_METHODS,
      });
    }
    if (enable_fb_analytics) {
      this.onfbaevent({
        event: ACTIONS.PAYMENT_FAILED,
        category: CATEGORIES.PAYMENT_METHODS,
      });
    }
    try {
      const callbackUrl = this.rzp.get('callback_url');
      const redirect = this.rzp.get('redirect') || shouldRedirect;
      const retry = this.rzp.get('retry');

      if (redirect && callbackUrl && retry === false) {
        // NOTE: backend does json_encode() on the error metadata to send object string
        // replicating the same behaviour here otherwise callback endpoint will
        // recieve inconsistent data.
        if (data?.error?.metadata) {
          data.error.metadata = JSON.stringify(data.error.metadata);
        }

        redirectTo({
          url: callbackUrl,
          content: data,
          method: 'post',
          target: this.rzp.get('target') || '_top',
        });

        return;
      }

      this.rzp.emit('payment.error', data);
      this.rzp.emit('payment.failed', data);
    } catch (e) {}
  },

  onfailure: function (data) {
    const options = this.rzp.get();
    const { enable_ga_analytics, enable_fb_analytics } = options;
    if (enable_ga_analytics) {
      this.ongaevent({
        event: ACTIONS.PAYMENT_FAILED,
        category: CATEGORIES.PAYMENT_METHODS,
      });
    }
    if (enable_fb_analytics) {
      this.onfbaevent({
        event: ACTIONS.PAYMENT_FAILED,
        category: CATEGORIES.PAYMENT_METHODS,
      });
    }
    this.ondismiss();
    global.alert('Payment Failed.\n' + data.error.description);
    this.onhidden();
  },

  onfault: function (data) {
    let message = 'Something went wrong.';

    if (_.isString(data)) {
      message = data;
    } else if (_.isObject(data) && (data.message || data.description)) {
      message = data.message || data.description;
    }

    Track.flush();
    this.rzp.close();
    this.rzp.emit('fault.close');

    const callbackUrl = this.rzp.get('callback_url');
    const redirect = this.rzp.get('redirect') || shouldRedirect;

    if (redirect && callbackUrl) {
      submitForm({
        url: callbackUrl,
        params: {
          error: data,
        },
        method: 'POST',
      });
    } else {
      global.alert('Oops! Something went wrong.\n' + message);
    }
    this.afterClose();
  },

  afterClose: function () {
    cleanupFreezeCheck();
    CheckoutFrame.container.style.display = 'none';
  },

  onflush: function (e) {
    Track.flush(e);
  },
};
