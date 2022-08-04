import * as GPay from 'gpay';
import fetch from 'utils/fetch';
import {
  didUPIIntentSucceed,
  getAppFromPackageName,
  GOOGLE_PAY_PACKAGE_NAME,
  parseUPIIntentResponse,
  upiBackCancel,
} from 'common/upi';

import { getMerchantKey } from 'razorpay';

import { androidBrowser } from 'common/useragent';
import Analytics, { Track } from 'analytics';
import * as AnalyticsTypes from 'analytics-types';

import * as Bridge from 'bridge';

import { isWebPaymentsApiAvailable } from 'common/webPaymentsApi';
import { submitForm } from 'common/form';

import { supportedWebPaymentsMethodsForApp } from 'payment/adapters';
import { writePopup, updatePopup } from './popup/template';
import { checkValidFlow, createIframe, isRazorpayFrame } from './utils';
import FLOWS from 'config/FLOWS';
import { popupIframeCheck } from './helper';
import { redirectTo } from 'utils/doc';

const getParsedDataFromUrl = (url) => {
  const parsedData = {};
  url.replace(/^.*\?/, '').replace(/([^=&]+)=([^&]*)/g, (m, key, value) => {
    parsedData[decodeURIComponent(key)] = decodeURIComponent(value);
  });
  return parsedData;
};

export const processOtpResponse = function (response) {
  let error = response.error;
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

export const processPaymentCreate = function (response) {
  let payment = this;
  let r = payment.r;

  payment.payment_id = response.payment_id;

  Track(r, 'ajax_response', response);

  let popup = payment.popup;

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
const handleAsyncStatusResponse = function (response) {
  if (response.type === 'return') {
    return response.request.content;
  }
  return response;
};

// returns true if coproto handled
export const processCoproto = function (response) {
  if (response.razorpay_payment_id || response.error) {
    this.complete(response);
  } else {
    if (this.iframe && this.popup) {
      this.popup.writable = 1;
    }
    /**
     * Emit createPayment.responseType event.
     * `createPayment.responseType` is being used to show the otp view for wallets depending on ajax api response, instead of deciding on UI.
     */
    this.emit('createPayment.responseType', response.type);
    let func = responseTypes[response.type];
    let isFunction = _.isFunction(func);
    if (isFunction) {
      func.call(this, response.request, response);
    }
    return isFunction;
  }
};

const responseTypes = {
  // this === payment

  cardless_emi: function (request, fullResponse) {
    this.emit('process', {
      request,
      response: fullResponse,
    });
  },

  first: function (request) {
    if (request.method === 'redirect') {
      if (this.data.method === 'app' && this.data.provider === 'cred') {
        this.avoidPopup = false;
        this.tryPopup();
        this.writePopup();
      }
      request.method = request.http_method || 'post';
    }
    let direct = request.method === 'direct';
    let content = request.content;
    let popup = this.popup;

    if (
      (this.data && this.data.wallet === 'amazonpay') ||
      (this.data.method === 'app' && this.data.provider === 'trustly')
    ) {
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
      }
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
    } else if (
      /** check for forceIframe feature use by walnut 369 & its only for Standard checkout */
      isRazorpayFrame() &&
      checkValidFlow(this.data, FLOWS.FORCE_IFRAME)
    ) {
      // create an iframe
      const IframeElement = this.forceIframeElement || createIframe(true);
      if (!this.forceIframeElement) {
        this.forceIframeElement = IframeElement;
      }
      // hide modal & show iframe
      IframeElement.window.focus();
      this.popup = IframeElement;
      writePopup(IframeElement.contentWindow, this);

      // post submit to iframe
      submitForm({
        doc: IframeElement.contentDocument,
        url: request.url,
        params: request.content,
        method: request.method,
      });
    } else if (popup) {
      if (this.iframe) {
        popup.show();
      }
      if (direct) {
        // direct is true for payzapp
        updatePopup(popup.window, content);
      } else {
        if (!popupIframeCheck(this, request)) {
          submitForm({
            doc: window.document,
            url: request.url,
            params: request.content,
            method: request.method,
            target: popup.name,
          });
        }
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

  async: function (request, fullResponse) {
    Analytics.track('metric:polling_started', {
      data: {
        data: fullResponse,
        platform: Bridge.checkout.platform,
        location: 'coproto:async',
      },
      immediately: true,
    });
    this.ajax = fetch
      .jsonp({
        url: request.url,
        callback: (response) => this.complete(response),
      })
      .till((response) => response && response.status, 10);

    if (this.data.method === 'app') {
      this.emit('app.pending', fullResponse);
    } else {
      this.emit('upi.pending', fullResponse.data);
    }
  },

  application: function (request, fullResponse) {
    let payment = this;

    // Save request for later use (polling status)
    payment.request = request;

    // Send the coproto payload to SDK for further processing.
    payment.emit('externalsdk.process', fullResponse);

    // Set a listener to handle the intent response.
    payment.on('app.intent_response', (response) => {
      // Track intent response
      Analytics.track('intent_response', { data: { response } });

      // Check the intent response
      if (response.provider === 'GOOGLE_PAY') {
        if (response.data.apiResponse.type === 'gpay_merged') {
          if (response.resultCode === 0) {
            // Payment was cancelled on Google Pay app.
            payment.emit('cancel', GPay.googlePayMergedCancelPayload);

            return;
          }
        }
      }

      // Starting polling API for payment status.
      let request = payment.request;
      Analytics.track('metric:polling_started', {
        data: {
          data: request,
          platform: Bridge.checkout.platform,
          location: 'coproto:responseType:application',
        },
        immediately: true,
      });
      payment.ajax = fetch
        .jsonp({
          url: request.url,
          callback: (response) =>
            payment.complete(handleAsyncStatusResponse(response)),
        })
        .till((response) => response && response.status, 10);
    });
  },

  gpay_inapp: function (request) {
    Analytics.track('metric:polling_started', {
      data: {
        data: request,
        platform: Bridge.checkout.platform,
        location: 'coproto:responseType:gpay_inapp',
      },
      immediately: true,
    });
    this.ajax = fetch
      .jsonp({
        url: request.url,
        callback: (response) => this.complete(response),
      })
      .till((response) => response && response.status, 10);

    this.emit('upi.pending', { flow: 'upi-intent' });
  },

  web_payments: function (response, app) {
    const data = response.data;
    const instrumentData = {
      url: data.intent_url,
    };

    const parsedData = getParsedDataFromUrl(data.intent_url);

    const supportedInstruments = [
      {
        supportedMethods: supportedWebPaymentsMethodsForApp[app],
        data: instrumentData,
      },
    ];

    const amountFromPaymentData = this.data.amount / 100;

    const details = {
      total: {
        label: 'Payment',
        amount: {
          currency: 'INR',
          value: parseFloat(parsedData.am || amountFromPaymentData).toFixed(2),
        },
      },
    };

    const webPaymentOnError = (app, error) => {
      if (error.code) {
        if (
          [error.ABORT_ERR, error.NOT_SUPPORTED_ERR].indexOf(error.code) >= 0
        ) {
          if (this.data && this.data.method === 'upi') {
            this.emit('upi.intent_response', {});
          }
          // Commenting this because CRED throws incorrect error codes
          // else if (
          //   this.data &&
          //   this.data.method === 'app' &&
          //   app === 'cred'
          // ) {
          //   this.emit('app.intent_response', {
          //     provider: 'CRED',
          //     data: 0,
          //   });
          // }
        }

        // Since the method is not supported, remove it.
        if (error.code === error.NOT_SUPPORTED_ERR) {
          Analytics.track('web_payments_api:not_supported', {
            data: {
              error,
              app,
            },
          });
        }
      }
    };

    try {
      const PaymentRequest = global.PaymentRequest;

      Analytics.track('upi.trigger_mweb_intent_open', {
        type: AnalyticsTypes.BEHAV,
        data: {
          app,
        },
      });

      const request = new PaymentRequest(supportedInstruments, details);
      request
        .show()
        .then((instrument) => {
          Track(this.r, 'web_payments_api_response', {
            instrument,
          });

          if (this.data && this.data.method === 'upi') {
            this.emit('upi.intent_response', {
              response: instrument.details,
            });
          } else if (this.data && this.data.method === 'app') {
            this.emit('app.intent_response', {
              response: instrument.details,
            });
          }

          return instrument.complete();
        })
        .catch((error) => {
          webPaymentOnError(app, error);
        });
    } catch (error) {
      webPaymentOnError(app, error);
    }
  },

  gpay: function (coprotoRequest, fullResponse, type = 'payment_request') {
    if (type === 'payment_request') {
      GPay.payWithPaymentRequestApi(
        fullResponse.data,
        (instrument) => {
          Track(this.r, 'gpay_pay_response', {
            instrument,
          });

          this.emit('upi.intent_response', {
            response: instrument.details,
          });
        },
        (error) => {
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
      GPay.payWithMicroapp
        .call(this, fullResponse.data.intent_url)
        .then((response) => {
          if (this.additional_info) {
            Analytics.track('google_spot_additional_info_passed', {
              data: this.additional_info,
            });
          }
          Analytics.track('gpay_pay_response', {
            data: response.paymentMethodData,
          });
          this.emit('upi.intent_success_response', response.paymentMethodData);
        })
        .catch((error) => {
          Analytics.track('gpay_error', {
            data: error,
          });
          this.emit('cancel', upiBackCancel);
          // Log error for debugging/troubleshooting
          console.error(error);
        });
    }
  },

  intent: function (request, fullResponse) {
    const CheckoutBridge = global.CheckoutBridge;
    let ra = ({ transactionReferenceId } = {}) =>
      fetch
        .jsonp({
          url: request.url,
          callback: (response) => {
            // transactionReferenceId is required for Google Pay microapps payments
            if (transactionReferenceId) {
              response.transaction_reference = transactionReferenceId; // This is snake_case to maintain convention
            }

            this.complete(response);
          },
        })
        .till((response) => response && response.status, 10);

    let intent_url = (fullResponse.data || {}).intent_url;

    if (this.data.method === 'app') {
      this.emit('app.coproto_response', fullResponse);

      if (isWebPaymentsApiAvailable(this.data.provider)) {
        responseTypes['web_payments'].call(
          this,
          fullResponse,
          this.data.provider
        );
      } else if (Bridge.checkout.platform === 'ios') {
        Bridge.checkout.callIos('callNativeIntent', {
          intent_url,
          shortcode: this.data.provider,
        });
      } else {
        CheckoutBridge.callNativeIntent(intent_url);
      }

      this.on('app.intent_response', (response) => {
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
        Analytics.track('metric:polling_started', {
          data: {
            data: response,
            platform: Bridge.checkout.platform,
            location: 'coproto:responseType:intent:app.intent_response',
          },
          immediately: true,
        });
        this.ajax = fetch
          .jsonp({
            url: request.url,
            callback: (response) =>
              this.complete(handleAsyncStatusResponse(response)),
          })
          .till((response) => response && response.status, 10);
      });

      return;
    }

    const startPolling = (data) => {
      if (data) {
        this.emit('upi.pending', { flow: 'upi-intent', response: data });
      }
      Analytics.track('metric:polling_started', {
        data: {
          data: data,
          platform: Bridge.checkout.platform,
          location: 'coproto:responseType:intent:startPolling',
        },
        immediately: true,
      });
      this.ajax = ra(data);
    };
    /**
     * sometimes merchant key will not available( if payment is based invoice id/ subscription id hence pull key from url)
     */
    const affectedMerchantId = 'rzp_live_mPhBL8hs5QOt2B';
    if (
      getMerchantKey() === affectedMerchantId ||
      (request && request.url && request.url.includes(affectedMerchantId))
    ) {
      startPolling();
    } else {
      if (Bridge.checkout.platform === 'ios') {
        startPolling();
      } else {
        this.on('upi.intent_success_response', startPolling);
      }
    }

    this.on('upi.intent_response', (data) => {
      Analytics.track('upi_intent_response', {
        data: data,
        immediately: true,
      });
      if (data |> parseUPIIntentResponse |> didUPIIntentSucceed) {
        this.emit('upi.intent_success_response', data);
      } else {
        this.emit('cancel', upiBackCancel);
      }
    });

    this.emit('upi.coproto_response', fullResponse);

    // if the chosen mode is QR code, then intent flow should be avoided.
    // this.data["_[upiqr]"] will be "1" if it is QR method
    if (
      CheckoutBridge &&
      CheckoutBridge.callNativeIntent &&
      this.data['_[upiqr]'] !== '1'
    ) {
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
        // payment.upi_app does not exist for razorpay.js
        if (!this.upi_app) {
          return responseTypes['gpay'].call(this, request, fullResponse);
        }

        if (this.upi_app === GOOGLE_PAY_PACKAGE_NAME) {
          return responseTypes['gpay'].call(this, request, fullResponse);
        }
        return responseTypes['web_payments'].call(
          this,
          fullResponse,
          this.upi_app
        );
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

  otp: function (request, fullResponse) {
    if (!this.nativeotp && !this.iframe && request.method === 'direct') {
      return responseTypes.first.call(this, request, responseTypes);
    }
    if (this.data.method === 'wallet') {
      this.otpurl = request.url;
      this.emit('otp.required');
    } else if (
      this.data.method === 'emi' &&
      this.data['_[mode]'] === 'hdfc_debit_emi'
    ) {
      this.otpurl = fullResponse.submit_url;
      // TODO: Remove this explicit assignment when backend starts sending it.
      fullResponse.mode = 'hdfc_debit_emi';
      this.emit('otp.required', fullResponse);
    } else {
      Analytics.setMeta('headless', true);
      this.otpurl = fullResponse.submit_url;
      this.resendOtpUrl = fullResponse.resend_url;
      this.gotoBankUrl = fullResponse.redirect;
      this.emit('otp.required', fullResponse);
    }
  },

  // prettier-ignore
  'return': function (request) {
    request.target = this.r.get('target');
    redirectTo(request);
  },

  respawn: function (request, fullResponse) {
    // If Cardless EMI, route the coproto
    if (this.data && this.data.method === 'cardless_emi' && this.data.contact) {
      return responseTypes.cardless_emi.call(this, request, fullResponse);
    }
    // By default, use first coproto.
    return responseTypes.first.call(this, request, fullResponse);
  },
};
