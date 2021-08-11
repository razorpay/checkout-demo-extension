import { getSession } from 'sessionmanager';
import { didUPIIntentSucceed, parseUPIIntentResponse } from 'common/upi';
import { processPaymentCreate } from 'payment/coproto';
import { otp as $otp } from 'checkoutstore/screens/otp';
import { getUPIIntentApps } from 'checkoutstore/native';

import { backPressed } from './back';

export function defineGlobals() {
  window.backPressed = backPressed;
  window.handleOTP = handleOTP;
  window.upiIntentResponse = upiIntentResponse;
  window.externalSDKResponse = externalSDKResponse;
  window.externalAppResponse = externalAppResponse;
}

/**
 * window.handleOTP is defined for OTPElf inside our mobile SDKs
 * this function is called when user is on checkout and the OTP from
 * Razorpay is received
 * @param  {String} otp Just OTP or the entrie SMS body
 */
function handleOTP(otp) {
  /* Old OTPelf will now send the whole body of the
   * message instead of just OTP */
  var matches = otp.match(/\b[0-9]{4}([0-9]{2})?\b/);
  otp = matches ? matches[0] : '';
  otp = String(otp).replace(/\D/g, '');
  var session = getSession();
  var otpEl = _Doc.querySelector('#otp');
  if (session && otpEl && !otpEl.value) {
    $otp.set(otp);

    _Doc.querySelector('#otp-elem') |> _El.removeClass('invalid');
  }
}

/**
 * window.upiIntentResponse is called everytime the intent app retuns a
 * response to our Mobile SDK.
 * @param  {Object} data The data returned by UPI intent activity
 */
function upiIntentResponse(data) {
  var session = getSession();

  if (session.r._payment && getUPIIntentApps().all.length) {
    session.r.emit('payment.upi.intent_response', data);
  } else if (session.activity_recreated) {
    /**
     * If the activity is recreated and UPI Intent flow was used,
     * this method will be invoked when SDK wants to send Intent response.
     *
     * We parse the response, and if the txn did not suceed (user cancelled or
     * other reasons),
     * we tell the user that the payment was not completed.
     */

    var successfulTxn = data |> parseUPIIntentResponse |> didUPIIntentSucceed;

    if (!successfulTxn) {
      session.r.emit('activity_recreated_upi_intent_back_btn');
      session.recievedUPIIntentRespOnBackBtn = true;
    }
  }
}

/**
 * window.externalSDKResponse is called when a plugin wants to communicate with
 * Checkout.
 */
function externalSDKResponse(response = {}) {
  if (response.provider === 'GOOGLE_PAY') {
    handleGooglePaySDKResponse(response);
  }
}

/**
 * Handles Google Pay plugin response from Android SDK.
 * @param data the data sent from plugin
 */
function handleGooglePaySDKResponse(response) {
  const { data } = response;
  const payment = getSession().getPayment();

  if (payment) {
    switch (data.apiResponse.type) {
      case 'gpay_merged':
        payment.emit('app.intent_response', response);
        break;
      case 'gpay_inapp': // fallthrough intentional
      default:
        processPaymentCreate.call(payment, data.apiResponse);
        break;
    }
  }
}

/**
 * window.externalAppResponse is called when a plugin wants to communicate with
 * Checkout.
 */
function externalAppResponse(response = {}) {
  var session = getSession();
  if (response.provider === 'CRED') {
    session.r.emit('payment.app.intent_response', response);
  }
}
