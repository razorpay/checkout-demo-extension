import * as Tez from './tez';
import { parseUPIIntentResponse, didUPIIntentSucceed } from 'lib/upi';

export const processOtpResponse = function(response) {
  var error = response.error;
  if (error) {
    if (error.action === 'RETRY') {
      return this.emit('otp.required', discreet.msg.wrongotp);
    } else if (error.action === 'TOPUP') {
      return this.emit('wallet.topup', error.description);
    }
    this.complete(response);
  }
  processCoproto.call(this, response);
};

export const processPaymentCreate = function(response) {
  var payment = this;

  payment.payment_id = response.payment_id;
  payment.magicCoproto = response.magic || false;

  var popup = payment.popup;

  // race between popup close poll and ajaxCallback. don't continue if payment has been canceled
  if (popup && popup.checkClose()) {
    return; // return if it's already closed
    // otherwise subsequesnt code may lead to redirection in main window
  }

  // if ajax call is blocked by ghostery or some other reason, fall back to redirection in popup
  if (response.error && response.xhr && response.xhr.status === 0) {
    payment.trySubmit();
    return Track(payment.r, 'no_popup');
  }

  processCoproto.call(payment, response);
};

// returns true if coproto handled
export const processCoproto = function(response) {
  if (response.razorpay_payment_id || response.error) {
    this.complete(response);
  } else {
    var func = responseTypes[response.type];
    var isFunction = _.isFunction(func);
    if (isFunction) {
      func.call(this, response.request, response);
    }
    return isFunction;
  }
};

var responseTypes = {
  // this === payment
  first: function(request, fullResponse) {
    var direct = request.method === 'direct';
    var content = request.content;
    var popup = this.popup;
    var coprotoMagic = fullResponse.magic ? fullResponse.magic : false;

    if (this.isMagicPayment) {
      this.emit('magic.init');

      var popupOptions = {
        focus: !coprotoMagic,
        magic: coprotoMagic,
        otpelf: true,
      };

      if (direct) {
        popupOptions.content = content;
      } else {
        var url =
          "javascript: submitForm('" +
          request.url +
          "', " +
          _Obj.stringify(request.content) +
          ", '" +
          request.method +
          "')";
        popupOptions.url = url;
      }

      global.CheckoutBridge.invokePopup(_Obj.stringify(popupOptions));
    } else if (popup) {
      if (direct) {
        // direct is true for payzapp
        popup.write(content);
      } else {
        _Doc.submitForm(
          request.url,
          request.content,
          request.method,
          popup.window.name
        );
      }
      // popup blocking addons close popup once we set a url
      setTimeout(() => {
        if (popup.window.closed && this.r.get('callback_url')) {
          this.r.set('redirect', true);
          this.checkRedirect();
        }
      });
    }
  },

  async: function(request, fullResponse) {
    this.ajax = fetch({
      url: request.url,
      callback: response => this.complete(response),
    }).till(response => response && response.status);

    this.emit('upi.pending', fullResponse.data);
  },

  tez: function(coprotoRequest, fullResponse) {
    Tez.pay(
      fullResponse.data,
      instrument => {
        this.emit('upi.intent_response', {
          response: instrument.details,
        });
      },
      error => {
        if (error.code && error.code === error.ABORT_ERR) {
          this.emit('upi.intent_response', {});
        }

        Track(this.r, 'tez_error', error);
      }
    );
  },

  intent: function(request, fullResponse) {
    var upiBackCancel = {
      '_[method]': 'upi',
      '_[flow]': 'intent',
      '_[reason]': 'UPI_INTENT_BACK_BUTTON',
    };

    var ra = () =>
      fetch({
        url: request.url,
        callback: response => this.complete(response),
      }).till(response => response && response.status);

    this.emit('upi.coproto_response', request);

    var intent_url = (fullResponse.data || {}).intent_url;

    this.on('upi.intent_response', data => {
      const didIntentSucceed =
        data |> parseUPIIntentResponse |> didUPIIntentSucceed;

      if (didIntentSucceed) {
        this.emit('upi.pending', { flow: 'upi-intent', response: data });
      } else {
        return this.emit('cancel', upiBackCancel);
      }

      this.ajax = ra();
    });

    var CheckoutBridge = window.CheckoutBridge;
    if (CheckoutBridge && CheckoutBridge.callNativeIntent) {
      // If there's a UPI App specified, use it.
      if (this.upi_app) {
        CheckoutBridge.callNativeIntent(intent_url, this.upi_app);
      } else {
        CheckoutBridge.callNativeIntent(intent_url);
      }
    } else if (ua_android_browser) {
      if (this.tez) {
        return responseTypes['tez'].call(this, request, fullResponse);
      }

      // Start Timeout
      var drawerTimeout = setTimeout(() => {
        /**
         * If upi app selection drawer not happened (technically,
         * checkout is not blurred until 3 sec)
         */
        this.emit('cancel', {
          '_[method]': 'upi',
          '_[flow]': 'intent',
          '_[reason]': 'UPI_INTENT_WEB_NO_APPS',
        });
        this.emit('upi.noapp');
      }, 3000);

      var blurHandler = () => {
        /**
         * If upi app selection drawer opened before 3 sec, clear timeout
         */
        clearTimeout(drawerTimeout);
        this.emit('upi.selectapp');
      };

      var focHandler = () => {
        this.emit('upi.pending', { flow: 'upi-intent' });

        window.removeEventListener('blur', blurHandler);
        window.removeEventListener('focus', focHandler);
        ra();
      };

      window.addEventListener('blur', blurHandler);
      window.addEventListener('focus', focHandler);

      window.location = fullResponse.data.intent_url;
    }
  },

  otp: function(request) {
    this.otpurl = request.url;
    this.emit('otp.required');
  },

  // prettier-ignore
  'return': function(request) {
    discreet.redirect(request);
  }
};
