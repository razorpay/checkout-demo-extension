import * as GPay from 'gpay';
import {
  parseUPIIntentResponse,
  didUPIIntentSucceed,
  upiBackCancel,
  getAppFromPackageName,
  GOOGLE_PAY_PACKAGE_NAME,
} from 'common/upi';
import { androidBrowser } from 'common/useragent';
import Track from 'tracker';
import Analytics from 'analytics';
import { getBankFromCardCache } from 'common/bank';
import * as Bridge from 'bridge';
import { ADAPTER_CHECKERS } from 'payment/adapters';

export const processOtpResponse = function(response) {
  var error = response.error;
  Track(this.r, 'otp_response', response);
  if (error) {
    if (error.action === 'RETRY') {
      return this.emit('otp.required', 'incorrect_otp_retry');
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

/**
 * For async payments where callback_url needs to be sent (example: CRED),
 * the status API will return a type: return coproto for some reason,
 * this response is not handled on the SDK-side,
 * so just consider what's present in the request content.
 * Usually it will be the razorpay_payment_id & other things.
 *
 * @param response
 * @returns {*}
 */
const handleAsyncStatusResponse = function(response) {
  if (response.type === 'return') {
    return response.request.content;
  }
  return response;
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
    if (request.method === 'redirect') {
      request.method = 'post';
    }
    var direct = request.method === 'direct';
    var content = request.content;
    var popup = this.popup;

    if (this.data && this.data.wallet === 'amazonpay') {
      request.content = {};
    }

    if (this.nativeotp) {
      Analytics.track('native_otp:error', {
        data: {
          error: 'TYPE_FIRST',
        },
      });
      // We were expecting `type: 'otp'` response from API (to ask OTP on checkout),
      // API sent `type: 'first'` response, can't open popup now.
      // Most gateways block iframe.
      // The only option left now is to redirect.
      if (this.r.get('redirect')) {
        this.redirect(request);

        return;
      } else {
        // ಠ_ಠ - Should not reach here.
        Analytics.track('native_otp:error', {
          data: {
            error: 'REDIRECT_PARAMS_MISSING',
          },
        });
        // If request.method = 'direct', then we've got HTML in content key.
        // Else we got request (method = get/post) with content.
        if (direct) {
          this.gotoBankHtml = content;
        } else {
          this.gotoBankRequest = request;
        }
        return this.emit('3ds.required');
      }
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
      this.checkRedirect();
    }
  },

  async: function(request, fullResponse) {
    this.ajax = fetch
      .jsonp({
        url: request.url,
        callback: response => this.complete(response),
      })
      .till(response => response && response.status, 10);

    if (this.data.method === 'app') {
      this.emit('app.pending', fullResponse);
    } else {
      this.emit('upi.pending', fullResponse.data);
    }
  },

  application: function(request, fullResponse) {
    var payment = this;

    // Save request for later use (polling status)
    payment.request = request;

    // Send the coproto payload to SDK for further processing.
    payment.emit('externalsdk.process', fullResponse);

    // Set a listener to handle the intent response.
    payment.on('app.intent_response', response => {
      // Track intent response
      Analytics.track('intent_response', { data: { response } });

      // Check the intent response
      if (response.provider === 'GOOGLE_PAY') {
        if (response.data.apiResponse.type === 'google_pay_cards') {
          if (response.resultCode === 0) {
            // Payment was cancelled on Google Pay app.
            payment.emit('cancel', GPay.googlePayCardsCancelPayload);

            return;
          }
        }
      }

      // Starting polling API for payment status.
      var request = payment.request;
      payment.ajax = fetch
        .jsonp({
          url: request.url,
          callback: response =>
            payment.complete(handleAsyncStatusResponse(response)),
        })
        .till(response => response && response.status, 10);
    });
  },

  gpay_inapp: function(request) {
    this.ajax = fetch
      .jsonp({
        url: request.url,
        callback: response => this.complete(response),
      })
      .till(response => response && response.status, 10);

    this.emit('upi.pending', { flow: 'upi-intent' });
  },

  web_payments: function(response) {
    var instrumentData = {};
    var data = response.data;
    data.intent_url
      .replace(/^.*\?/, '')
      .replace(/([^=&]+)=([^&]*)/g, (m, key, value) => {
        instrumentData[decodeURIComponent(key)] = decodeURIComponent(value);
      });
    instrumentData.url = 'https://razorpay.com';

    const supportedInstruments = [
      {
        supportedMethods: ADAPTER_CHECKERS[this.upi_app],
        data: instrumentData,
      },
    ];

    const details = {
      total: {
        label: 'Payment',
        amount: {
          currency: 'INR',
          value: parseFloat(instrumentData.am).toFixed(2),
        },
      },
    };

    const PaymentRequest = global.PaymentRequest;

    try {
      const request = new PaymentRequest(supportedInstruments, details);
      request
        .show()
        .then(instrument => {
          console.log('done', instrument);

          return instrument.complete();
        })
        /* jshint ignore:start */
        .catch(e => {
          console.log('error', e);
          // errorCallback(e);
        });
      /* jshint ignore:end */
    } catch (e) {
      // errorCallback(e);
    }
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
              Analytics.track('gpay:not_supported', {
                data: {
                  error,
                },
              });

              // TODO: (nice to have) Remove the Google Pay app from UI
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
    const CheckoutBridge = global.CheckoutBridge;

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
        .till(response => response && response.status, 10);

    var intent_url = (fullResponse.data || {}).intent_url;

    if (this.data.method === 'app') {
      this.emit('app.coproto_response', fullResponse);

      if (Bridge.checkout.platform === 'ios') {
        Bridge.checkout.callIos('callNativeIntent', {
          intent_url,
          shortcode: this.data.provider,
        });
      } else {
        CheckoutBridge.callNativeIntent(intent_url);
      }

      this.on('app.intent_response', response => {
        if (response.provider === 'CRED') {
          if (response.data === 0) {
            // Payment was cancelled on CRED app.
            this.emit('cancel', {
              '_[method]': 'app',
              '_[provider]': 'cred',
              '_[reason]': 'PAYMENT_CANCEL_ON_APP',
            });

            return; // Don't poll for status as the payment was cancelled.
          }
        }
        this.ajax = fetch
          .jsonp({
            url: request.url,
            callback: response =>
              this.complete(handleAsyncStatusResponse(response)),
          })
          .till(response => response && response.status, 10);
      });

      return;
    }

    const startPolling = data => {
      if (data) {
        this.emit('upi.pending', { flow: 'upi-intent', response: data });
      }

      this.ajax = ra(data);
    };

    if (Bridge.checkout.platform === 'ios') {
      startPolling();
    } else {
      this.on('upi.intent_success_response', startPolling);
    }

    this.on('upi.intent_response', data => {
      if (data |> parseUPIIntentResponse |> didUPIIntentSucceed) {
        this.emit('upi.intent_success_response', data);
      } else {
        this.emit('cancel', upiBackCancel);
      }
    });

    this.emit('upi.coproto_response', fullResponse);

    if (CheckoutBridge && CheckoutBridge.callNativeIntent) {
      // If there's a UPI App specified, use it.
      if (this.upi_app) {
        CheckoutBridge.callNativeIntent(intent_url, this.upi_app);
      } else {
        CheckoutBridge.callNativeIntent(intent_url);
      }
    } else if (this.gpay) {
      if (this.microapps && this.microapps.gpay) {
        return responseTypes['gpay'].call(
          this,
          request,
          fullResponse,
          'microapp'
        );
      }

      if (androidBrowser) {
        if (this.upi_app === GOOGLE_PAY_PACKAGE_NAME) {
          return responseTypes['gpay'].call(this, request, fullResponse);
        } else {
          return responseTypes['web_payments'].call(this, fullResponse);
        }
      }
    } else if (this.upi_app) {
      // upi_app will only be set for UPI intent payments.
      // Check for its existence as this coproto is also used for
      // UPI QR payments on web, where this is not required.
      const app = getAppFromPackageName(this.upi_app);

      return Bridge.checkout.callIos('callNativeIntent', {
        intent_url,
        upi_app: this.upi_app,
        shortcode: app.shortcode,
      });
    }
  },

  otp: function(request, fullResponse) {
    if (!this.nativeotp && !this.iframe && request.method === 'direct') {
      return responseTypes.first.call(this, request, responseTypes);
    }
    // TODO: Remove this usage when API starts sending "mode: hdfc_debit_emi"
    let bank;
    if (this.data.method === 'emi' && this.data.token) {
      bank = getBankFromCardCache(this.data.token);
    } else {
      const iin = fullResponse.metadata && fullResponse.metadata.iin;
      bank = getBankFromCardCache(iin);
    }
    if (this.data.method === 'wallet') {
      this.otpurl = request.url;
      this.emit('otp.required');
    } else if (this.data.method === 'emi' && bank.code === 'HDFC_DC') {
      this.otpurl = fullResponse.submit_url;
      // TODO: Remove this explicit assignment when backend starts sending it.
      fullResponse.mode = 'hdfc_debit_emi';
      this.emit('otp.required', fullResponse);
    } else {
      Analytics.setMeta('headless', true);
      this.otpurl = fullResponse.submit_url;
      this.gotoBankUrl = fullResponse.redirect;
      this.emit('otp.required', fullResponse);
    }
  },

  // prettier-ignore
  'return': function (request) {
    request.target = this.r.get('target');
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
