import * as GPay from 'gpay';
import * as strings from 'common/strings';
import {
  parseUPIIntentResponse,
  didUPIIntentSucceed,
  upiBackCancel,
} from 'common/upi';
import { androidBrowser } from 'common/useragent';
import Track from 'tracker';
import { RazorpayConfig } from 'common/Razorpay';
import Analytics from 'analytics';
import { getSession } from 'sessionmanager';

export const processOtpResponse = function(response) {
  var error = response.error;
  Track(this.r, 'otp_response', response);
  if (error) {
    if (error.action === 'RETRY') {
      return this.emit('otp.required', strings.wrongOtp);
    } else if (error.action === 'TOPUP') {
      return this.emit('wallet.topup', error.description);
    }
    return this.complete(response);
  }
  processCoproto.call(this, response);
};

export const processPaymentCreate = function(response) {
  var payment = this;
  var r = payment.r;

  payment.payment_id = response.payment_id;
  payment.magicCoproto = response.magic || false;

  Track(r, 'ajax_response', response);

  var popup = payment.popup;

  // race between popup close poll and ajaxCallback. don't continue if payment has been canceled
  if (popup && popup.checkClose && popup.checkClose()) {
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
    if (this.iframe && this.popup) {
      this.popup.writable = 1;
    }
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

  cardless_emi: function(request, fullResponse) {
    this.emit('process', {
      request,
      response: fullResponse,
    });
  },

  first: function(request, fullResponse) {
    var direct = request.method === 'direct';
    var content = request.content;
    var popup = this.popup;
    var coprotoMagic = fullResponse.magic ? fullResponse.magic : false;

    if (this.data && this.data.wallet === 'amazonpay') {
      request.content = {};
    }

    if (this.isMagicPayment) {
      if (coprotoMagic) {
        this.emit('magic.init');
      }

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
      if (this.iframe) {
        popup.show();
      }
      if (direct) {
        // direct is true for payzapp
        popup.write(content);
      } else {
        _Doc.submitForm(
          request.url,
          request.content,
          request.method,
          popup.name
        );
      }
      // popup blocking addons close popup once we set a url
      setTimeout(() => {
        if (popup.window.closed && this.r.get('callback_url')) {
          this.r.set('redirect', true);
          this.checkRedirect();
        }
      });
    } else {
      if (this.sdk_popup) {
        return global.CheckoutBridge.invokePopup(
          _Obj.stringify({
            focus: true,
            magic: false,
            otpelf: true,
            url: `javascript: submitForm('${request.url}', ${_Obj.stringify(
              request.content
            )}, '${request.method}')`,
          })
        );
      }
      this.checkRedirect();
    }
  },

  async: function(request, fullResponse) {
    this.ajax = fetch
      .jsonp({
        url: request.url,
        callback: response => this.complete(response),
      })
      .till(response => response && response.status);

    this.emit('upi.pending', fullResponse.data);
  },

  gpay_inapp: function(request) {
    this.ajax = fetch
      .jsonp({
        url: request.url,
        callback: response => this.complete(response),
      })
      .till(response => response && response.status);

    this.emit('upi.pending', { flow: 'upi-intent' });
  },

  gpay: function(coprotoRequest, fullResponse, type = 'payment_request') {
    if (type === 'payment_request') {
      GPay.payWithPaymentRequestApi(
        fullResponse.data,
        instrument => {
          Track(this.r, 'gpay_pay_response', {
            instrument,
          });

          this.emit('upi.intent_response', {
            response: instrument.details,
          });
        },
        error => {
          if (error.code) {
            if (
              [error.ABORT_ERR, error.NOT_SUPPORTED_ERR].indexOf(error.code) >=
              0
            ) {
              this.emit('upi.intent_response', {});
            }

            // Since the method is not supported, remove it.
            if (error.code === error.NOT_SUPPORTED_ERR) {
              const session = getSession();

              if (session && session.upiTab) {
                session.upiTab.$set({
                  useWebPaymentsApi: false,
                  selectedApp: 'gpay',
                });
              }
            }
          }

          Track(this.r, 'gpay_error', error);
        }
      );
    } else if (type === 'microapp') {
      GPay.payWithMicroapp(fullResponse.data.intent_url)
        .then(response => {
          Analytics.track('gpay_pay_response', {
            data: response.paymentMethodData,
          });
          this.emit('upi.intent_success_response', response.paymentMethodData);
        })
        .catch(error => {
          Analytics.track('gpay_error', {
            data: error,
          });
          this.emit('cancel', upiBackCancel);
        });
    }
  },
  intent: function(request, fullResponse) {
    var ra = ({ transactionReferenceId } = {}) =>
      fetch
        .jsonp({
          url: request.url,
          callback: response => {
            // transactionReferenceId is required for Google Pay microapps payments
            if (transactionReferenceId) {
              response.transaction_reference = transactionReferenceId; // This is snake_case to maintain convention
            }

            this.complete(response);
          },
        })
        .till(response => response && response.status);

    var intent_url = (fullResponse.data || {}).intent_url;

    this.on('upi.intent_success_response', data => {
      if (data) {
        this.emit('upi.pending', { flow: 'upi-intent', response: data });
      }

      this.ajax = ra(data);
    });

    this.on('upi.intent_response', data => {
      if (data |> parseUPIIntentResponse |> didUPIIntentSucceed) {
        this.emit('upi.intent_success_response', data);
      } else {
        this.emit('cancel', upiBackCancel);
      }
    });

    this.emit('upi.coproto_response', fullResponse);

    var CheckoutBridge = window.CheckoutBridge;
    if (CheckoutBridge && CheckoutBridge.callNativeIntent) {
      // If there's a UPI App specified, use it.
      if (this.upi_app) {
        CheckoutBridge.callNativeIntent(intent_url, this.upi_app);
      } else {
        CheckoutBridge.callNativeIntent(intent_url);
      }
    } else if (androidBrowser) {
      if (this.gpay) {
        if (this.microapps && this.microapps.gpay) {
          return responseTypes['gpay'].call(
            this,
            request,
            fullResponse,
            'microapp'
          );
        }

        return responseTypes['gpay'].call(this, request, fullResponse);
      }
    }
  },

  otp: function(request, fullResponse) {
    if (!this.nativeotp && !this.iframe && request.method === 'direct') {
      return responseTypes.first.call(this, request, responseTypes);
    }
    if (this.data.method === 'wallet') {
      this.otpurl = request.url;
      this.emit('otp.required');
    } else {
      Analytics.setMeta('headless', true);
      this.otpurl = fullResponse.submit_url;
      this.gotoBankUrl = fullResponse.redirect;
      this.emit('otp.required', fullResponse);
    }
  },

  // prettier-ignore
  'return': function (request) {
    _Doc.redirect(request);
  },

  respawn: function(request, fullResponse) {
    // If Cardless EMI, route the coproto
    if (this.data && this.data.method === 'cardless_emi') {
      return responseTypes.cardless_emi.call(this, request, fullResponse);
    }

    // By default, use first coproto.
    return responseTypes.first.call(this, request, fullResponse);
  },
};

function mwebIntent(payment, ra, fullResponse) {
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

    global.removeEventListener('blur', blurHandler);
    global.removeEventListener('focus', focHandler);
    ra();
  };

  global.addEventListener('blur', blurHandler);
  global.addEventListener('focus', focHandler);

  global.location = fullResponse.data.intent_url;
}
