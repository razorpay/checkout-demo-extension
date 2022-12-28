import { getSession } from 'sessionmanager';
import { get } from 'svelte/store';
import { didUPIIntentSucceed, parseUPIIntentResponse } from 'common/upi';
import { processPaymentCreate } from 'payment/coproto';
import { digits, disableCTA, otp as $otp } from 'checkoutstore/screens/otp';
import { getUPIIntentApps } from 'checkoutstore/native';
import { querySelector, querySelectorAll } from 'utils/doc';
import * as _El from 'utils/DOM';
import { backPressed } from './back';
import Analytics from 'analytics';

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
 * @param  {String} message Just OTP or the entrie SMS body
 */
function handleOTP(message) {
  let otp = '';
  /* Old OTPelf will now send the whole body of the
   * message instead of just OTP */
  /* OTPelf have a regex check for supporting 6 or 8 digit of otp only */
  const matches = message.match(/\b[0-9]{6}([0-9]{2})?\b/);
  //todo: to remove else part once verified no 4 digit otp
  if (matches && matches[0]) {
    otp = matches[0];
  } else {
    const fourDigitMatches = message.match(/\b[0-9]{4}\b/);
    otp = fourDigitMatches ? fourDigitMatches[0] : '';
    if (otp) {
      Analytics.track('autofilling_four_digit_otp');
    }
  }
  otp = String(otp).replace(/\D/g, '');
  const session = getSession();
  const otpEl = querySelector('#otp');
  const newOTPEl = querySelectorAll('input[id*=otp\\|]');

  if (session) {
    if (otpEl && !otpEl.value) {
      $otp.set(otp);
    }
    /**
     * razorpay OTP uses boxes layout and of length 6
     */
    if (
      newOTPEl &&
      newOTPEl.length === 6 &&
      typeof get(digits)?.[0] === 'undefined' /** user not attempted */ &&
      otp &&
      otp.length === 6
    ) {
      digits.set(otp.split(''));
      disableCTA.set(false);
    }

    _El.removeClass(querySelector('#otp-elem'), 'invalid');
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

    var successfulTxn = didUPIIntentSucceed(parseUPIIntentResponse(data));

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
