/* global hideOverlayMessage */

import MagicView from 'templates/views/magic.svelte';
import * as Bridge from 'bridge';
import { STRINGS, TIMEOUT_MAGIC_NO_ACTION } from 'common/constants';
import * as Confirm from 'confirm';
import Callout from 'callout';
import store from 'checkoutframe/store';

/* Constants */
const TIMEOUT_CLEAR = -1;
const TIMEOUT_NO_OTP = 30000;
const TIMEOUT_UNKNOWN = 3000;
const TIMEOUT_REDIRECT = 20000;

const TOAST_SHORT = 0;
const TOAST_LONG = 1;

const SCREEN_MAP = {
  'magic-choice': 'select_choice',
  otp: 'submit_otp',
};

export default class Magic {
  constructor(session) {
    this.session = session;
    this.checkoutVisible = true;
    this.resendCount = 0;

    this.view = new MagicView({
      target: _Doc.querySelector('#magic-wrapper'),
    });
  }

  destroy() {
    this.clearTimeout();

    if (this.resendCallout) {
      this.resendCallout.hide();
      delete this.resendCallout;
    }

    this.view.destroy();
  }

  track(eventName, data) {
    data = _.isNonNullObject(data) ? _Obj.clone(data) : {};

    let payload = this.session.getPayload();

    if (payload.token) {
      /* Saved cards */
      data.saved_card = true;
      let tokens = ((this.session.customer || {}).tokens || {}).items;
      if (payload.token && tokens) {
        let currToken =
          tokens |> _Arr.find(tokenObj => tokenObj.token === payload.token);
        if (currToken.card) {
          data.iin = currToken.card.iin;
        }
      }
    } else {
      var cardNum = payload['card[number]'];
      if (_.isString(cardNum)) {
        data.iin = cardNum.replace(/[^0-9]/g, '').substr(0, 6);
      }
    }

    if (this.resolvedPage) {
      data.latest_page = this.resolvedPage;
    }

    if (typeof this.session.attemptCount !== 'undefined') {
      data.attempt_count = this.session.attemptCount;
    }

    if (this.currentBank) {
      data.bank = this.currentBank;
    }

    this.session.track('magic_' + eventName, data);
  }

  setTimeout(timeout, timeoutMeta) {
    if (!this.checkoutVisible) {
      return;
    }

    let timeoutFn = () => {
      if (this.magicTimeout) {
        /* TODO: replace with this.clearTimeout()? */
        global.clearTimeout(this.magicTimeout);
        delete this.magicTimeout;
        this.track('timeout', timeoutMeta);
        this.showPaymentPage();
      }
    };

    if (this.magicTimeout) {
      this.clearTimeout();
    }

    this.magicTimeout = setTimeout(timeoutFn, timeout);
  }

  clearTimeout() {
    global.clearTimeout(this.magicTimeout);
    delete this.magicTimeout;
  }

  showPaymentPage(options = {}) {
    options.focus = options.focus || true;
    options.magic = options.magic || false;
    options.otpelf = options.otpelf || true;

    Confirm.hide();
    this.clearTimeout();
    this.track('show_payment_page', options);
    this.checkoutVisible = false;
    this.session.showLoadError(STRINGS.redirect);

    global.setTimeout(() => {
      Bridge.checkout.callAndroid('invokePopup', JSON.stringify(options));
      this.session.destroyMagic();
    }, 2000);
  }

  pageResolved(data) {
    let timeout = TIMEOUT_MAGIC_NO_ACTION;

    this.resolvedPage = data.type;
    this.currentBank = data.bank;

    switch (data.type) {
      case 'otp':
        this.showOtpView(data);
        timeout = TIMEOUT_CLEAR;
        break;

      case 'proceed':
        this.session.showLoadError('Fetching Bank details');
        break;

      case 'choice':
        this.showChoiceView(data);
        break;

      case 'unknown':
        timeout = TIMEOUT_UNKNOWN;
        break;
    }

    if (timeout === TIMEOUT_CLEAR) {
      this.clearTimeout();
    } else {
      this.setTimeout(timeout, {
        timeout,
        type: 'page',
        screen: data.type,
      });
    }
  }

  pageUnload(data) {
    this.clearTimeout();

    this.setTimeout(TIMEOUT_REDIRECT, {
      timeout: TIMEOUT_REDIRECT,
      type: 'redirect',
    });
  }

  otpParsed(data = {}) {
    /**
     * In case of choice page, the magic will take us to the otp page
     * and then call handleRelay `page_resolved` with `type` as `otp`
     */
    if (data.otp && !store.get().screenData.otp.otp) {
      this.session.otpView.updateScreen({
        otp: data.otp,
      });
    }
  }

  resendOtp(confirmedCancel) {
    let resend = true;

    if (this.resendCount === 1) {
      if (confirmedCancel === true) {
        this.session.otpView.updateScreen({
          allowResend: false,
        });
      } else {
        return Confirm.show({
          message: 'This is your last attempt to generate OTP.',
          heading: 'Resend OTP?',
          positiveBtnTxt: 'Yes, resend',
          negativeBtnTxt: 'No',
          onPositiveClick: () => {
            this.resendOtp(true);
          },
        });
      }

      this.track('otp_resend', {
        resend_count: this.resendCount,
      });
    } else if (this.resendCount > 2) {
      resend = false;
    }

    if (resend) {
      delete this.otpData;
      var callout =
        this.resendCallout ||
        new Callout({
          message: 'OTP has been resent to your number',
        });

      this.resendCallout = callout.show();

      window.setTimeout(function() {
        callout.hide();
      }, 5000);

      Bridge.checkout.callAndroid(
        'relay',
        JSON.stringify({
          action: 'resend_otp',
        })
      );
      this.resendCount++;
    }
  }

  cancelMagic() {
    this.track('user_cancel');
    this.showPaymentPage({
      magic: false,
      otpelf: true,
      focus: true,
    });
  }

  showView(screen) {
    this.session.setScreen(screen);
    hideOverlayMessage();
  }

  showChoiceView(data) {
    this.otpPermission = data.otp_permission;
    this.showView('magic-choice');
  }

  showOtpView(data = {}) {
    /* global askOTP */

    this.showView('otp');
    askOTP(this.session.otpView, {
      metadata: {
        issuer: this.currentBank,
      },
      next: ['otp_resend'],
    });
  }

  submit(screen, data) {
    /* TODO: check if this can be improved */
    let relayData = {
      action: SCREEN_MAP[screen],
      data: data,
    };

    if (screen === 'magic-otp') {
      if (this.session.checkInvalid('#form-magic-otp')) {
        return;
      }
      this.track('submit_otp');
    }

    this.session.showLoadError(STRINGS.process);

    if (screen === 'magic-choice') {
      delete data[''];
      data.choice = this.view.get().selectedChoice;

      this.track('choice', {
        choice: data['choice'],
      });

      if (data['choice'] === 'otp') {
        this.session.showLoadError();
      }
    }

    Bridge.checkout.callAndroid('relay', _Obj.stringify(relayData));
  }
}
