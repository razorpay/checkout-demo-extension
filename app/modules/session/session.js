// eslint-disable-next-line no-redeclare
import * as RazorpayHelper from 'razorpay';
import discreet from 'checkoutframe/discreet';
import * as Confirm from 'checkoutframe/components/confirm';
import { formatAmountWithCurrency } from 'helper/currency';
import {
  getPrefilledContact,
  getPrefilledEmail,
  Customer,
  getCustomer,
  sanitizeTokens,
} from 'checkoutframe/customer';
import { init1CCMetaData } from 'one_click_checkout/helper';
import { applyPrefilledCoupon } from 'one_click_checkout/coupons/helpers';
import {
  openConsentOverlay,
  showAuthOverlay,
  showTruecallerNecessaryCtaForPopup,
} from 'card/helper';
import { showConversionChargesCallout } from 'card/helper';
import {
  matchLatestPaymentWith,
  updateLatestPaymentErrorReason,
} from 'payment/history';
import {
  handleErrorModal,
  isPayloadIsOfQR,
  updateSubLinkContent,
  initLoginForSavedCard,
} from 'session/helper';
import fetch from 'utils/fetch';
import { upiUxV1dot1 } from 'upi/experiments';
import { isLoggedIn } from 'checkoutstore/customer';
import * as ObjectUtils from 'utils/object';
import * as _ from 'utils/_';
import {
  controlledViaSession,
  pushStack,
  backPressed,
  isStackPopulated,
  moveControlToSession,
  popStack,
  isMainStackPopulated,
  clearStack,
} from 'navstack';
import { isQRPaymentCancellable, avoidSessionSubmit } from 'upi/helper';
import { initUpiQrV2 } from 'upi/features';
import { deletePrefsCache } from 'common/Razorpay';
import { processIntentOnMWeb } from 'upi/payment';
import { capture as captureError, SEVERITY_LEVELS } from 'error-service';
import {
  showAmountInCta,
  CTAHelper,
  hideCta,
  showCta,
  setAppropriateCtaText,
} from 'cta';
import { shouldOverrideVisibleState } from 'one_click_checkout/header/store';
import { getDeviceId } from 'fingerprint';
import renderEmiOptions from 'emiV2';
import renderFPXTab from 'fpx';
import { handleEmiPaymentV2 } from 'emiV2/payment';

import { avoidSubmitViaSession, initiateEmiFlow } from 'emiV2/helper/emi';
import {
  emiMethod,
  getSelectedEmiBank,
  selectedBank,
  emiViaCards,
} from 'emiV2/store';
import EmiTabsScreen from 'emiV2/ui/components/EmiTabsScreen/EmiTabsScreen.svelte';
import { cardlessTabProviders, providersToAvoid } from 'emiV2/constants';
import { updateSentryConfig } from 'sentry';
import { validateAndFetchPrefilledWallet } from 'wallet/helper';
import { screenStore, tabStore } from 'checkoutstore';
import { isDebitIssuer } from 'common/bank';
import { emitMagicFunnelEvent } from 'one_click_checkout/merchant-analytics/MagicFunnel';
import { MAGIC_FUNNEL } from 'one_click_checkout/merchant-analytics/constant';
import triggerErrorModal, {
  closeErrorModal,
  updateLoadingCTA,
} from 'components/ErrorModal';
import { getCardlessEMIProviders } from 'checkoutstore/methods';
import { trackEmiFromCardScreen } from 'emiV2/events/tracker';
import {
  getPreferences,
  isIndianCurrency,
  isContactHidden,
  isEmailHidden,
  isEmiV2,
  getOption,
} from 'razorpay';
import {
  cardlessEmiCallBack,
  fetchCardlessEmiPlans,
  getEmiContact,
} from 'emiV2/payment/cardlessEmi/cardlessEmi';
import { getSelectedBankCode } from 'emiV2/helper/plans';
import { selectedTab } from 'components/Tabs/tabStore';
import { isCardlessTab } from 'emiV2/helper/tabs';
import { EventsV2, ContextProperties, AnalyticsV2State } from 'analytics-v2';
import { MiscTracker } from 'misc/analytics/events';
import { totalAppliedGCAmt } from 'one_click_checkout/gift_card/store';
import { LOGIN_SOURCE_TYPES } from 'misc/analytics/constants';
import { CardsTracker } from 'card/analytics/events';
import { UPITracker } from 'upi/analytics/events';
import { attemptCardlessEmiPayment } from 'emiV2/helper/prefillPayment';
import { HomeTracker } from 'home/analytics/events';
import { PaylaterTracker } from 'ui/tabs/paylater/analytics/events';
import { WalletTracker } from 'wallet/analytics/events';
import { showPostPaymentMessage } from 'post-payment';
import {
  internationalTabRender,
  isInternationalAVSView,
  showInternationalAVS,
  internationalTabBackPress,
  INTERNATIONAL_TAB_NAME,
  getInternationalTabData,
  updateInternationalProvider,
} from 'checkoutframe/components/international';
import { remember } from 'checkoutstore/screens/card';
import {
  isOTPSupported,
  showTokenisationBenefitModal,
} from 'card/helper/cards';
import { moengageAnalytics } from 'one_click_checkout/merchant-analytics';
import { moengageEventsData } from 'one_click_checkout/merchant-analytics/store';
import { MOENGAGE_EVENTS } from 'one_click_checkout/merchant-analytics/constant';
import { selectedPlan } from 'checkoutstore/emi';
import { getCurrentScreen } from 'home/analytics/helpers';
import {
  sendDismissEvent,
  isMagicShopifyFlow,
  isMagicWoocFlow,
} from 'checkoutframe/helper';
import { TRUECALLER_VARIANT_NAMES, stopVerificationPolling } from 'truecaller';
import { shouldShowProceedOverlay } from 'truecaller/store';
import { setTruecallerMetaData } from 'truecaller/analytics';
import { Events } from 'analytics';
import { getPerformanceDataForCriticalCheckoutResources } from 'performance/helper';

let emo = {};
let ua = navigator.userAgent;
let preferences,
  $ = discreet.$,
  Razorpay = window.Razorpay,
  WebPaymentsApi = discreet.WebPaymentsApi,
  Constants = discreet.Constants,
  CheckoutBridge = window.CheckoutBridge,
  StorageBridge = window.StorageBridge,
  P13n = discreet.P13n,
  Bridge = discreet.Bridge,
  freqWallets = discreet.Wallet.wallets,
  isMobile = discreet.UserAgent.isMobile,
  Store = discreet.Store,
  MethodStore = discreet.MethodStore,
  UPIUtils = discreet.UPIUtils,
  AnalyticsTypes = discreet.AnalyticsTypes,
  Analytics = discreet.Analytics,
  UTILS = discreet.UTILS,
  docUtil = discreet.docUtil,
  _El = discreet._El,
  Hacks = discreet.Hacks,
  Form = discreet.Form,
  CardlessEmi = discreet.CardlessEmi,
  PayLater = discreet.PayLater,
  PayLaterView = discreet.PayLaterView,
  OtpService = discreet.OtpService,
  storeGetter = discreet.storeGetter,
  HomeScreenStore = discreet.HomeScreenStore,
  CardScreenStore = discreet.CardScreenStore,
  NetbankingScreenStore = discreet.NetbankingScreenStore,
  UpiScreenStore = discreet.UpiScreenStore,
  CustomerStore = discreet.CustomerStore,
  EmiStore = discreet.EmiStore,
  Cta = discreet.Cta,
  es6components = discreet.es6components,
  cardTab = discreet.cardTab,
  NBHandlers = discreet.NBHandlers,
  CommonHandlers = discreet.CommonHandlers,
  Instruments = discreet.Instruments,
  I18n = discreet.I18n,
  NativeStore = discreet.NativeStore,
  Backdrop = discreet.Backdrop,
  FeeLabel = discreet.FeeLabel,
  rewardsStore = discreet.rewardsStore,
  BlockedDeactivatedMerchant = discreet.BlockedDeactivatedMerchant,
  updateScore = discreet.updateScore,
  trackUpiIntentInstrumentPaymentAttempted =
    discreet.trackUpiIntentInstrumentPaymentAttempted,
  Header = discreet.Header,
  address = discreet.address,
  OneClickCheckoutStore = discreet.OneClickCheckoutStore,
  CardViews = discreet.CardViews,
  TopbarMagicCheckoutStore = discreet.TopbarMagicCheckoutStore;

// dont shake in mobile devices. handled by css, this is just for fallback.
const ua_iPhone = /iPhone/.test(ua);

// .shown has display: none from iOS ad-blocker
// using दृश्य, which will never be seen by tim cook
const shownClass = 'drishy';

/**
 * Temp stores for Cardless EMI & PayLater.
 * Will move to Svelte Store upon migration.
 */
const CardlessEmiStore = {
  plans: {},
  duration: {},
  loanUrls: {},
  ott: {},
  lenderBranding: {},
  urls: {},
};

const PayLaterStore = {
  plans: {},
  duration: {},
  loanUrls: {},
  ott: {},
  lenderBranding: {},
};

let METHODS = discreet.CommonConstants.METHODS;

/**
 * Store for what tab and screen
 * should be shown when back is pressed.
 */
let BackStore = null;

function fillData(container, returnObj) {
  UTILS.each($(container).find('input[name],select[name]'), function (i, el) {
    if (/radio|checkbox/.test(el.getAttribute('type')) && !el.checked) {
      return;
    }
    if (!el.disabled) {
      returnObj[el.name] = el.value;
    }
  });
}

function setEmiBank(data) {
  let activeEmiPlan = EmiStore.getEmiDurationForNewCard();
  if (activeEmiPlan) {
    data.method = 'emi';
    data.emi_duration = activeEmiPlan;
  }
}

function makeVisible(subject) {
  $(subject)
    .attr('data-hidden', null)
    .css('display', 'block')
    .reflow()
    .addClass(shownClass);
}

function makeHidden(subject) {
  subject = $(subject);
  subject.attr('data-hidden', true);
  if (subject[0]) {
    subject.removeClass(shownClass);

    if (RazorpayHelper.isOneClickCheckout()) {
      subject.hide();
    } else {
      setTimeout(function () {
        if (subject.attr('data-hidden')) {
          subject.hide();
        }
      }, 200);
    }
  }
}

function showOverlay($with) {
  Backdrop.show();
  if ($with) {
    makeVisible($with[0]);
  }
}

function hideOverlay($with) {
  Backdrop.hide();
  if ($with) {
    makeHidden($with[0]);
  }
}

function hideOverlayMessage() {
  let session = this;
  session.preventErrorDismissal = false;

  if (session.tab === 'nach') {
    if (!session.nachScreen.shouldHideOverlay()) {
      return;
    }
  }
  closeErrorModal(); // this will impact only v1.5
  hideOverlay($('#error-message'));
}

// this === Session
function errorHandler(response) {
  if (_.isString(response)) {
    try {
      response = JSON.parse(response);
    } catch (e) {
      return;
    }
  }
  if (!response || !response.error) {
    return;
  }

  let error = response.error;
  /**
   * response.error could be a json object or json string
   * in case of android mobile sdk - error is a json string inside response
   * for which one more level of parsing is required.
   * For web and other cases, error is an object
   */
  if (_.isString(error)) {
    try {
      error = JSON.parse(error);
    } catch (e) {
      return;
    }
  }

  let untranslatedMessage = error.description;

  let message = I18n.translateErrorDescription(
    untranslatedMessage,
    I18n.getCurrentLocale()
  );

  error.description = message;
  let cancelMsg = I18n.format('misc.payment_canceled');

  if (error.metadata) {
    this.ajaxErrorMetadata = error.metadata;
  }

  Analytics.track('error:metadata', {
    data: {
      errorMetadata: error.metadata,
    },
  });

  // Both checks are there because API still returns message in English.
  if (message === cancelMsg || message === discreet.cancelMsg) {
    if (this.powerwallet) {
      // prevent payment canceled error
      this.powerwallet = null;
      return;
    } else if (this.nativeotp && this.tab === 'card') {
      this.markHeadlessFailed();
      return;
    }
  }
  const tempPayload = this.payload || this.lastPayloadValue;
  this.clearRequest();
  updateScore('failedPayment');
  Analytics.track('error', {
    data: response,
  });
  Analytics.setMeta('payment.failed', true);
  Razorpay.sendMessage({ event: 'paymenterror', data: { error: error } });

  /**
   * If retry is disabled, Checkout will be 'dismiss'ed.
   * Set the dismiss reason.
   *
   * This will work because the user won't be able
   * to dismiss it after this point.
   * If the user were able to dismiss it, we'd
   * have to clear this somehow.
   */
  if (!this.get('retry')) {
    this.dismissReason = {
      error: error,
    };
  }

  if (this.modal) {
    this.modal.options.backdropclose = this.get('modal.backdropclose');
  }

  try {
    if (this.get('retry') === false && !this.get('redirect')) {
      this.hideOverlayMessage();
      if (
        error &&
        error.metadata &&
        error.metadata.payment_id &&
        isEmailHidden() &&
        RazorpayHelper.isRedesignV15()
      ) {
        showPostPaymentMessage({
          response: { error },
          requestPayload: tempPayload,
        }).then(() => {
          try {
            this.modal.hide();
          } catch (e) {
            // e
          }
        });
      } else {
        this.modal.hide();
      }
      return;
    }
  } catch (e) {
    // e
  }

  let err_field = error.field;
  // TODO: Don't rely on this.tab === 'wallet'
  if (err_field && !(this.screen === 'otp' && this.tab === 'wallet')) {
    if (!err_field.indexOf('expiry')) {
      err_field = 'card[expiry]';
    }
    let error_el = document.getElementsByName(err_field)[0];
    if (error_el) {
      if (this.screen && (err_field === 'contact' || err_field === 'email')) {
        this.switchTab();
      }
      error_el = $(error_el);

      setTimeout(function () {
        error_el.focus();
      }, 100);

      if (error_el.bbox().width) {
        let parent = error_el.parent();
        let help;

        if (parent.hasClass('elem')) {
          /* We don't want to add invalid to radio butons */
          help = parent.addClass('mature invalid').find('.help')[0];
        }

        if (help) {
          if (message) {
            help.textContent = message;
          }
          updateScore('clickOnSubmitWithoutDetails');
          Form.shake();
          return this.hideOverlayMessage();
        }
      }
      // for prefill related error we don't show error dialog
      if (error.from === 'prefill') {
        return;
      }
    }
  }

  if (this.tab || (message !== cancelMsg && message !== discreet.cancelMsg)) {
    handleErrorModal.call(this, message);
  }

  if (this.get('retry') === false && this.get('redirect')) {
    if (this.screen === 'otp' && this.otpView) {
      this.otpView.updateScreen({
        action: 'closeAndDismiss',
      });
    }
    return CommonHandlers.updateActionAreaContentAndCTA(
      this,
      'Go Back',
      'Payment failed. Go back to initiate the payment again.',
      true
    );
  }

  NBHandlers.replaceRetryIfCorporateNetbanking(this, message);

  // Conditionally replace retry button with Pay with Paypal depending on error metadata
  CommonHandlers.addRetryPaymentMethodOnErrorModal.call(this, error.metadata);
}

/* bound with session */
function cancelHandler(response) {
  if (!this.payload || response?._silent) {
    return;
  }

  updateScore('cancelledPayment');
  Analytics.setMeta('payment.cancelled', true);
  this.markHeadlessFailed();

  if (this.payload.method === 'upi' && this.payload['_[flow]'] === 'intent') {
    if (this.r._payment && this.r._payment.upi_app) {
      discreet.UPIUtils.trackUPIIntentFailure(this.r._payment.upi_app);
    }

    /**
     * @TODO UPIUX1.1
     * remove experimentation
     * Note: Only code inside if is required once we remove the experiment. Completely delete the else
     */
    if (upiUxV1dot1.enabled()) {
      if (
        !(
          (response && response.upiNoApp) ||
          matchLatestPaymentWith({
            referrer: 'UPI_UX',
            inStatuses: ['cancel'],
            paymentId: this.r._payment?.payment_id,
            errorReason: 'manual',
          })
        )
      ) {
        this.showLoadError(I18n.format('misc.payment_incomplete'), true);
      }
    } else {
      if (!(response && response.upiNoApp)) {
        this.showLoadError(I18n.format('misc.payment_incomplete'), true);
      }
    }
  } else if (
    /^(card|emi)$/.test(this.payload.method) &&
    this.screen &&
    this.screen !== 'card'
  ) {
    if (cardTab.getCardTypeFromPayload(this.payload) === 'bajaj') {
      this.setScreen('emi');
      this.switchTab('emi');
    } else {
      if (this.payload.method === 'emi' && isEmiV2()) {
        // Just changing the tab hard coded way because
        // navstack is already active
        this.tab = 'emi';
      } else {
        this.switchTab('card');
      }
    }
  }
}

function getPhone() {
  return storeGetter(HomeScreenStore.contact);
}

function getProxyPhone() {
  return storeGetter(HomeScreenStore.proxyContact);
}

function getEmail() {
  return storeGetter(HomeScreenStore.email);
}

function elfShowOTP(otp) {
  window.handleOTP(otp);
}

function askOTP(
  view,
  textView,
  shouldLimitResend,
  templateData,
  headingText,
  errorMessage,
  isRazorpayOTP
) {
  if (!this.isOpen) {
    return;
  }
  let origText = textView; // ಠ_ಠ
  let qpmap = _.getQueryParams();
  let thisSession = this;
  let session = thisSession;
  let paymentId = ObjectUtils.get(session, 'r._payment.payment_id');
  let paymentData = OtpService.getPaymentData(paymentId);
  let isRedesignV15Enabled = RazorpayHelper.isRedesignV15();

  if (paymentId && !paymentData) {
    paymentData = {
      timestamp: Date.now(),
    };
    if (_.isNonNullObject(origText) && !origText.error) {
      if (thisSession.headless) {
        paymentData.goToBank = origText.redirect;
      }
      if (origText.metadata) {
        paymentData.metadata = origText.metadata;
      }
    }
    OtpService.setPaymentData(paymentId, paymentData);
  }
  let isWallet = session.payload && session.payload.method === 'wallet';
  let isOTPIncorrect = false;
  // Track if OTP was invalid
  if (textView === 'incorrect_otp_retry') {
    isOTPIncorrect = true;
    textView = isRedesignV15Enabled
      ? 'otp_sent_generic_one_cc'
      : 'incorrect_otp_retry';
    // If it's a Kotak Bank DC EMI and OTP verification fails
    // Load the appropriate error message
    if (paymentData && paymentData.metadata) {
      const metdata = paymentData.metadata;
      if (
        metdata.issuer === 'KKBK' &&
        thisSession.payload['_[mode]'] === 'debit_emi'
      ) {
        textView = 'incorrect_otp_try_new';
      }
    }
    Analytics.track('otp:invalid', {
      data: {
        wallet: isWallet,
        headless: thisSession.headless,
      },
    });
  }

  if (qpmap.platform === 'android') {
    if (window.OTPElf) {
      window.OTPElf.showOTP = elfShowOTP;
    } else {
      window.OTPElf = {
        showOTP: elfShowOTP,
      };
    }
  }
  if (_.isNonNullObject(textView)) {
    textView = textView.error && textView.error.description;
  }

  let otpProperties = {
    loading: false,
    action: false,
    digits: new Array(storeGetter(discreet.OTPScreenStore.maxlength)),
    otp: '',
    allowResend: shouldLimitResend ? OtpService.canSendOtp('razorpay') : true,
    errorMessage:
      errorMessage || isOTPIncorrect
        ? 'otp.title.incorrect_otp_retry_one_cc'
        : '',
    isRazorpayOTP: !!isRazorpayOTP,
    resendTimeout:
      isRedesignV15Enabled && isRazorpayOTP ? Date.now() + 30 * 1000 : 0,
  };

  if (RazorpayHelper.isASubscription()) {
    Object.assign(otpProperties, {
      allowSkip: session.get('subscription_card_change') ? false : true,
    });
  }
  view.updateScreen(otpProperties);

  if (thisSession.headless) {
    if (paymentData.goToBank) {
      view.updateScreen({
        skipTextLabel: 'complete_bank_page',
      });
    }
    view.updateScreen({
      allowSkip: paymentData.goToBank,
    });
  }

  $('#body').addClass('sub');

  let isRedesignV15OtpScreen =
    isRedesignV15Enabled && isRazorpayOTP && thisSession.tab === 'card';

  if (!textView) {
    if (thisSession.tab === 'card' || thisSession.tab === 'emi') {
      if (thisSession.headless) {
        Analytics.track('native_otp:otp:ask');
        if (thisSession.tab === 'card') {
          CardsTracker.NATIVE_OTP_SENT(
            AnalyticsV2State.selectedInstrumentForPayment
          );
        }
        textView = 'otp_sent_no_phone';
        if (_.isNonNullObject(origText)) {
          if (origText.metadata) {
            let metadata = origText.metadata;
            thisSession.headlessMetadata = metadata;

            OtpService.markOtpSent(metadata.issuer || metadata.network);

            let bankLogo;
            let networkLogo = discreet.Card.getFullNetworkLogo(
              metadata.network
            );
            if (metadata.issuer) {
              bankLogo = discreet.getFullBankLogo(metadata.issuer);
            } else if (metadata.network) {
              bankLogo = networkLogo;
            }

            if (bankLogo) {
              const logo = `<img class="native-otp-bank" src="${bankLogo}" onerror="this.style.opacity = 0;">`;
              $('#tab-title').rawHtml(logo);
              thisSession.setOneCCTabLogo(bankLogo, networkLogo);
            }

            view.updateScreen({
              ipAddress: metadata.ip,
              accessTime: paymentData.timestamp,
              resendTimeout:
                paymentData.timestamp +
                (Number(metadata.resend_timeout) + 1) * 1000,
            });

            if (metadata.contact) {
              textView = 'otp_sent_phone';
              if (!templateData) {
                templateData = {};
              }
              templateData.phone = metadata.contact;
            }
          }

          if (origText.mode === 'debit_emi') {
            let next = ObjectUtils.get(origText, 'request.content.next');
            // HDFC Debit EMI next array is same as wallet.
            // It's "resend_otp" not "otp_resend".
            if (!next || next.indexOf('resend_otp') === -1) {
              view.updateScreen({
                allowResend: false,
              });
            }

            // For KKBK DC EMI we are receiving "otp_resend" in next array
            if (origText.next && origText.next.indexOf('otp_resend') !== -1) {
              view.updateScreen({
                allowResend: true,
              });
            }
            // Don't show secondary action like go to bank in HDFC Debit EMI
            view.updateScreen({
              allowSkip: false,
            });
          } else {
            if (!origText.next || origText.next.indexOf('otp_resend') === -1) {
              view.updateScreen({
                allowResend: false,
              });
            }
          }

          if (!thisSession.get('timeout')) {
            thisSession.timer = discreet.showTimer(
              Date.now() + 3 * 60 * 1000,
              function () {
                thisSession.hideTimer();
                thisSession.back(true);
                setTimeout(function () {
                  Analytics.track('native_otp:timeout');
                  thisSession.showLoadError(
                    I18n.format('misc.payment_timeout'),
                    true
                  );
                }, 300);
              }
            );
          }
        }
      } else {
        if (thisSession.payload) {
          textView = isRedesignV15Enabled
            ? 'otp_sent_save_card_one_cc'
            : 'otp_sent_save_card';
        } else {
          textView = isRedesignV15Enabled
            ? 'otp_sent_access_card_one_cc'
            : 'otp_sent_access_card';
        }
      }
    } else {
      textView = isRedesignV15Enabled
        ? 'otp_sent_generic_one_cc'
        : 'otp_sent_generic';
    }
  } else if (isRedesignV15OtpScreen) {
    if (thisSession.payload) {
      textView = 'otp_sent_save_card_one_cc';
    } else {
      textView = 'otp_sent_access_card_one_cc';
    }
  }

  view.updateScreen({
    headingText: headingText || isRedesignV15OtpScreen ? 'default_login' : '',
  });
  view.setTextView(textView, templateData);
}

// this === Session
function successHandler(response) {
  if (this.preferredInstrument) {
    updateScore('savedInstrument');
    P13n.recordSuccess(
      this.preferredInstrument,
      this.getCurrentCustomer(this.payload && this.payload.contact)
    );
  }
  updateScore('paymentSuccess');

  // sending oncomplete event because CheckoutBridge.oncomplete

  function completeCheckoutFlow() {
    Razorpay.sendMessage({ event: 'complete', data: response });
    moengageAnalytics({
      eventName: MOENGAGE_EVENTS.PAYMENT_COMPLETED,
      eventData: {
        ...storeGetter(moengageEventsData),
        'Payment Complete': true,
      },
    });
    this.hide();
  }
  const postSuccessFlow = () => {
    try {
      this.clearRequest();
      if (this.modal && this.modal.options) {
        // prevent dismiss event
        this.modal.options.onhide = UTILS.returnAsIs;
      }

      this.hideOverlayMessage();
      completeCheckoutFlow.call(this);
    } catch (e) {
      //
    }
  };

  if (isEmailHidden() && RazorpayHelper.isRedesignV15()) {
    this.hideOverlayMessage();
    showPostPaymentMessage({
      response,
      requestPayload: this.payload || this.lastPayloadValue,
    }).then(postSuccessFlow);
    // show intermediate screen as promise after 5 second continue the flow
  } else {
    postSuccessFlow();
  }
}

function cancel_upi(session) {
  $('#error-message').addClass('cancel_upi');
  session.r.on('payment.error', function () {
    $('#error-message').removeClass('cancel_upi');
  });
}

function Session(message) {
  let options = message.options;
  let self = this;

  this.r = window.Razorpay(options);
  this.get = this.r.get;
  this.set = this.r.set;
  this.tab = this.screen = '';
  tabStore.set(this.tab);
  tabStore.set(this.screen);

  UTILS.each(message, function (key, val) {
    if (key !== 'options') {
      self[key] = val;
    }
  });

  if (this.embedded) {
    $(docUtil.documentElement).addClass('embedded');
  }

  this.states = Constants.STATES;

  /* The count of payments attempted */
  this.attemptCount = 0;
  this.listeners = [];
  this.bits = [];
}

Session.prototype = {
  shouldUseNativeOTP: function () {
    return this.get('nativeotp') && this.r.isLiveMode();
  },

  setFeeLabel: function () {
    if (
      (RazorpayHelper.isCustomerFeeBearer() ||
        RazorpayHelper.isOneClickCheckout()) &&
      !RazorpayHelper.isRedesignV15()
    ) {
      FeeLabel.show();
    }
  },

  // so that accessing this.data would not produce error
  data: emo,
  params: emo,
  svelteCardTab: undefined,
  otpView: undefined,

  /**
   * Update the amount in header.
   *
   * @param {Number} amount
   */
  updateAmountInHeader: function (amount, fee) {
    if (fee) {
      $('#amount .original-amount').hide();
    } else {
      $('#amount .original-amount').rawHtml(formatAmountWithCurrency(amount));
      CTAHelper.setRawAmount(formatAmountWithCurrency(amount));
      if ($('#amount .original-amount')[0]) {
        $('#amount .original-amount')[0].removeAttribute('style');
      }
    }
    Header.updateAmountFontSize();
  },
  updateAmountInHeaderForOffer: function (amount, fee, withoutFormat = false) {
    if (fee || RazorpayHelper.isOneClickCheckout()) {
      $('#amount .original-amount').hide();
    }
    CTAHelper.setRawAmount(
      withoutFormat ? amount : formatAmountWithCurrency(amount)
    );
    $('#amount .discount').rawHtml(
      withoutFormat ? amount : formatAmountWithCurrency(amount)
    );
    //$('#amount .original-amount').hide();
    Header.updateAmountFontSize();
  },

  /**
   * Set the amount in header.
   *
   * @param {String} html
   */
  setRawAmountInHeader: function (html) {
    $('#amount .original-amount').rawHtml(html);
  },

  /**
   * Returns the Payment instance for the current payment.
   *
   * @return {Payment}
   */
  getPayment: function () {
    return this.r._payment;
  },

  getEl: function () {
    if (!this.el) {
      this.setTheme();
      this.mainModal = new discreet.MainModal({
        target: document.body,
        props: {
          escape: RazorpayHelper.getOption('modal.escape') && !this.embedded,
          onClose: () => {
            this.closeModal();
          },
        },
      });
      this.el = docUtil.querySelector('#container');
      this.body = $('#body');
    }
    return this.el;
  },

  fillData: function () {
    let self = this;
    let oldMethod = this.data.method;
    const prefillContact = getPrefilledContact();
    if (oldMethod) {
      this.wants_skip = true;
    }
    let tab = oldMethod || RazorpayHelper.getPrefillMethod();

    if (tab) {
      EventsV2.setContext(ContextProperties.SECTION, 'prefill');
      HomeTracker.PREFILL_SECTION_SELECTED({
        method: {
          name: tab,
        },
      });
      updateScore('hadMethodPrefilled');
      let optional = {
        contact: RazorpayHelper.isContactOptional(),
        email: RazorpayHelper.isEmailOptional(),
      };
      let prefill = {
        email: getPrefilledEmail(),
        contact: prefillContact,
      };

      let valid = true;
      let fields = ['contact', 'email'];

      UTILS.each(fields, function (optionKey, option) {
        if (valid && !prefill[option] && !optional[option]) {
          valid = false;
          errorHandler.call(self, {
            error: {
              field: option,
              from: 'prefill',
            },
          });
        }
      });

      if (!valid) {
        tab = '';
      }
    }

    /**
     * A method needs to be usable in order to prefill to that method
     */
    if (tab) {
      let usableMethod = tab;

      // We're currently bypassing prefill check for emandate and nach.
      // TODO: We'll need to fix this
      let methodsToBypassCheckFor = ['emandate', 'nach'];
      let bypassMethodCheck = methodsToBypassCheckFor.includes(usableMethod);

      // Go to homescreen if prefilled method is unusable
      if (!bypassMethodCheck && !MethodStore.isMethodUsable(usableMethod)) {
        tab = '';
      }
    }

    // Switch to the respective tab/ prefilled method if exists
    // If tab is empty, then it will switche to home
    if (tab === 'emandate' && !discreet.NetbankingHelper.getPrefillBank()) {
      // For method=emandate, we switch to the netbanking tab first if bank
      // is not prefilled.
      tab = 'netbanking';
    }

    // if prefilled method is disabled we are setting the tab to home tab
    if (!MethodStore.isMethodEnabled(tab)) {
      tab = '';
    }

    if (tab || tab === '') {
      this.switchTab(tab);
    }

    let prefilledWallet = validateAndFetchPrefilledWallet();
    if (prefilledWallet) {
      let selectedWalletEl = $('#wallet-radio-' + prefilledWallet);

      if (selectedWalletEl && selectedWalletEl[0]) {
        selectedWalletEl.prop('checked', true);
        if (tab === 'wallet') {
          Cta.showCta();
        }

        // TODO: hacky stuff , need to refactor
        // setTimeout with 200ms - waiting for checkout animation to complete
        let el = selectedWalletEl[0];
        window.setTimeout(function () {
          // scrolling to the selected wallet when checkout is opened
          // https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoViewIfNeeded
          let scroll = el.scrollIntoViewIfNeeded || el.scrollIntoView;
          if (scroll) {
            scroll.call(el);
          }
        }, 200);
      }
    }

    if (this.hasOwnProperty('data')) {
      let data = this.data;

      let exp_m = data['card[expiry_month]'];
      let exp_y = data['card[expiry_year]'];
      if (exp_m && exp_y) {
        data['card[expiry]'] = exp_m + ' / ' + exp_y;
      }

      if (data['bank']) {
        NetbankingScreenStore.selectedBank.set(data['bank']);
      }

      if (data.email) {
        HomeScreenStore.setEmail(data.email);
      }

      if (data.contact) {
        HomeScreenStore.setContact(data.contact);
        discreet.CRED.checkCREDEligibilityForUpdatedContact(data.contact);
      }
    } else if (prefillContact) {
      discreet.CRED.checkCREDEligibilityForUpdatedContact(prefillContact);
    }
  },

  completePendingPayment: function () {
    let self = this;
    let params = {};
    params[Constants.UPI_POLL_URL] = '';
    params[Constants.PENDING_PAYMENT_TS] = '0';
    try {
      let pollUrl, pendingPaymentTimestamp;
      pendingPaymentTimestamp = StorageBridge.getString(
        Constants.PENDING_PAYMENT_TS
      );
      pendingPaymentTimestamp = parseInt(pendingPaymentTimestamp, 10) || 0;

      // "activity_recreated" was passed as true.
      let isActivityRecreated = self.activity_recreated;

      if (pendingPaymentTimestamp) {
        /**
         * If the payment is pending, and is NOT older than
         * MINUTES_TO_WAIT_FOR_PENDING_PAYMENT number of minutes,
         * AND, isActivityRecreated is true, get pollUrl.
         *
         * Otherwise, clear it.
         */
        if (
          isActivityRecreated &&
          Date.now() - pendingPaymentTimestamp <=
            Constants.MINUTES_TO_WAIT_FOR_PENDING_PAYMENT * 60000
        ) {
          pollUrl = StorageBridge.getString(Constants.UPI_POLL_URL);
        } else {
          this.setParamsInStorage(params);
        }
      }

      if (pollUrl) {
        this.switchTab(self.tab);
        this.showLoadError();
        this.isResumedPayment = true;

        /*
         * TODO: fix this flow. We should not need to rewrite this entire thing
         * We should be reusing Payment object.
         */
        this.ajax = fetch({
          url: pollUrl,
          callback: function (response) {
            if (response.razorpay_payment_id) {
              self.successHandler(response);
            } else {
              let errorObj = response.error;
              if (!errorObj?.description) {
                //if error description not present generating an error response with Payment failed description
                response = discreet.error('Payment failed');
              }

              self.errorHandler(response);
            }
            // reset storage post polling success/failure
            self.setParamsInStorage(params);
          },
        }).till(function (response) {
          return response && response.status;
        });

        let abortPaymentOnUPIIntentFailure = function () {
          self.ajax.abort();

          if (self.r._payment && self.r._payment.upi_app) {
            discreet.UPIUtils.trackUPIIntentFailure(self.r._payment.upi_app);
          }

          self.showLoadError(I18n.format('misc.payment_incomplete'), true);
          self.clearRequest(discreet.UPIUtils.upiBackCancel);
        };

        // Show error and clear request when back is pressed from PSP UPI App
        if (this.recievedUPIIntentRespOnBackBtn) {
          abortPaymentOnUPIIntentFailure();
        } else {
          this.r.once('activity_recreated_upi_intent_back_btn', function () {
            abortPaymentOnUPIIntentFailure();
          });
        }
      }
    } catch (e) {}
  },

  setParamsInStorage: function (params) {
    UTILS.each(params, function (key, val) {
      try {
        StorageBridge.setString(key, val);
      } catch (e) {}
    });
  },

  render: function () {
    if (RazorpayHelper.isRedesignV15()) {
      discreet.fonts.loadInterFont();
    }
    if (NativeStore.getUPIIntentApps().filtered.length) {
      /**
       * We need to show "(Recommended)" string alongside the app name
       * when there is only 1 preferred app, and 1 or more other apps.
       */
      const count = discreet.UPIUtils.getNumberOfAppsByCategory(
        NativeStore.getUPIIntentApps().filtered
      );

      if (
        count.preferred === 1 &&
        NativeStore.getUPIIntentApps().filtered.length > 1
      ) {
        this.showRecommendedUPIApp = true;
      }
    }

    /** setting meta before render */
    Analytics.setMeta('isRedesignV15', RazorpayHelper.isRedesignV15());

    // is FOH enabled
    const isFOHEnabled = RazorpayHelper.hasMerchantPolicy();
    Analytics.setMeta('FOH_enabled', isFOHEnabled);

    // Analytics related to orientation
    Analytics.setMeta('orientation', Hacks.getDeviceOrientation());
    window.addEventListener('orientationchange', function () {
      Analytics.setMeta('orientation', Hacks.getDeviceOrientation());
    });

    if (discreet.UserAgent.Safari) {
      Analytics.setMeta('safari', true);
    }

    Analytics.setMeta('device.id', getDeviceId());

    if (window && window.screen) {
      Analytics.setMeta('device.screen', {
        availHeight: window.screen.availHeight,
        availWidth: window.screen.availWidth,
        height: window.screen.height,
        width: window.screen.width,
        pixelDepth: window.screen.pixelDepth,
      });
    }
    /** end of setting meta */

    this.isOpen = true;
    this.getEl();
    this.setFormatting();
    es6components.render();
    this.setModal();
    try {
      MiscTracker.OPEN({
        user: {
          contact: {
            hidden: isContactHidden(),
            value: getPrefilledContact(),
          },
          email: {
            hidden: isEmailHidden(),
            value: getPrefilledEmail(),
          },
        },
      });
    } catch {}

    this.setBackdrop();
    if (RazorpayHelper.isBlockedDeactivated() && this.r.isLiveMode()) {
      new BlockedDeactivatedMerchant({
        target: docUtil.querySelector('#form-fields'),
      });
      docUtil.getElementById('header').remove();
      return;
    }
    this.setSvelteComponents();
    if (!RazorpayHelper.isPayout()) {
      this.fillData();
    }
    if (RazorpayHelper.isOneClickCheckout()) {
      applyPrefilledCoupon();
      this.switchTab('home-1cc');
    }
    this.setEMI();
    Cta.init();
    this.completePendingPayment();
    this.bindEvents();
    if (!RazorpayHelper.isEmiV2()) {
      this.setEmiScreen();
    }
    this.prefillPostRender();
    this.updateCustomerInStore();
    Header.updateAmountFontSize();
    Hacks.initPostRenderHacks();
    init1CCMetaData();

    this.errorHandler(this.params);

    if (!this.tab && !getPrefilledContact()) {
      $('#contact').focus();
    }

    // Look for new UPI apps.
    discreet.UPIUtils.findAndReportNewApps(NativeStore.getUPIIntentApps().all);

    discreet.UPIUtils.trackAppImpressions(
      NativeStore.getUPIIntentApps().filtered
    );

    P13n.trackNumberOfP13nContacts();

    let first_screen;

    if (RazorpayHelper.isPayout()) {
      first_screen = 'payout_instruments_screen';
    } else if (RazorpayHelper.isOneClickCheckout()) {
      first_screen = discreet.OneClickCheckoutInterface.getLandingView();
    } else {
      first_screen = this.homeTab.getCurrentView();
    }

    // remember store default value as false if experiment is true
    if (RazorpayHelper.isRemoveDefaultTokenizationSupported()) {
      remember.set(false);
    }
    setTruecallerMetaData();
    Analytics.track('complete', {
      type: AnalyticsTypes.RENDER,
      data: Object.assign(
        {
          embedded: this.embedded,
          meta: { first_screen },
        },
        discreet.RTBHelper.getRTBAnalyticsPayload()
      ),
    });

    try {
      Events.TrackMetric('critical_resource_performance', {
        resources: getPerformanceDataForCriticalCheckoutResources(),
      });
    } catch (error) {
      // no-op
    }

    if (!isEmailHidden()) {
      Events.TrackApi('email_show', {
        merchant_opted: getPreferences('features.show_email_on_checkout'),
        international_payment: !isIndianCurrency(),
        prefill: Boolean(getOption('prefill.email')),
      });
    }
    updateScore('timeToRender');
    Analytics.setMeta('timeSince.render', discreet.timer());
    EventsV2.setContext(
      ContextProperties.INIT_TO_RENDER,
      Date.now() - AnalyticsV2State.checkoutInvokedTime
    );
  },
  setHomeTab: function () {
    this.homeTab = new discreet.HomeTab({
      target: docUtil.getElementById('form-fields'),
    });
  },

  setOneClickCheckoutHome: function () {
    this.oneClickCheckoutHome = new discreet.OneClickCheckoutHomeTab({
      target: docUtil.getElementById('form-fields'),
    });
  },

  setSvelteCardTab: function () {
    this.svelteCardTab = new cardTab.render();
  },

  setSvelteComponents: function () {
    this.setUpiCancelReasonPicker();
    this.setNbCancelReasonPicker();
    let isCouponsOrAddressEnabled =
      OneClickCheckoutStore.shouldShowCoupons() ||
      OneClickCheckoutStore.shouldShowAddress();
    if (RazorpayHelper.isOneClickCheckout() && isCouponsOrAddressEnabled) {
      updateSentryConfig(); // change sentry project to 1cc
      this.setOneClickCheckoutHome();
    }
    if (!RazorpayHelper.isPayout()) {
      this.setHomeTab();
    }
    this.setSvelteCardTab();
    this.setEmandate();
    this.setCardlessEmi();
    this.setPayLater();
    this.setOtpScreen();
    this.setNach();
    // Set offers only when order exists. Order might be populated lazily in case of 1CC
    if (RazorpayHelper.isOneClickCheckout()) {
      if (this.preferences.order) {
        this.setOffers();
      }
    } else {
      this.setOffers();
    }
    this.setFeeLabel();
    // make bottom the last element
    docUtil
      .getElementById('form-fields')
      .appendChild(docUtil.getElementById('bottom'));
  },

  // this does not apply if options.timeout was passed
  // because in that case timer needn't be hidden while checkout is open
  // applied only for localized timers e.g headless OTP timer
  hideTimer: function () {
    if (!this.get('timeout') && this.timer) {
      this.timer.$destroy();
      this.timer = null;
    }
  },

  setEMI: function () {
    if (!this.emiPlansView) {
      this.emiPlansView = new discreet.emiPlansView();
    }
  },

  setEmandate: function () {
    if (MethodStore.isEMandateEnabled()) {
      this.emandateView = new discreet.EmandateTab({
        target: docUtil.querySelector('#form-fields'),
      });
    }
  },

  selectCardlessEmiProvider: function (providerCode) {
    if (!MethodStore.isMethodEnabled('cardless_emi')) {
      return;
    }

    Analytics.track('cardless_emi:provider:select', {
      type: AnalyticsTypes.BEHAV,
      data: {
        provider: providerCode,
      },
    });

    // User selected EMI on Cards
    if (providerCode === 'cards') {
      /**
       * setting payload to null because in some case if we select some cardless_emi
       * and then select emi on cards then payload methods remains as cardless_emi with provider
       */
      this.payload = null;
      this.switchTab('emi');
      return;
    }

    if (providerCode === 'bajaj') {
      this.showEmiPlansForBajaj();
      return;
    }

    $('#form-cardless_emi input[name=emi_duration]').val('');
    $('#form-cardless_emi input[name=provider]').val('');
    $('#form-cardless_emi input[name=ott]').val('');

    CardlessEmiStore.providerCode = providerCode;
    /**
     * Fix any cardless EMI(where EMI plan selected on checkout) provider selected from Home screen
     * this.tab is coming as empty string...but its needed cardless_emi to fetch data for payment (getPayload)
     */
    if (!this.tab) {
      this.tab = 'cardless_emi';
      tabStore.set(this.tab);
    }

    $('#form-cardless_emi input[name=provider]').val(providerCode);
  },

  /**
   * Equivalent of clicking a provider option from the
   * Cardless EMI homescreen.
   * @param {String} provider Code for the provider
   */
  selectCardlessEmiProviderAndAttemptPayment: function (provider) {
    this.selectCardlessEmiProvider(provider);
    /**
     * When a cardless EMI provider except "EMI on Cards" is chosen, the payment
     * should be created immediately. Selecting "EMI on cards" should take us
     * to the EMI screen, hence preSubmit should not be called.
     */
    if (provider !== 'cards') {
      if (!isEmiV2()) {
        this.preSubmit();
        return;
      }
      // Use the navstack function to redirect the user to respect screen or payment gateway
      attemptCardlessEmiPayment(provider);
    }
  },

  setCardlessEmi: function () {
    let self = this;

    if (MethodStore.isMethodEnabled('cardless_emi')) {
      this.cardlessEmiView = new discreet.CardlessEmiView({
        target: docUtil.querySelector('#form-fields'),
      });

      this.cardlessEmiView.$on('select', function (event) {
        let providerCode = event.detail.code;
        self.selectCardlessEmiProviderAndAttemptPayment(providerCode);
      });
    }
  },

  selectPayLaterProvider: function (providerCode) {
    Analytics.track('paylater:provider:select', {
      type: AnalyticsTypes.BEHAV,
      data: {
        provider: providerCode,
      },
    });

    PaylaterTracker.APP_SELECTED({
      instrument: { name: providerCode },
    });

    try {
      MiscTracker.INSTRUMENT_SELECTED({
        block: AnalyticsV2State.selectedBlock,
        method: {
          name: storeGetter(HomeScreenStore.selectedInstrument)?.method,
        },
        instrument: {
          name: providerCode,
          saved: false,
          personalisation: !!storeGetter(HomeScreenStore.selectedInstrument)
            ?.meta?.preferred,
        },
      });
    } catch {}

    $('#form-paylater input[name=ott]').val('');
    $('#form-paylater input[name=provider]').val(providerCode);

    PayLaterStore.providerCode = providerCode;
    PayLaterStore.userRegistered = false;
    PayLaterStore.otpVerified = false;
  },

  /**
   * Equivalent of clicking a provider option from the
   * PayLater homescreen.
   * @param {String} providerCode Code for the provider
   */
  selectPayLaterProviderAndAttemptPayment: function (providerCode) {
    this.selectPayLaterProvider(providerCode);
    this.preSubmit();
  },

  /**
   * Adds the Nach screen to DOM
   */
  setNach: function () {
    if (MethodStore.isMethodEnabled('nach')) {
      this.nachScreen = new discreet.NachScreen({
        target: docUtil.querySelector('#form-fields'),
      });
    }
  },

  setPayLater: function () {
    let self = this;
    let isPayLaterEnabled = MethodStore.isMethodEnabled('paylater');

    if (!isPayLaterEnabled) {
      return;
    }

    this.payLaterView = new PayLaterView({
      target: docUtil.querySelector('#form-fields'),
    });

    this.payLaterView.$on('select', function (event) {
      let providerCode = event.detail.code;
      self.selectPayLaterProviderAndAttemptPayment(providerCode);
    });

    this.tabs[METHODS.PAYLATER] = this.payLaterView;
  },

  setOneCCTabLogo: function (logo, fallbackLogo = '') {
    if (RazorpayHelper.isRedesignV15()) {
      this.otpView.updateScreen({
        tabLogo: logo,
        fallbackTabLogo: fallbackLogo,
      });
    }
  },

  setEmiScreen: function () {
    if (
      !MethodStore.getEMIBanks().BAJAJ ||
      !MethodStore.isMethodEnabled('emi')
    ) {
      return;
    }

    this.emiScreenView = new discreet.emiScreenView({
      target: docUtil.querySelector('#form-emi'),
    });

    this.emiScreenView.$on('editplan', this.showEmiPlansForBajaj.bind(this));
  },

  getCardlessEmiPlans: function () {
    let providerCode = CardlessEmiStore.providerCode;
    let plans = CardlessEmiStore.plans[providerCode];

    return plans;
  },

  showCardlessEmiPlans: function () {
    let self = this;
    let providerCode = CardlessEmiStore.providerCode;
    let plans = CardlessEmiStore.plans[providerCode];

    this.topBar?.setTitleOverride(
      'emiplans',
      'image',
      CardlessEmi.getImageUrl(providerCode)
    );
    if (!plans) {
      this.fetchCardlessEmiPlans();
      return;
    }

    Analytics.track('cardless_emi:plans:view', {
      data: {
        provider: providerCode,
      },
    });

    let plansList = this.getCardlessEmiPlans();

    this.emiPlansView.setPlans({
      plans: plansList,

      actions: {
        showAgreement: false,
      },

      amount: this.get('amount'),

      loanUrl: CardlessEmiStore.loanUrls[providerCode],

      provider: CardlessEmiStore.providerCode,

      // TODO: This should be picked up from Store
      branding: CardlessEmiStore.lenderBranding[providerCode],

      on: {
        back: function (confirmedCancel) {
          let payment = self.r._payment;

          if (confirmedCancel !== true && payment) {
            Confirm.confirmClose().then(function (confirmed) {
              if (confirmed) {
                self.clearRequest({
                  '_[reason]': 'PAYMENT_CANCEL_BEFORE_PLAN_SELECT',
                });

                self.switchTab('cardless_emi');
              }
            });
          }

          return true;
        },

        select: function (value) {
          $('#form-cardless_emi input[name=emi_duration]').val(value);
          $('#form-cardless_emi input[name=provider]').val(
            CardlessEmiStore.providerCode
          );
          $('#form-cardless_emi input[name=ott]').val(
            CardlessEmiStore.ott[CardlessEmiStore.providerCode]
          );

          Analytics.track('cardless_emi:plan:select', {
            type: AnalyticsTypes.BEHAV,
            data: {
              provider: providerCode,
              value: value,
            },
          });

          self.preSubmit();
        },
      },
    });

    this.setScreen('emiplans');
  },

  fetchCardlessEmiPlans: function (params) {
    if (!params) {
      params = {};
    }

    let providerCode = CardlessEmiStore.providerCode;
    const self = this;

    let incorrectOtp = params.incorrect;

    let topbarImages = CardlessEmi.getImageUrl(providerCode);
    this.topBar?.setTitleOverride('otp', 'image', topbarImages);
    this.setOneCCTabLogo(topbarImages);

    let locale = I18n.getCurrentLocale();
    this.otpView.updateScreen({
      showCtaOneCC: false,
    });
    this.commenceOTP('cardlessemi_sending', 'cardless_emi_enter', {
      phone: getPhone(),
      provider: I18n.getCardlessEmiProviderName(providerCode, locale),
    });

    if (this.screen !== 'otp' && this.tab !== 'cardless_emi') {
      return;
    }

    let callback = function () {
      let otpMessageView = 'cardlessemi_plans';

      if (incorrectOtp) {
        otpMessageView = 'incorrect_otp_retry';
      }

      let locale = I18n.getCurrentLocale();
      self.askOTP(self.otpView, otpMessageView, true, {
        phone: getPhone(),
        provider: I18n.getCardlessEmiProviderName(providerCode, locale),
      });
      self.otpView.updateScreen({
        allowSkip: false,
        showCtaOneCC: true,
        ctaOneCCDisabled: false,
      });
    };

    let resend = params.resend;
    let resendUrl =
      CardlessEmiStore.urls[providerCode] &&
      CardlessEmiStore.urls[providerCode].resend_otp;

    if (resend && resendUrl) {
      Analytics.track('otp:resend', {
        type: AnalyticsTypes.BEHAV,
        data: {
          cardless_emi: providerCode,
        },
      });

      fetch.post({
        url: resendUrl,
        data: {
          contact: getPhone(),
        },
        callback: callback,
      });

      OtpService.markOtpSent('razorpay');
    } else {
      callback();
    }
  },

  checkCustomerStatus: function (params, callback) {
    let self = this;
    let provider = params.provider;
    let data = params.data;
    let phone = params.contact;

    this.getCurrentCustomer(phone).checkStatus(
      function (response) {
        self.updateCustomerInStore();
        if (response.hasOwnProperty('saved')) {
          if (response.saved) {
            callback();
          } else {
            let error =
              'Could not find a ' +
              provider +
              ' account associated with ' +
              phone;

            callback(error);
          }
          return;
        }

        if (response.error && response.error.description) {
          callback(response.error.description);
          return;
        }

        callback('Something went wrong.');
      },
      data,
      phone
    );
  },

  askPayLaterOtp: function (action) {
    let providerCode = PayLaterStore.providerCode;
    let payLaterProviderObj = PayLater.getProvider(providerCode);
    let self = this;

    let topbarImages = PayLater.getImageUrl(providerCode);
    this.topBar?.setTitleOverride('otp', 'image', topbarImages);
    this.setOneCCTabLogo(topbarImages);

    let params = {
      provider: payLaterProviderObj.name,
      data: {
        provider: providerCode,
        amount: self.get('amount'),
        method: 'paylater',
      },
      contact: getPhone(),
    };

    let smsHash = this.sms_hash;
    if (this.get('send_sms_hash') && smsHash) {
      params.data.sms_hash = smsHash;
    }

    if (action === 'incorrect') {
      self.otpView.setTextView('incorrect_otp_retry');
      return;
    } else if (action === 'resend') {
      this.commenceOTP('resending_otp', 'paylater_resend');
    } else if (action === 'verify') {
      this.commenceOTP('verifying_otp');
      return;
    } else {
      let locale = I18n.getCurrentLocale();
      this.commenceOTP('paylater_sending', 'paylater_enter', {
        phone: getPhone(),
        provider: I18n.getPaylaterProviderName(providerCode, locale),
      });
    }

    this.checkCustomerStatus(params, function (error) {
      let locale = I18n.getCurrentLocale();
      if (error) {
        PayLaterStore.userRegistered = false;
        self.showLoadError(I18n.translateErrorDescription(error, locale), true);
        return;
      }

      PayLaterStore.userRegistered = true;

      let otpMessageView = 'paylater_continue';

      if (action === 'resend') {
        otpMessageView = 'otp_resent_successful';
      }

      self.askOTP(self.otpView, otpMessageView, true, {
        phone: getPhone(),
        provider: I18n.getPaylaterProviderName(providerCode, locale),
      });
      self.otpView.updateScreen({
        allowSkip: false,
      });
    });
  },

  submitPayLater: function () {
    // Step 1: Check if user is registered on the given provider.
    if (!PayLaterStore.userRegistered) {
      this.askPayLaterOtp();
      return;
    }

    // Step 2: Ask for OTP
    if (!PayLaterStore.otpVerified) {
      this.askPayLaterOtp('verify');
      return;
    }

    // Step 3: Set ProviderCode & OTT in the form
    $('#form-paylater input[name=provider]').val(PayLaterStore.providerCode);
    $('#form-paylater input[name=ott]').val(
      PayLaterStore.ott[PayLaterStore.providerCode]
    );

    // Step 4: Submit
    this.preSubmit();
  },

  /**
   * this method is being used on OTP screen
   */
  retryWithPaypal: function () {
    if (this.screen !== 'wallet') {
      // switch to wallet tab and select paypal
      if (
        this.svelteCardTab &&
        typeof this.svelteCardTab.setTabVisible === 'function'
      ) {
        this.svelteCardTab.setTabVisible(false);
      }
      this.switchTab('wallet');
      if (this.walletTab) {
        this.walletTab.onWalletSelection(freqWallets.paypal.code);
      }
    } else {
      this.back();
    }

    Analytics.track('paypal_retry:paypal_click', {
      data: {
        currentScreen: this.screen,
      },
      immediately: true,
    });
  },

  setOtpScreen: function () {
    if (!this.otpView) {
      this.otpView = new discreet.otpView({
        target: docUtil.getElementById('form-fields'),

        props: {
          addShowableClass: true,
          on: {
            closeAndDismiss: this.closeAndDismiss.bind(this),
            chooseMethod: function () {
              this.switchTab();
            }.bind(this),
            addFunds: this.addFunds.bind(this),
            resend: this.resendOTP.bind(this),
            retry: this.back.bind(this),
            secondary: this.secAction.bind(this),
            retryWithPaypal: this.retryWithPaypal.bind(this),
            cancelRetryWithPaypal: function () {
              this.back();
              Analytics.track('paypal_retry:cancel_click', {
                data: {
                  currentScreen: this.screen,
                },
              });
            }.bind(this),
          },
        },
      });
    }
  },

  setModal: function () {
    if (!this.modal) {
      let self = this;
      this.modal = new window.Modal(this.el, {
        animation: this.mainModal.animation(),
        onhide: function () {
          sendDismissEvent(self.dismissReason);
        },
        onhidden: function () {
          this.saveAndClose();
          Razorpay.sendMessage({ event: 'hidden' });
        }.bind(this),
      });
    }
  },

  setBackdrop: function () {
    let session = this;
    Backdrop.setup({
      target: docUtil.querySelector('#modal-inner'),
      props: {
        onClick: function (e) {
          if (Confirm.isVisible()) {
            return;
          }
          session.r.emit('backDropClicked');
          session.hideErrorMessage(e);
        },
      },
    });
  },
  /**
   * Anything related to prefilled that needs to be done
   * once everything has rendered,
   * goes into this function.
   */
  prefillPostRender: function () {
    const prefilledMethod = RazorpayHelper.getPrefillMethod();
    const prefilledProvider = RazorpayHelper.getOption('prefill.provider');

    if (
      prefilledMethod === 'cardless_emi' &&
      prefilledProvider &&
      this.checkCommonValidAndTrackIfInvalid()
    ) {
      this.selectCardlessEmiProviderAndAttemptPayment(prefilledProvider);
    }
  },

  setTheme: function () {
    if (
      RazorpayHelper.isOneClickCheckout() &&
      !RazorpayHelper.shouldOverrideBrandColor()
    ) {
      discreet.Theme.setThemeColor(discreet.Constants.COLORS.MAGIC_BRAND_COLOR);
    } else {
      // update r.themeMeta based on prefs color
      this.r.postInit();

      // ThemeMeta in razorpay.js contains only
      // color, textColor, highlightColor
      discreet.Theme.setThemeColor(this.r.themeMeta.color);
    }
  },

  hideErrorMessage: function (confirmedCancel) {
    if (
      RazorpayHelper.isCustomerFeeBearer() &&
      !RazorpayHelper.isDynamicFeeBearer()
    ) {
      this.setAmount(this.get('amount'));
    }

    let self = this;
    if (this.r._payment && !RazorpayHelper.isRedesignV15()) {
      if (
        this.payload &&
        this.payload.method === 'upi' &&
        this.payload['_[flow]'] === 'directpay'
      ) {
        return cancel_upi(this);
      }
    }

    const beforeReturn = function () {
      // Prevents the overlay from closing and not allowing the user to
      // attempt payment again incase of corporate netbanking and preventErrorDismissal is true.
      if (self.isCorporateBanking || self.preventErrorDismissal) {
        return;
      }

      $('#overlay-close').hide();
      self.hideOverlayMessage();
    };

    if (this.r._payment || this.isResumedPayment) {
      if (confirmedCancel === true) {
        return this.clearRequest();
      }
      if (
        this.payload &&
        this.payload.method === 'netbanking' &&
        ObjectUtils.get(this.r, '_payment.popup.window.closed')
      ) {
        // Called when the popup for netbanking has been closed by the user
        // and the netbanking cancellation modal is open
        // returning from this point prevents confirmClose from being called because it's not needed
        return;
      }
      // don't show confirm on click of backdrop for QR payment(L0/L1)
      if (this.r._payment?.data?.['_[upiqr]'] === '1') {
        return;
      }
      Confirm.confirmClose().then((close) => {
        if (close) {
          if (self.payload && self.payload.method === 'netbanking') {
            try {
              if (!self.r._payment?.popup) {
                // in webview probably
                self.clearRequest();
              } else {
                self.r._payment.popup.onClose();
              }
            } catch (e) {
              captureError(e.message, { severity: SEVERITY_LEVELS.S2 });
            }
          } else {
            if (this.upiPaymentManualCancelAttempted) {
              updateLatestPaymentErrorReason('manual');
              delete this.upiPaymentManualCancelAttempted;
            }
            self.clearRequest();
            if (Bridge.checkout.platform === 'ios') {
              Bridge.checkout.callIos('hide_nav_bar');
            }
            beforeReturn();
          }
        } else {
          if (this.upiPaymentManualCancelAttempted) {
            delete this.upiPaymentManualCancelAttempted;
          }
          // move focus to popup or iframe
          self.r.focus();
        }
      });
    } else {
      beforeReturn();
    }
  },

  click: function (selector, delegateClass, listener, useCapture) {
    this.on('click', selector, delegateClass, listener, useCapture);
  },

  on: function (event, selector, delegateClass, listener, useCapture) {
    let listeners = this.listeners;
    if (!listener || listener === true) {
      UTILS.each(
        docUtil.querySelectorAll(selector),
        function (i, element) {
          listeners.push($(element).on(event, delegateClass, listener, this));
        },
        this
      );
    } else {
      let self = this;
      let $parent = $(selector);
      return listeners.push(
        $parent.on(
          event,
          function (e) {
            let target = e.target;
            while (target !== $parent[0]) {
              if (!$(target)[0]) {
                break;
              }

              if ($(target).hasClass(delegateClass)) {
                e.delegateTarget = target;
                if (_.isFunction(listener)) {
                  listener.call(self, e);
                }
                break;
              }
              target = target.parentNode;
            }
          },
          useCapture
        )
      );
    }
  },

  /**
   * - Sending OTP for user verification in case of save=1
   * - Note: Already existing functionality just moved out of submit method
   */
  sendOTP: function (hide = false) {
    // if any session screen is visible hide it
    if (hide) {
      makeHidden('.screen.' + shownClass);
    }

    let session = this;
    this.otpView.updateScreen({
      skipTextLabel: RazorpayHelper.isOneClickCheckout()
        ? 'skip_saving_card_one_cc'
        : 'skip_saving_card',
    });
    Analytics.track('saved_cards:save:otp:ask');
    this.commenceOTP('otp_sending_generic', 'saved_cards_save', {
      phone: getPhone(),
    });
    this.askOTP(
      this.otpView,
      undefined,
      true,
      { phone: getPhone() },
      undefined,
      undefined,
      true
    );
    let otpTemplate = discreet.OtpTemplatesHelper.getDefaultOtpTemplate();
    this.getCurrentCustomer().createOTP(
      function () {
        session.updateCustomerInStore();
      },
      null,
      otpTemplate
    );
    return;
  },

  resendOTP: function () {
    let otpProvider;
    let paymentExists = Boolean(this.r._payment);
    let isCardlessEmiPayment =
      this.payload && this.payload.method === 'cardless_emi';
    let isWallet = this.payload && this.payload.method === 'wallet';

    if (!paymentExists || isCardlessEmiPayment) {
      /**
       * If we're resending the OTP without any payment being created,
       * it's a Razorpay OTP.
       * Used for Saved Cards, Cardless EMI.
       */
      otpProvider = 'razorpay';
    } else if (this.headless && this.headlessMetadata) {
      otpProvider =
        this.headlessMetadata.issuer || this.headlessMetadata.network;
    }

    let otpSentCount = OtpService.getCount(otpProvider);
    let resendEventData = {
      wallet: isWallet,
      headless: this.headless,
    };

    if (otpSentCount) {
      resendEventData.count = otpSentCount;
    }

    Analytics.track('otp:resend', {
      type: AnalyticsTypes.BEHAV,
      data: resendEventData,
    });

    if (this.payload?.method === 'card') {
      CardsTracker.NATIVE_OTP_SMS_RESEND_CLICKED({
        instrument: AnalyticsV2State.selectedInstrumentForPayment.instrument,
      });
    }

    if (this.headless) {
      this.otpView.updateScreen({
        showCtaOneCC: false,
      });
      this.commenceOTP('resending_otp');
      this.hideTimer();

      if (this.headlessMetadata) {
        let metadata = this.headlessMetadata;

        OtpService.markOtpSent(metadata.issuer || metadata.network);
      }

      return this.r.resendOTP(this.r.emitter('payment.otp.required'));
    }

    this.commenceOTP('otp_sending_generic', undefined, { phone: getPhone() });
    if (
      this.tab === 'emi' &&
      isEmiV2() &&
      this.payload &&
      this.payload.method === 'cardless_emi'
    ) {
      fetchCardlessEmiPlans({
        resend: true,
      });
    } else if (this.tab === 'cardless_emi') {
      this.fetchCardlessEmiPlans({
        resend: true,
      });
    } else if (this.tab === 'paylater') {
      this.askPayLaterOtp('resend');
    } else if (isWallet) {
      this.otpView.updateScreen({
        showCtaOneCC: false,
      });
      this.r.resendOTP(this.r.emitter('payment.otp.required'));
    } else {
      let self = this;
      let otpTemplate = discreet.OtpTemplatesHelper.getDefaultOtpTemplate();
      this.getCurrentCustomer().createOTP(
        function (message) {
          // TODO: check how message is being consumed. Possible bug.
          self.askOTP(
            self.otpView,
            message,
            true,
            { phone: getPhone() },
            undefined,
            undefined,
            true
          );
          self.updateCustomerInStore();
        },
        null,
        otpTemplate
      );
    }
  },

  secAction: function () {
    /**
     *  setting resendTimeout store to initial value 0 once we skip the OTP
     *  as it is again going to set in askOTP function of session.js whenever we trigger OTP
     *  setting it 0 helping here bcoz everytime we are adding 30 * 1000 at the time of askOTP to current date
     *  which in the end become constant value of initialSeconds in resendButton component
     *  and timer doest not starting from initial
     */
    this.otpView.updateScreen({
      truecallerLoginFailed: false,
      resendTimeout: 0,
    });

    if (this.headless && this.r._payment) {
      Analytics.track('native_otp:gotobank', {
        type: AnalyticsTypes.BEHAV,
        immediately: true,
      });

      CardsTracker.NATIVE_OTP_NATIVE_TO_3DS_REDIRECT_CLICKED({
        instrument: AnalyticsV2State.selectedInstrumentForPayment.instrument,
      });
      this.hideTimer();
      this.showLoadError(I18n.format('misc.payment_waiting_on_bank'));
      return this.r._payment.gotoBank();
    }
    const payload = this.payload;
    Analytics.track('saved_cards:skip', {
      type: AnalyticsTypes.BEHAV,
      data: {
        while_submitting: !!payload,
      },
    });
    CardsTracker.SKIP_SAVED_CARD_CLICKED();

    $('#save').attr('checked', 0);
    this.wants_skip = true;

    /**
     * for UPI QR at L0/L1 active or failed due to checkout order failure
     * it causing issue when we skip OTP as it triggers the submit flow because of payload present
     */
    const isPayloadIsOfQRFlow = isPayloadIsOfQR(payload);
    if (payload && !isPayloadIsOfQRFlow) {
      delete payload.save;
      delete payload.app_token;
      // On otp skip action if it's new emi flow proceed with emi payment from seperate handler
      if (RazorpayHelper.isEmiV2() && payload.method === 'emi') {
        handleEmiPaymentV2({
          payloadData: payload,
          action: 'otp_skipped',
        });
      } else {
        this.submit();
      }
      if (!this.headless) {
        this.setScreen('card');
      }

      this.commenceOTP('payment_processing');
    } else {
      // If it's a new emi flow skipping otp takes us to emi options flow for emi tab
      if (this.tab === 'emi' && RazorpayHelper.isEmiV2()) {
        const screenToSet = 'emi';
        Analytics.track('screen:switch', {
          data: {
            from: this.screen || '',
            to: screenToSet || '',
          },
        });
        Analytics.setMeta('screen', screenToSet);
        Analytics.setMeta('timeSince.screen', discreet.timer());

        this.screen = screenToSet;
        screenStore.set(screenToSet);

        this.otpView.updateScreen({
          showCtaOneCC: false,
        });
        // we need to hide the otp screen here
        makeHidden('.screen.' + shownClass);
        renderEmiOptions();
      } else {
        this.showCardTab();
      }
    }
  },

  addFunds: function () {
    Analytics.track('wallet:balance:add', {
      type: AnalyticsTypes.BEHAV,
      data: {
        wallet: this.payload && this.payload.wallet,
      },
    });

    this.otpView.setTextView('loading');
    this.otpView.updateScreen({
      action: false,
      loading: true,
      addFunds: false,
    });
    this.powerwallet = false;
    this.r.topupWallet();
  },

  setAmount: function (amount, triggerShowAmountInCta) {
    const previousAmount = this.get().amount;
    this.get().amount = amount;
    let offer = this.getAppliedOffer();
    this.updateAmountInHeader(amount);
    let originalAmount = amount;
    if (offer && offer.amount) {
      if (RazorpayHelper.isOneClickCheckout()) {
        this.updateAmountInHeaderForOffer(amount);
      } else {
        this.updateAmountInHeaderForOffer(offer.amount);
        originalAmount = offer.amount;
      }
    }
    if (previousAmount !== amount) {
      /**
       * In case of partial payments, the user opts for
       *  change of amount or
       *  change of partial/full
       * init happens again, we need to cancel previous QR payment with proper reason.
       */
      isQRPaymentCancellable({}, true, true);
      initUpiQrV2();
    }
    if (triggerShowAmountInCta) {
      showAmountInCta();
    }
    CTAHelper.setAmount(originalAmount);
  },

  fixLandscapeBug: function () {
    function shiftUp() {
      $(this.el.querySelector('#footer'))
        .removeClass('shift-footer-down')
        .addClass('shift-footer-up');
      $(this.el.querySelector('#should-save-card'))
        .removeClass('shift-ssc-down')
        .addClass('shift-ssc-up');
    }
    function shiftDown() {
      $(this.el.querySelector('#footer'))
        .removeClass('shift-footer-up')
        .addClass('shift-footer-down');
      $(this.el.querySelector('#should-save-card'))
        .removeClass('shift-ssc-up')
        .addClass('shift-ssc-down');
    }
    if (discreet.UserAgent.iOS) {
      this.on('focus', '#card_name', shiftUp);
      this.on('blur', '#card_name', shiftDown);
      this.on('focus', '#card_cvv', shiftUp);
      this.on('blur', '#card_cvv', shiftDown);
    }
  },
  bindEvents: function (selector) {
    selector = selector || '#body';

    let self = this;

    // cultgear.com bug: no events register unless
    // https://stackoverflow.com/questions/41869122/touch-events-within-iframe-are-not-working-on-ios
    document.addEventListener('touchstart', UTILS.returnAsIs);
    this.listeners.push(function () {
      document.removeEventListener('touchstart', UTILS.returnAsIs);
    });

    this.on('focus', selector, 'input', 'focus', true);
    this.on('blur', selector, 'input', 'blur', true);
    this.on(
      'input',
      selector,
      'input',
      function (e) {
        this.input(e.target);
      },
      true
    );

    if (this.get('theme.close_button')) {
      this.click('#modal-close', function () {
        if (self.get('modal.confirm_close')) {
          Confirm.confirmClose().then(function (close) {
            if (close) {
              self.hide();
            }
          });
        } else {
          self.hide();
        }
      });
    }
    this.on('submit', '#form', this.preSubmit);
    this.on('click', '#footer-cta', this.preSubmit);

    if (MethodStore.isCardOrEMIEnabled()) {
      /**
       * On iOS, unlike Android, the height of the browser
       * does not change when the keyboard is open. 🙄
       * On Android, the footer CTA shifts because the browser
       * resizes.
       * To simulate the same on iOS, we shift footer and some elements
       * on the card screen.
       *
       * This _has_ to be fixed in v4, so we'll remove it then.
       */
      if (Hacks.isDeviceLandscape() && isMobile()) {
        this.fixLandscapeBug();
      }
    }

    if (MethodStore.isMethodEnabled('wallet')) {
      try {
        this.on(
          'change',
          '#wallets',
          function () {
            if (ua_iPhone) {
              Razorpay.sendMessage({ event: 'blur' });
            }
          },
          true
        );
      } catch (e) {}
    }

    if (
      MethodStore.isMethodEnabled('upi') ||
      MethodStore.isMethodEnabled('upi_otm')
    ) {
      this.click('#cancel_upi .btn', function () {
        let upi_radio = $('#cancel_upi input:checked');
        if (!upi_radio[0]) {
          return;
        }
        let metaParam = {};
        metaParam[upi_radio.prop('name')] = upi_radio.val();
        this.clearRequest(metaParam);
        $('#error-message').removeClass('cancel_upi');
      });
      this.click('#cancel_upi .back-btn', function () {
        $('#error-message').removeClass('cancel_upi');
      });
    }

    if (MethodStore.isMethodEnabled('emi')) {
      this.on('click', '#form-card', 'saved-card-pay-without-emi', function () {
        self.switchTab('card');
      });
    }

    let goto_payment = '#error-message .link';

    this.click(goto_payment, function () {
      if (this.payload && this.payload.method === 'upi') {
        if (this.payload['_[flow]'] === 'directpay') {
          if (RazorpayHelper.isRedesignV15()) {
            return this.hideErrorMessage();
          }
          return cancel_upi(this);
        } else if (this.payload['_[flow]'] === 'intent') {
          if (Confirm.isVisible()) {
            return;
          }
          if (upiUxV1dot1.enabled()) {
            /**
             * Possibly user is attepmting for payment cancel
             *
             */
            this.upiPaymentManualCancelAttempted = true;
          }
          this.hideErrorMessage();
        }
      }
      this.r.focus();
    });

    this.click('#backdrop', this.hideErrorMessage);
    this.click('#fd-hide', this.hideErrorMessage);
    this.click('#overlay-close', this.hideErrorMessage);

    this.on('click', '#form-upi.collapsible .item', function (e) {
      $('#form-upi.collapsible .item.expanded').removeClass('expanded');
      $(e.currentTarget).addClass('expanded');
    });
  },
  focus: function (e) {
    if (_El.hasClass(e.target, 'no-focus')) {
      return;
    }

    $(e.target.parentNode).addClass('focused');
    setTimeout(function () {
      $(e.target).scrollIntoView();
    }, 1000);
    if (ua_iPhone) {
      Razorpay.sendMessage({ event: 'focus' });
    }
  },

  blur: function (e) {
    if (_El.hasClass(e.target, 'no-blur')) {
      return;
    }

    $(e.target.parentNode).removeClass('focused').addClass('mature');
    this.input(e.target);
    if (ua_iPhone) {
      Razorpay.sendMessage({ event: 'blur' });
    }
  },

  input: function (el) {
    if (_El.hasClass(el, 'no-validate')) {
      return;
    }

    let value = el.value;
    let required = _.isString(el.getAttribute('required'));
    let pattern = el.getAttribute('pattern');
    let $parent = $(el.parentNode);

    $parent.toggleClass('filled', value);

    // validity check past this
    if (!(required || pattern)) {
      return;
    }
    let valid = true;
    if (required && !value) {
      valid = false;
    }
    if (!required && !value) {
      valid = true;
    } else {
      if (valid && pattern) {
        valid = new RegExp(pattern).test(value);
      }
    }
    $parent.toggleClass('invalid', !valid);
  },

  refresh: function () {
    UTILS.each(docUtil.querySelectorAll('.input:not(.no-refresh)'), (i, el) => {
      this.input(el);
    });
  },

  setFormatting: function () {
    this.refresh();
    const delegator = (this.delegator = Razorpay.setFormatter(this.el));
    delegator.otp = delegator
      .add('number', docUtil.getElementById('otp'))
      .on('change', () => {
        this.input(this.el);
      });
  },

  setScreen: function (screen, params) {
    EventsV2.setContext(
      ContextProperties.SCREEN_NAME,
      getCurrentScreen(screen)
    );

    let extraProps = params && params.extraProps;

    // Remove CTA for all cases, if moving away from otp screen
    if (screen !== 'otp' && this.screen === 'otp') {
      this.otpView.updateScreen({
        showCtaOneCC: false,
        truecallerLoginFailed: false,
      });
    }

    if (screen) {
      let tabForTitle = this.tab === 'emi' ? this.tab : this.cardTab || screen;

      if (tabForTitle && this.topBar) {
        this.topBar?.setTab(tabForTitle);
      }
    }
    /**
     * onShown is different from tabVisible. As in case of card onShown trigger even we are asking for saved card OTP.
     * tabVisible will trigger on actual tab shown only.
     */
    if (
      screen === 'card' &&
      this.svelteCardTab &&
      typeof this.svelteCardTab.setTabVisible === 'function'
    ) {
      this.svelteCardTab.setTabVisible(true);
    }

    if (screen !== 'otp') {
      this.headless = false;
    }

    // TODO remove this from here
    // check cardTab.setEmiPlansCta for details
    if (screen !== 'upi') {
      cardTab.setEmiPlansCta(screen, this.tab);
    }

    if (this.offers) {
      this.offers.renderTab(this.tab);
    }

    if (screen === this.screen) {
      /** When switching from navstack card screen to session card screen
       * Need to explicitly change the css classes for card screen to show
       * Since screen and this.screen are same i.e card
       */
      if (screen === 'card' && controlledViaSession()) {
        $('#body').attr('screen', screen);
        makeVisible('#form-card');
      }
      return;
    }

    if (screen === 'qr') {
      this.currentScreen = new discreet.QRScreen({
        target: docUtil.querySelector('#form-fields'),
        props: {
          paymentData: this.getFormData(),
          onSuccess: successHandler.bind(this),
        },
      });
    } else if (this.currentScreen) {
      this.currentScreen.$destroy();
      this.currentScreen = null;
    }

    let trackingData = {
      from: this.screen || '',
      to: screen || '',
    };

    // removed causing issue during OTP screen & non OTP screen
    // if (this.screen === 'otp' && (screen !== 'otp' && screen !== 'card')) {
    //   Store.showFeeLabel.set(false);
    // }

    // if (this.screen !== 'otp' && screen === 'otp') {
    //   Store.showFeeLabel.set(true);
    // }
    if (extraProps) {
      trackingData = Object.assign(trackingData, extraProps);
    }

    Analytics.track('screen:switch', {
      data: trackingData,
    });
    Analytics.setMeta('screen', screen);
    Analytics.setMeta('timeSince.screen', discreet.timer());

    this.screen = screen;
    screenStore.set(this.screen);
    $('#body').attr('screen', screen);
    makeHidden('.screen.' + shownClass);
    if (screen === 'home-1cc' || screen === 'qr') {
      discreet.OffersStore.showOffers.set(false);
    } else {
      discreet.OffersStore.showOffers.set(true);
      if (screen) {
        this.topBar?.show();
      } else if (!RazorpayHelper.isOneClickCheckout()) {
        this.topBar?.hide();
      }
    }
    let screenEl = '#form-' + (screen || 'common');
    if (
      (screen === 'emi' || screen === 'cardless_emi') &&
      RazorpayHelper.isEmiV2()
    ) {
      let skipOTPFlow = false;
      let isFromPreferredBlock = false;
      /**
       * tab is selected from p13n block which says 'EMI - Use your saved cards' ask otp always
       */
      if (this.switchTabPayload && this.switchTabPayload.preferred) {
        skipOTPFlow = false;
      }
      let customer = this.getCurrentCustomer();
      const selectedInstrument = this.getSelectedPaymentInstrument();
      // if user has saved cards show otp screen
      // and user is not coming from cardless_emi config block
      if (
        isOTPSupported() &&
        !skipOTPFlow &&
        customer.haveSavedCard &&
        !customer.logged &&
        !this.wants_skip &&
        this.screen !== 'card' &&
        selectedInstrument &&
        selectedInstrument.method !== 'cardless_emi'
      ) {
        if (this.tab === 'card') {
          initLoginForSavedCard.call(
            this,
            isFromPreferredBlock
              ? TRUECALLER_VARIANT_NAMES.preferred_methods
              : TRUECALLER_VARIANT_NAMES.access_saved_cards
          );
        } else {
          this.askOTPForSavedCard();
        }
      } else {
        // render new EMI screen
        renderEmiOptions();
      }
    } else {
      makeVisible(screenEl);
    }

    /**
     * On the new homescreen,
     * we want to focus only if the user
     * is on the details screen.
     *
     * Temp check, will be fixed when old homescreen is removed.
     */
    let invalidInput = docUtil.querySelector(screenEl + ' .invalid input');
    if (screen === '') {
      if (this.homeTab && this.homeTab.onDetailsScreen() && invalidInput) {
        invalidInput.focus();
      }
    } else if (
      !(
        (screen === 'upi' || screen === 'upi_otm') &&
        NativeStore.getUPIIntentApps().filtered.length
      )
    ) {
      let appliedOffer = this.getAppliedOffer() || {};

      if (
        !(
          appliedOffer &&
          appliedOffer.issuer === 'cred' &&
          this.tab === appliedOffer.payment_method
        ) &&
        invalidInput
      ) {
        invalidInput.focus();
      }
    }

    let showPaybtn = screen;
    if (
      screen === 'cardless_emi' ||
      (this.tab === 'cardless_emi' && screen === 'emiplans') ||
      screen === 'paylater' ||
      screen === 'qr' ||
      (screen === 'netbanking' && RazorpayHelper.isRecurring()) ||
      screen === 'emandate'
    ) {
      showPaybtn = false;
    }

    if (screen === '' && this.homeTab) {
      this.homeTab.onShown();
    } else if (screen === 'wallet' && this.walletTab) {
      this.walletTab.onShown();
    } else if (screen !== 'upi' && screen !== 'upi_otm') {
      showPaybtn ? showCta() : hideCta();
    } else {
      let instance = this.getCurrentTabInstance(screen);
      if (instance && instance.onShown) {
        instance.onShown();
      }
    }

    return;
  },

  /**
   * Tries selecting the bank if netbanking offer,
   * wallet if wallet offer, and so on
   * @param {Offer} offer
   */
  _trySelectingOfferInstrument: function (offer) {
    let issuer = offer.issuer;
    let screen = offer.payment_method;
    let isEmiOffer = offer.payment_method === 'emi' && !offer.emi_subvention;

    let emiHandler = function () {
      let emiDuration = EmiStore.getEmiDurationForNewCard();
      let bank = this.emiPlansForNewCard && this.emiPlansForNewCard.code;

      if (emiDuration) {
        let plan = MethodStore.getEMIBankPlans(
          bank,
          'credit',
          !isEmiOffer
        ).find(function (p) {
          return p.duration === emiDuration;
        });
        if (
          plan &&
          offer.id &&
          offer.emi_subvention &&
          plan.offer_id !== offer.id
        ) {
          // Clear duration
          EmiStore.newCardEmiDuration.set('');
        }
      }
    };

    if (screen === 'wallet') {
      // Select wallet
      if (issuer && this.walletTab) {
        this.walletTab.onWalletSelection(issuer);
      }
    } else if (screen === 'netbanking') {
      // Select bank
      if (issuer) {
        NetbankingScreenStore.selectedBank.set(issuer);
      }
    } else if (screen === 'emi') {
      emiHandler.call(this);
    } else if (screen === 'cardless_emi' && screen !== 'otp') {
      /**
       * If EMI and Cardless EMI are clubbed, the user will land on the Cardless EMI screen
       * So, if the offer method is EMI, let's get the user on the EMI screen
       */
      if (offer.payment_method === 'emi') {
        this.selectCardlessEmiProviderAndAttemptPayment('cards');

        emiHandler.call(this);
      } else {
        let provider = offer.provider;

        if (provider) {
          this.selectCardlessEmiProviderAndAttemptPayment(provider);
        }
      }
    } else if (screen === 'card') {
      // currently in cards, we have google pay and cred apps, so based on provider code, we can select them
      if (offer && offer.issuer && offer.payment_method === 'card') {
        let cardApps = discreet.Apps.getAppsForMethod('card') || [];
        let isCardAppOffer =
          cardApps.findIndex(function (app) {
            return app === offer.issuer;
          }) !== -1;
        if (isCardAppOffer && MethodStore.isApplicationEnabled(offer.issuer)) {
          this.svelteCardTab?.setSelectedApp(offer.issuer);
        }
      }
    }
  },

  /**
   * Handles offer selection
   * @param {Offer} offer
   */
  handleOfferSelection: function (offer) {
    /**
     * Get the first instrument that can work with the offer
     * and select it if not already selected
     */
    let instrument = discreet.Offers.getInstrumentToSelectForOffer(offer);

    if (!instrument) {
      Analytics.track('offer_instrument_undef', {
        type: AnalyticsTypes.DEBUG,
        data: {
          offer: offer,
        },
      });

      return;
    }

    if (storeGetter(HomeScreenStore.selectedInstrumentId) === instrument.id) {
      // If selected instrumet is emi and user is applying offer
      // on cardless emi method (user is on cardless tab)
      // bring user to L1 EMI screen and remove provider selection
      if (
        storeGetter(selectedTab) &&
        isCardlessTab() &&
        this.tab === 'emi' &&
        RazorpayHelper.isEmiV2()
      ) {
        popStack();
        this.screen = 'emi';
        screenStore.set('emi');
        selectedTab.set(null);
        selectedBank.set(null);
      }
      // Do not switch tabs
    } else if (offer && offer.payment_method === 'emi') {
      this.switchTab('emi');
    } else {
      // Since for new emi flow we are using navstack
      // therefore we need to give the control back to session when switching tabs
      if (isStackPopulated()) {
        moveControlToSession(true);
      }
      this.switchTab('');
      if (
        offer &&
        offer.payment_method === 'card' &&
        discreet.CardExperiments.cardsSeparation.enabled()
      ) {
        // Since offers currently created using method not type ( card but not debit-card )
        // when offer is being and experiment is ON, avoid screen switch. And let the user do manually
        return;
      }
      if (this.homeTab?.onSelectInstrument) {
        this.homeTab.onSelectInstrument({
          detail: instrument,
        });
      }
    }

    let session = this;

    session.offers.rerenderTab();

    // Wait for switching to be over
    setTimeout(function () {
      session._trySelectingOfferInstrument(offer);
    }, 300);
  },

  getDCCPayload: function () {
    let currency, amount;
    if (this.dccPayload) {
      /** value of dccPayload set via DynamicCurrencyView.svelte */
      if (this.dccPayload.enable && this.dccPayload.currency) {
        currency = this.dccPayload.currency;
      }
      /**
       * check dcc amount we have it is for discounted amount
       * as flow api may take time we can't show original amount we can show discount amount in INR
       */
      if (
        this.dccPayload.enable &&
        this.dccPayload.currencyPayload &&
        this.dccPayload.currencyPayload.all_currencies &&
        this.dccPayload.entityWithAmount.indexOf(amount) !== -1
      ) {
        amount =
          this.dccPayload.currencyPayload.all_currencies[currency].amount;
      }
    }
    return { currency, amount };
  },
  back: function (confirmedCancel) {
    // Else if control is with navstack and not session js
    if (isStackPopulated() && !controlledViaSession()) {
      backPressed();
      return;
    }

    let tab = '';
    let payment = this.r._payment;
    let thisTab = this.tab;
    let self = this;

    if (RazorpayHelper.isOneClickCheckout()) {
      TopbarMagicCheckoutStore.tabTitle.set('');
      shouldOverrideVisibleState.set(false);
    }
    Analytics.track('back', {
      type: AnalyticsTypes.BEHAV,
    });

    if (thisTab === 'home-1cc' || this.screen === 'home-1cc') {
      discreet.OneClickCheckoutInterface.handleBack();
      return;
    }
    if (
      this.screen === 'otp' &&
      thisTab === 'emi' &&
      isEmiV2() &&
      controlledViaSession()
    ) {
      // If  on new emi flow and native otp screen is rendered
      // Clicking on back shows confirm payment cancel alert
      if (this.headless && payment) {
        if (confirmedCancel === true) {
          tab = 'emi';
          this.clearRequest();
          this.otpView.onBack();
        } else {
          Confirm.confirmClose().then(function (close) {
            if (close) {
              self.back(true);
              self.setOneCCTabLogo('');
            }
          });
          return;
        }
      }
      tab = 'emi';
    } else if (
      this.screen === 'otp' &&
      thisTab !== 'card' &&
      thisTab !== 'upi' &&
      thisTab !== 'emi'
    ) {
      tab = thisTab;
    } else if (
      (thisTab === 'qr' && this.r._payment) ||
      (this.headless && payment)
    ) {
      if (confirmedCancel === true) {
        if (thisTab === 'qr') {
          if (BackStore && typeof BackStore.tab === 'string') {
            tab = BackStore.tab;
            BackStore = null;
          } else {
            tab = 'upi';
          }
        } else {
          tab = thisTab;
        }
        this.clearRequest();
        this.otpView.onBack();
      } else {
        Confirm.confirmClose().then(function (close) {
          if (close) {
            self.back(true);
            self.setOneCCTabLogo('');
          }
        });
        return;
      }
    } else if (this.headless) {
      if (BackStore && BackStore.tab) {
        tab = BackStore.tab;
      } else {
        tab = 'card';
      }
    } else if (/^emiplans/.test(this.screen)) {
      if (this.emiPlansView.back()) {
        return;
      }
    } else if (/^emi$/.test(this.screen) && !RazorpayHelper.isEmiV2()) {
      // In old emi flow base emi tab is cardless-emi
      tab = 'cardless_emi';
    } else if (
      /**
       * If back is pressed from the Card EMI screen,
       * and cardless EMI is available as a payment method,
       * take to the Cardless EMI list screen,
       * which also has the Pay using Card EMI option.
       */
      this.screen === 'card' &&
      this.tab === 'emi' &&
      MethodStore.isMethodEnabled('cardless_emi')
    ) {
      if (RazorpayHelper.isEmiV2()) {
        tab = 'emi';
      } else {
        tab = 'cardless_emi';
      }
    } else if (this.tab === 'card') {
      if (this.svelteCardTab?.onBack()) {
        return;
      }
    } else if (this.tab === 'netbanking') {
      discreet.netbankingTab.destroy();
    } else if (this.tab === 'wallet') {
      discreet.walletTab.destroy();
    } else if (this.tab === 'nach') {
      if (this.nachScreen.onBack()) {
        return;
      }
    } else if (this.tab === 'bank_transfer') {
      es6components.bankTransferTab.destroy();
    } else if (this.tab === 'emandate') {
      if (this.emandateView?.onBack()) {
        return;
      }
    } else if (this.tab === INTERNATIONAL_TAB_NAME) {
      if (internationalTabBackPress()) {
        return;
      }
    } else if (this.tab === 'offline_challan') {
      discreet.offlineChallanTab.destroy();
    } else if (this.tab === discreet.IntlBankTransferTab.TAB_NAME) {
      if (this.intlBankTransferTab && this.intlBankTransferTab.onBack()) {
        return;
      }
      // destroy the international bank transfer view
      discreet.IntlBankTransferTab.destroy();
      this.intlBankTransferTab = null;
    } else if (!this.tab) {
      if (discreet.OneClickCheckoutInterface.historyExists()) {
        discreet.ChargesHelper.removeCodCharges();
        discreet.OneClickCheckoutInterface.handleBack();
        this.switchTab('home-1cc');
        Cta.showCta();
        this.topBar?.hide();
        if ($('#amount .original-amount')[0]) {
          $('#amount .original-amount')[0].removeAttribute('style');
        }
        return;
      }
      if (RazorpayHelper.isRedesignV15()) {
        if (this.homeTab?.canGoBack()) {
          this.homeTab.editUserDetails();
        } else if (!RazorpayHelper.getOption('theme.close_button')) {
          // close modal
          this.closeModal();
        } else if (this.get('theme.show_back_always')) {
          return this.modal.hide();
        }
      }
    } else {
      if (this.get('theme.close_method_back')) {
        return this.modal.hide();
      }
      tab = '';
    }

    // change view state to default from AVS
    // its required in case user select card from preferred block
    // we are using isOnAVSScreen logic in presubmit
    if (this.screen === 'card' && this.svelteCardTab?.isOnAVSScreen()) {
      this.svelteCardTab.onBack();
    }

    let beforeReturn = function () {
      if (BackStore && BackStore.screen) {
        self.setScreen(BackStore.screen);
      }
      self.switchTab(tab);

      BackStore = null;
    };

    let walletOtpPage =
      tab === 'wallet' && this.screen === 'otp' && this.r._payment;
    let cardlessEmiOtpPage =
      tab === 'cardless_emi' && this.screen === 'otp' && this.r._payment;

    // for 1CC modal close handled on header/sessionInterface
    if (walletOtpPage || cardlessEmiOtpPage) {
      let resetOTPScreen = function () {
        discreet.OTPScreenStore.tabLogo.set('');
        self.clearRequest({
          '_[reason]': 'PAYMENT_CANCEL_BEFORE_OTP_VERIFY',
        });
        beforeReturn();
      };

      if (RazorpayHelper.isOneClickCheckout()) {
        resetOTPScreen();
      } else {
        Confirm.confirmClose().then(function (close) {
          if (close) {
            resetOTPScreen();
          }
        });
      }
    } else {
      beforeReturn();
    }
  },
  /**
   * Checks if the fields on the homepage are valid or not.
   *
   * @returns {boolean} valid
   */
  checkCommonValid: function () {
    let selector = '#form-common';

    if (this.homeTab && this.homeTab.onMethodsScreen()) {
      // Validate any additional input (like contact)
      selector = '.instrument.selected';
    }

    let valid = !this.checkInvalid(selector);

    return valid;
  },

  /**
   * Checks if fields are invalid.
   * And if they are invalid, tracks them.
   *
   * @returns {boolean} valid
   */
  checkCommonValidAndTrackIfInvalid: function () {
    let valid = this.checkCommonValid();

    if (!valid) {
      let fields = docUtil.querySelectorAll('#form-common .invalid [name]');

      let invalidFields = {};
      let invalidValues = {};

      if (Array.isArray(fields)) {
        fields.forEach(function (field) {
          invalidFields[field.name] = true;
          invalidValues[field.name] = field.value;
        });
      }

      Analytics.track('homescreen:fields:invalid', {
        data: {
          fields: invalidFields,
          values: invalidValues,
        },
      });
    }

    return valid;
  },
  tabSwitchStart: 0,
  tabsCount: 0,
  switchTab: function (tab, payload) {
    /**
     * Validate fields on common screen.
     */
    /** it will be override everytime switch tab uses */

    if (!this.isOpen) {
      return;
    }
    EventsV2.setContext(ContextProperties.SCREEN_NAME, getCurrentScreen(tab));
    this.switchTabPayload = payload;
    this.tabsCount++;
    if (this.tabsCount > 5) {
      updateScore('switchingTabs', { tabsCount: this.tabsCount });
    }
    let diff = 0;
    if (this.tabSwitchStart > 0) {
      diff = (Date.now() - this.tabSwitchStart) / 1000;
    }
    this.tabSwitchStart = Date.now();
    if (!this.tab) {
      if (!this.checkCommonValidAndTrackIfInvalid()) {
        return;
      }
    }
    Analytics.track('tab:switch', {
      data: {
        from: this.tab || '',
        to: tab || '',
        timeSpentInTab: diff > 0 ? diff : 'NA',
      },
    });
    Analytics.setMeta('tab', tab);
    Analytics.setMeta('timeSince.tab', discreet.timer());

    // Executes actions to be done when moving away from a screen
    if (this.tab !== tab) {
      let instance = this.getCurrentTabInstance();
      if (instance && instance.onHide) {
        instance.onHide();
      }
    }

    if (tab === '') {
      this.homeTab?.onShown();
    }
    if (tab) {
      if (tab === 'credit_card' || tab === 'debit_card') {
        this.cardTab = tab;
        tab = 'card';
      } else {
        this.cardTab = null;
      }

      Razorpay.sendMessage({
        event: 'event',
        data: {
          event: 'method_selection',
          data: {
            method: tab,
          },
        },
      });

      let contact = getPhone();
      if (
        !RazorpayHelper.isOneClickCheckout() &&
        ((!contact && !RazorpayHelper.isContactOptional()) ||
          this.get('method.' + tab) === false)
      ) {
        return;
      }
      this.updateCustomerInStore();

      if (this.getCurrentCustomer().logged && !this.local) {
        this.topBar?.setLogged(true);
      }

      this.topBar?.setContact(contact);

      let offer = this.getAppliedOffer();
      if (
        this.offers &&
        offer &&
        discreet.Offers.getOfferMethodForTab(tab) !== offer.payment_method
      ) {
        this.offers.clearOffer(false);
      }
    } else {
      this.payload = null;
      this.clearRequest();
    }
    if (tab === 'netbanking') {
      discreet.netbankingTab.render();
    }
    if (tab === 'fpx') {
      renderFPXTab();
    }
    if (tab === 'wallet') {
      discreet.walletTab.render();
    }

    if (tab === 'upi') {
      this.updateCustomerInStore();
      //For the new flow checkout no longer asks for OTP for UPI subscriptions.
      discreet.upiTab.render();
      this.setScreen('upi');
    }

    if (tab === 'upi_otm') {
      this.updateCustomerInStore();
      discreet.upiTab.render({ method: 'upi_otm' });
    }

    if (tab === 'emandate') {
      if (this.emandateView) {
        this.emandateView.onShown();
      } else {
        Analytics.track('incorrect integration', {
          message: 'Some entity is missing either order_id or order object.',
        });
      }
    }

    if (tab === '' && (this.screen === 'upi' || this.screen === 'upi_otm')) {
      if (this.upiTab.onBack()) {
        return;
      }
      discreet.upiTab.destroy();
    }

    this.body.attr('tab', tab);
    this.tab = tab;
    tabStore.set(this.tab);

    if (tab === 'wallet') {
      this.setScreen('wallet');
    }

    if (tab === INTERNATIONAL_TAB_NAME) {
      internationalTabRender(payload);
      this.setScreen(INTERNATIONAL_TAB_NAME);
    }

    if (
      tab === 'card' ||
      (tab === 'emi' && this.screen !== 'emi' && !RazorpayHelper.isEmiV2())
    ) {
      // If we are switching from home tab or cardless emi tab (after choosing
      // "EMI on Cards"), the customer might have changed.
      if (this.screen === '' || this.screen === 'cardless_emi') {
        this.updateCustomerInStore();
        this.svelteCardTab?.showLandingView();
      }
      this.showCardTab();
      cardTab.setEmiPlansCta(this.screen, tab);
    } else {
      if (
        !(
          tab === 'upi' &&
          RazorpayHelper.isASubscription() &&
          !this.getCurrentCustomer().logged
        )
      ) {
        this.setScreen(tab);
      }
      if (ua_iPhone) {
        Razorpay.sendMessage({ event: 'blur' });
      }
    }
    if (!tab) {
      let selectedInstrument = this.getSelectedPaymentInstrument();

      if (selectedInstrument) {
        $('#body').addClass('sub');
      }
    }

    if (tab === 'nach') {
      this.nachScreen.onShown();
    }

    if (tab === 'bank_transfer') {
      es6components.bankTransferTab.render();
    }

    if (tab === 'offline_challan') {
      discreet.offlineChallanTab.render();
    }

    if (tab === discreet.IntlBankTransferTab.TAB_NAME) {
      this.intlBankTransferTab = discreet.IntlBankTransferTab.render(payload);
    }
  },

  showCardTab: function () {
    this.otpView.updateScreen({
      maxlength: 6,
    });

    if (
      !(
        this.tab === 'emi' &&
        Object.keys(storeGetter(EmiStore.emiDurations)).length
      )
    ) {
      this.svelteCardTab?.onShown();
    }

    let self = this;
    let customer = self.getCurrentCustomer();
    let remember = Store.shouldRememberCustomer();

    let skipOTPFlow = discreet.CardHelper.delayLoginOTPExperiment();
    /**
     * tab is selected from p13n block which says 'Use your saved cards' ask otp always
     */
    let isFromPreferredBlock = false;
    if (this.switchTabPayload && this.switchTabPayload.preferred) {
      skipOTPFlow = false;
      isFromPreferredBlock = true;
    }

    if (!remember) {
      return self.setScreen('card');
    }

    this.topBar?.setTitleOverride('otp', 'text', 'card');

    this.otpView.updateScreen({
      skipTextLabel: RazorpayHelper.isOneClickCheckout()
        ? 'skip_saved_cards_one_cc'
        : 'skip_saved_cards',
    });

    /**
     * When the user comes back to the card tab after selecting EMI plan,
     * do not commence OTP again.
     */
    let activeEmiPlan = EmiStore.getEmiDurationForNewCard();
    if (
      isOTPSupported() &&
      !skipOTPFlow &&
      customer.haveSavedCard &&
      !customer.logged &&
      !this.wants_skip &&
      this.screen !== 'card' &&
      !activeEmiPlan
    ) {
      if (this.tab === 'card') {
        initLoginForSavedCard.call(
          self,
          isFromPreferredBlock
            ? TRUECALLER_VARIANT_NAMES.preferred_methods
            : TRUECALLER_VARIANT_NAMES.access_saved_cards
        );
      } else {
        self.askOTPForSavedCard();
      }
    } else {
      self.setScreen('card');
    }
  },

  askOTPForSavedCard: function () {
    let self = this;
    let customer = self.getCurrentCustomer();

    this.topBar?.setTitleOverride('otp', 'text', 'card');
    this.otpView.updateScreen({
      skipTextLabel: RazorpayHelper.isOneClickCheckout()
        ? 'skip_saved_cards_one_cc'
        : 'skip_saved_cards',
      showCtaOneCC: true,
    });

    self.commenceOTP('saved_cards_sending', 'saved_cards_access', {
      phone: getPhone(),
    });
    let smsHash = this.get('send_sms_hash') && this.sms_hash;
    let params = {};
    if (smsHash) {
      params.sms_hash = smsHash;
    }
    /**
     * checkout sms template is different from magic
     * as checkout template can have a hash for sdk to autoread message
     * if we not send otp_reason it will pick checkout's default template
     */
    if (RazorpayHelper.isOneClickCheckout()) {
      params.otp_reason = discreet.OTP_TEMPLATES.access_card;
    }
    customer.checkStatus(function () {
      /**
       * 1. If customer has saved cards and is not logged in, ask for OTP.
       * 2. If customer doesn't have saved cards, show cards screen.
       */
      if (customer.saved && !customer.logged) {
        self.askOTP(
          self.otpView,
          undefined,
          true,
          { phone: getPhone() },
          undefined,
          undefined,
          true
        );
      } else {
        if (RazorpayHelper.isEmiV2() && self.tab === 'emi') {
          // Need to set the current screen to emi manually
          const screenToSet = 'emi';
          Analytics.track('screen:switch', {
            data: {
              from: self.screen || '',
              to: screenToSet || '',
            },
          });
          Analytics.setMeta('screen', screenToSet);
          Analytics.setMeta('timeSince.screen', discreet.timer());

          self.screen = screenToSet;
          screenStore.set(screenToSet);
          self.otpView.updateScreen({
            showCtaOneCC: false,
          });
          makeHidden('.screen.' + shownClass);
          renderEmiOptions();
        } else {
          self.setScreen('card');
        }
      }
    }, params);
  },

  showEmiPlansForNewCard: function () {
    let self = this;
    let amount = self.get('amount');
    let appliedOffer = self.getAppliedOffer();

    let getBankEMICode = function (issuer, type) {
      // EMI codes are different from bank codes and have _DC at the end.
      if (type === 'debit' && !issuer.endsWith('_DC')) {
        return issuer + '_DC';
      }
      return issuer;
    };

    self.topBar.resetTitleOverride('emiplans');

    let bank = self.emiPlansForNewCard && self.emiPlansForNewCard.code;
    let cardIssuer = bank.split('_')[0];
    let cardType = bank.endsWith('_DC') ? 'debit' : 'credit';
    let isEmiOfferApplied = Boolean(
      appliedOffer &&
        appliedOffer.payment_method === 'emi' &&
        !appliedOffer.emi_subvention
    );

    bank = getBankEMICode(bank, cardType);

    // If it's new emi flow we need to take the user to emi screen
    // with respective bank selected along with appropriate payload to show tabs
    const formattedBankCode = cardIssuer.toLowerCase();
    if (RazorpayHelper.isEmiV2()) {
      selectedBank.set({
        code: cardIssuer,
        creditEmi: cardType === 'credit',
        debitEmi: cardType === 'debit',
        isCardless: getCardlessEMIProviders()[formattedBankCode],
      });

      const nextScreen = 'emiPlans';
      const tab = 'emi';
      // track tab switch explicitly
      let diff = 0;
      if (this.tabSwitchStart > 0) {
        diff = (Date.now() - this.tabSwitchStart) / 1000;
      }
      Analytics.track('tab:switch', {
        data: {
          from: this.tab || '',
          to: tab || '',
          timeSpentInTab: diff > 0 ? diff : 'NA',
        },
      });
      Analytics.setMeta('tab', tab);
      Analytics.setMeta('timeSince.tab', discreet.timer());

      Analytics.track('screen:switch', {
        data: {
          from: this.screen || '',
          to: nextScreen || '',
        },
      });
      EventsV2.setContext(
        ContextProperties.SCREEN_NAME,
        getCurrentScreen(this.screen)
      );
      Analytics.setMeta('screen', nextScreen);
      Analytics.setMeta('timeSince.screen', discreet.timer());

      emiViaCards.set(true);
      emiMethod.set('bank');

      self.screen = nextScreen;
      screenStore.set(nextScreen);
      tabStore.set(tab);
      self.tab = tab;

      // track emi clicked on card screen
      const cardMeta = {
        card_issuer: cardIssuer,
        card_type: cardType,
      };
      trackEmiFromCardScreen(cardMeta);
      pushStack({
        component: EmiTabsScreen,
      });
      return;
    }

    let contactRequiredForEMI = MethodStore.isContactRequiredForEMI(
      bank,
      cardType
    );

    // We need to show plans without no-cost EMI if the applied offer is an
    // EMI offer because No cost EMI cannot be applied with regular EMI offers.
    let plans = MethodStore.getEMIBankPlans(bank, 'credit', !isEmiOfferApplied);
    let emiPlans = MethodStore.getEligiblePlansBasedOnMinAmount(plans);
    let prevTab = self.tab;
    let prevScreen = self.screen;

    self.emiPlansView.setPlans({
      type: 'new',
      amount: amount,
      plans: emiPlans,
      bank: bank,
      card: {
        issuer: cardIssuer,
        type: cardType,
      },
      contactRequiredForEMI: contactRequiredForEMI,
      on: {
        back: function () {
          self.switchTab(prevTab);
          self.setScreen(prevScreen);
          self.svelteCardTab.showAddCardView();

          return true;
        },

        payWithoutEmi: function () {
          Analytics.track('emi:pay_without', {
            type: AnalyticsTypes.BEHAV,
            data: {
              from: prevTab,
            },
          });

          EmiStore.newCardEmiDuration.set('');

          self.switchTab('card');
          self.setScreen('card');
          self.svelteCardTab.showLandingView();
        },

        select: function (value, contact) {
          let plan = plans.find(function (p) {
            return p.duration === value;
          });
          EmiStore.selectedPlan.set(plan);

          let text = cardTab.getEmiText(amount, plan) || '';

          Analytics.track('emi:plan:select', {
            type: AnalyticsTypes.BEHAV,
            data: {
              from: prevTab,
              value: value,
            },
          });

          EmiStore.newCardEmiDuration.set(value);
          EmiStore.selectedPlanTextForNewCard.set(text);

          self.switchTab('emi');
          self.svelteCardTab.showAddCardView();

          if (contactRequiredForEMI) {
            HomeScreenStore.emiContact.set(contact);
          }

          self.preSubmit();
        },

        viewAll: function () {
          discreet.EMIHelper.viewAllEMIPlans(prevTab);
        },
      },

      actions: {
        viewAll: true,
        payWithoutEmi: MethodStore.isMethodEnabled('card'),
      },
    });

    self.switchTab('emiplans');
    $('#body').removeClass('sub');
  },

  showEmiPlansForSavedCard: function (e) {
    let self = this;
    let amount = self.get('amount');
    let appliedOffer = self.getAppliedOffer();

    let getBankEMICode = function (issuer, type) {
      // EMI codes are different from bank codes and have _DC at the end.
      if (type === 'debit' && !issuer.endsWith('_DC')) {
        return issuer + '_DC';
      }
      return issuer;
    };

    self.topBar.resetTitleOverride('emiplans');

    // For new emi flow if user is coming from card screen
    // we need to manually change the tab and screen value for session
    // and push to navstack
    if (RazorpayHelper.isEmiV2()) {
      let selectedCard = discreet.storeGetter(CardScreenStore.selectedCard);
      selectedBank.set({
        code: selectedCard.card.issuer,
      });

      const tab = 'emi';
      const nextScreen = 'emiPlans';

      // track tab switch explicitly
      let diff = 0;
      if (this.tabSwitchStart > 0) {
        diff = (Date.now() - this.tabSwitchStart) / 1000;
      }
      Analytics.track('tab:switch', {
        data: {
          from: this.tab || '',
          to: tab || '',
          timeSpentInTab: diff > 0 ? diff : 'NA',
        },
      });
      Analytics.setMeta('tab', tab);
      Analytics.setMeta('timeSince.tab', discreet.timer());

      Analytics.track('screen:switch', {
        data: {
          from: this.screen || '',
          to: nextScreen || '',
        },
      });
      EventsV2.setContext(
        ContextProperties.SCREEN_NAME,
        getCurrentScreen(this.screen)
      );
      Analytics.setMeta('screen', nextScreen);
      Analytics.setMeta('timeSince.screen', discreet.timer());

      trackEmiFromCardScreen({
        card_issuer: selectedCard.card.issuer,
        card_network: selectedCard.card.network,
        card_type: selectedCard.card.type,
      });

      emiMethod.set('bank');
      emiViaCards.set(true);
      self.screen = nextScreen;
      screenStore.set(nextScreen);
      tabStore.set(tab);
      self.tab = tab;
      pushStack({
        component: EmiTabsScreen,
      });
      return;
    }

    let trigger = e.currentTarget;
    let $trigger = $(trigger);
    let bank = $trigger.attr('data-bank');
    let cobrandingPartner = $trigger.attr('data-cobranding');
    let cardIssuer = bank;
    let cardType = $trigger.attr('data-card-type');
    let isEmiOfferApplied = Boolean(
      appliedOffer &&
        appliedOffer.payment_method === 'emi' &&
        !appliedOffer.emi_subvention
    );

    // get emi plans wrt cobranding partner if the selected card
    // has co branding partner available Eg. Onecard
    if (cobrandingPartner) {
      bank = cobrandingPartner;
    }

    bank = getBankEMICode(bank, cardType);

    let contactRequiredForEMI = MethodStore.isContactRequiredForEMI(
      bank,
      cardType
    );

    // We need to show plans without no-cost EMI if the applied offer is an
    // EMI offer because No cost EMI cannot be applied with regular EMI offers.
    let plans = MethodStore.getEMIBankPlans(bank, cardType, !isEmiOfferApplied);
    let emiPlans = MethodStore.getEligiblePlansBasedOnMinAmount(plans);
    let $savedCard = $('.saved-card.checked');
    let savedCvv = $savedCard.$('.saved-cvv input').val();
    let prevTab = self.tab;
    let prevScreen = self.screen;

    self.emiPlansView.setPlans({
      type: 'saved',
      amount: amount,
      plans: emiPlans,
      card: {
        issuer: cardIssuer,
        type: cardType,
      },
      bank: bank,
      contactRequiredForEMI: contactRequiredForEMI,
      on: {
        back: function () {
          self.switchTab(prevTab);
          self.setScreen(prevScreen);

          return true;
        },

        payWithoutEmi: function () {
          Analytics.track('emi:pay_without', {
            type: AnalyticsTypes.BEHAV,
            data: {
              from: prevTab,
            },
          });

          EmiStore.setEmiDurationForSavedCard('');
          EmiStore.selectedPlanTextForSavedCard.set();

          self.switchTab('card');
          self.setScreen('card');
          self.svelteCardTab.showSavedCardsView();
        },

        select: function (value, contact) {
          let plan = plans.find(function (p) {
            return p.duration === value;
          });
          EmiStore.selectedPlan.set(plan);

          let text = cardTab.getEmiText(amount, plan) || '';
          Analytics.track('emi:plan:select', {
            type: AnalyticsTypes.BEHAV,
            data: {
              from: prevTab,
              value: value,
            },
          });
          EmiStore.setEmiDurationForSavedCard(value);
          EmiStore.selectedPlanTextForSavedCard.set(text);

          self.switchTab('emi');
          self.setScreen('card');
          self.svelteCardTab.showSavedCardsView();

          if (contactRequiredForEMI) {
            HomeScreenStore.emiContact.set(contact);
          }

          if (savedCvv) {
            self.preSubmit();
          } else {
            self.switchTab('emi');
            self.setScreen('card');
            self.svelteCardTab.showSavedCardsView();
          }
        },

        viewAll: function () {
          discreet.EMIHelper.viewAllEMIPlans(prevTab);
        },
      },

      actions: {
        viewAll: true,
        payWithoutEmi: MethodStore.isMethodEnabled('card'),
      },
    });

    self.switchTab('emiplans');
    $('#body').removeClass('sub');
  },

  showEmiPlansForBajaj: function () {
    let self = this;
    let amount = self.get('amount');
    let appliedOffer = self.getAppliedOffer();
    let isEmiOfferApplied = Boolean(
      appliedOffer &&
        appliedOffer.method === 'emi' &&
        !appliedOffer.emi_subvention
    );

    self.topBar.resetTitleOverride('emiplans');

    let bank = 'BAJAJ';

    // We need to show plans without no-cost EMI if the applied offer is an
    // EMI offer because No cost EMI cannot be applied with regular EMI offers.
    let plans = MethodStore.getEMIBankPlans(bank, 'credit', !isEmiOfferApplied);
    let emiPlans = MethodStore.getEligiblePlansBasedOnMinAmount(plans);
    let prevTab = self.tab;
    let prevScreen = self.screen;

    self.emiPlansView.setPlans({
      type: 'bajaj',
      amount: amount,
      plans: emiPlans,
      bank: bank,
      on: {
        back: function () {
          self.switchTab(prevTab);
          self.setScreen(prevScreen);
          return true;
        },

        select: function (value) {
          let plan = plans.find(function (plan) {
            return plan.duration === value;
          });

          let text = cardTab.getEmiText(amount, plan) || '';

          self.emiScreenView.setPlan({
            duration: plan.duration,
            text: text,
          });

          self.setScreen('emi');
          self.switchTab('emi');
        },

        actions: {
          viewAll: false,
          payWithoutEmi: false,
        },
      },
    });

    self.switchTab('emiplans');
    $('#body').removeClass('sub');
    cardTab.setEmiPlansCta('emi', 'emiplans');
  },

  /**
   * Validates that the issuer of the offer is same as the selected value
   * @param {string} selectedVal
   *
   * @returns {boolean}
   */
  validateOffers: function (selectedIssuer, callback) {
    let offer = this.getAppliedOffer();
    if (offer && offer.issuer && selectedIssuer !== offer.issuer) {
      return this.showOffersError(callback);
    }
    return true;
  },

  /**
   * Once the bank is selected in the banks list,
   * proceed automatically if some conditions are met.
   */
  proceedAutomaticallyAfterSelectingBank: function () {
    if (this.checkInvalid()) {
      return;
    }

    this.switchTab('emandate');
  },

  checkInvalid: function (parent) {
    if (!parent) {
      parent = this.getActiveForm();
      const payload = this.payload;
      if (payload && payload.method === 'wallet' && !payload.wallet) {
        return $('#wallets').addClass('invalid');
      } else if (payload && payload.method === 'app') {
        // In "Add new card" screen, if we're selecting any application,
        // Card fields maybe invalid, however,  they should be ignored.
        return false;
      }
    }
    let invalids = $(parent).find('.invalid');
    if (invalids && invalids[0]) {
      updateScore('clickOnSubmitWithoutDetails');
      Form.shake();
      let invalidInput =
        $(invalids[0]).find('.input')[0] ||
        $(invalids[0]).find('.input-one-click-checkout')[0];
      $(invalids[0]).find('input[type=checkbox]')[0];
      if (invalidInput) {
        invalidInput.focus();
      } else if ($(invalids[0]).hasClass('selector')) {
        $(invalids[0]).focus();
      }

      let culprit = invalidInput || invalids[0];
      Analytics.track('shake:invalid', {
        data: {
          class: $(culprit).attr('class'),
          id: $(culprit).attr('id'),
        },
      });

      UTILS.each(invalids, function (i, field) {
        $(field).addClass('mature');
      });
      return true;
    }
  },

  getActiveForm: function () {
    let form = this.tab || 'common';
    // TODO: get rid of this
    if (form === 'emi') {
      if (form === 'emi' && this.screen === 'emi') {
        return '#add-emi-container';
      }
      form = 'card';
    }
    if (form === 'gpay') {
      form = 'upi';
    }
    return '#form-' + form;
  },

  getFormData: function () {
    let tab = this.tab;
    if (!preferences) {
      return {};
    }
    let data = HomeScreenStore.getCustomerDetails();

    if (tab) {
      data.method = tab;
      let activeForm = this.getActiveForm();

      if (
        ![
          '#form-upi',
          '#form-card',
          '#form-wallet',
          '#form-emandate',
          '#form-upi_otm',
          '#form-international',
        ].includes(activeForm)
      ) {
        fillData(activeForm, data);
      }

      // Delete all the auth_type-* keys
      UTILS.each(data, function (key) {
        if (key.indexOf('auth_type-') === 0) {
          delete data[key];
        }
      });

      if (this.screen === 'card') {
        if (this.svelteCardTab) {
          Object.assign(data, this.svelteCardTab.getPayload());
        }
        if (tab === 'emi') {
          let emiDuration = EmiStore.getEmiDurationForNewCard();
          if (emiDuration) {
            data.emi_duration = emiDuration;
          }
        }
        if (!data.emi_duration) {
          data.method = 'card';
          delete data.emi_duration;
        }
      }

      if (
        (this.screen === 'upi' || this.screen === 'upi_otm') &&
        this.tab !== 'qr'
      ) {
        /* All tabs should be responsible for their subdata */
        let upiData;

        if (this.screen === 'upi' || this.screen === 'upi_otm') {
          upiData = this.upiTab.getPayload();
        }

        UTILS.each(upiData, function (key, value) {
          data[key] = value;
        });
      }

      // For a QR Payment in 1CC Flow, set the amount.
      if (this.tab === 'qr' && RazorpayHelper.isRedesignV15()) {
        let offer = this.getAppliedOffer();
        let hasDiscount = offer && offer.amount !== offer.original_amount;

        if (this.payload && this.payload.amount) {
          data.amount = this.payload.amount;
        } else if (hasDiscount) {
          data.amount =
            this.get('amount') + storeGetter(discreet.ChargesStore.offerAmount);
        } else {
          data.amount = this.get('amount');
        }
      }

      if (this.screen === 'wallet') {
        /* Wallet tab being responsible for its subdata */
        if (this.walletTab.isAnyWalletSelected()) {
          Object.assign(data, this.walletTab.getPayload());
        }
      }

      if (this.tab === 'emandate') {
        Object.assign(data, this.emandateView.getPayload());
      }

      if (this.tab === 'netbanking') {
        Object.assign(
          data,
          discreet.es6components.getView('netbankingTab').getPayload()
        );
      }
    }

    return data;
  },

  hide: function (confirmedCancel, overlayProps = {}) {
    let self = this;
    if (this.isOpen) {
      if (confirmedCancel !== true && this.r._payment) {
        // confirm close returns a promise which is resolved/rejected as per uder's confirmation to close
        Confirm.confirmClose(overlayProps).then((confirmed) => {
          if (confirmed) {
            if (isQRPaymentCancellable({}, true) === 2) {
              /**
               * Why delay, QR payments hitting with multiple cancel requests
               */
              setTimeout(() => {
                self.hide(confirmed);
              }, 400);
            } else {
              self.back(true);
            }
          }
        });
        return;
      }

      $('#modal-inner').removeClass('shake');
      self.hideOverlayMessage();
      this.modal.hide();
      discreet.stopListeningForBackPresses();
    }
  },

  showLoadError: function (
    text,
    error,
    preventDismissal,
    heading = 'Payment failed'
  ) {
    this.preventErrorDismissal = preventDismissal;
    if (this.headless && this.screen === 'card') {
      return;
    }
    let actionState;
    let loadingState = true;

    let cancelMsg = I18n.format('misc.payment_canceled');

    if (error) {
      if (
        (this.screen === 'upi' || this.screen === 'upi_otm') &&
        (text === cancelMsg || text === discreet.cancelMsg)
      ) {
        if (
          this.payload &&
          (this.payload['_[flow]'] === 'intent' ||
            this.payload.provider === 'google_pay')
        ) {
          return;
        }
        return this.hideErrorMessage();
      }
      actionState = loadingState;
      loadingState = false;
    } else {
      actionState = false;
    }

    if (!text) {
      text = I18n.format('misc.payment_processing');
    }

    if (this.screen === 'otp') {
      if (
        CommonHandlers.hasPaypalOptionInErrorMetadata(this.ajaxErrorMetadata)
      ) {
        return this.commenceOTP(text, undefined, {}, 'paypal', loadingState);
      }
      return this.commenceOTP(text, undefined, {}, actionState, loadingState);
    }

    const isRedesign = RazorpayHelper.isRedesignV15();
    // let content = ''; // for redesign dialog
    if (isRedesign) {
      triggerErrorModal({
        loading: loadingState,
        heading: loadingState ? text : heading,
        content: loadingState ? '' : text,
      });
      return;
    }

    // Break sentences into new lines
    let formattedText = UTILS.escapeHtml(text).replace(/\.\s/g, '.<br/>');
    $('#fd-t').rawHtml(formattedText);
    showOverlay($('#error-message').toggleClass('loading', loadingState));
  },

  commenceOTP: function (
    textView,
    reason,
    templateData,
    action,
    loading,
    headingText
  ) {
    if (typeof loading === 'undefined') {
      loading = true;
    }

    let params = {
      extraProps: {},
    };

    if (reason) {
      params.extraProps.reason = reason;
    }

    this.setScreen('otp', params);

    this.otpView.updateScreen({
      addFunds: false,
    });

    if (!action) {
      setTimeout(
        function () {
          if (this.screen === 'otp' && (this.tab !== 'card' || !this.payload)) {
            Cta.showVerify();
          }
        }.bind(this),
        200
      );
    }

    if (this.screen === 'otp') {
      this.body.removeClass('sub');
      this.otpView.setTextView(textView, templateData);
      this.otpView.updateScreen({
        headingText: headingText,
      });

      this.otpView.updateScreen({
        action: action,
        loading: loading,
      });
    } else {
      let locale = I18n.getCurrentLocale();
      let text = I18n.getOtpScreenTitle(textView, templateData, locale);
      this.showLoadError(text);
    }
  },

  setUpiCancelReasonPicker: function () {
    this.upiCancelReasonPicker = new discreet.UpiCancelReasonPicker({
      target: docUtil.querySelector('#cancel_upi'),
    });
  },

  setNbCancelReasonPicker: function () {
    this.nbCancelReasonPicker = new discreet.NetbankingCancelReasonPicker({
      target: docUtil.querySelector('#error-message'),
    });
  },
  /**
   * Show fees UI if `fee` is missing in payload
   */
  showFeesUi: function () {
    let session = this;
    let data = session.payload;
    let isFeeMissing = !('fee' in data);
    /**
     * Check here if 'fee' is set in payload,
     * If it is present then we have shown the fee breakup to the user,
     * and we have accounted for additional fees,
     * so no changes in payload are required.
     * Otherwise, show the fee breakup.
     */
    if (isFeeMissing) {
      let paymentData = ObjectUtils.clone(this.payload);
      // Create fees route in API doesn't like this.
      delete paymentData.upi_app;

      discreet.showFeeBearer({
        paymentData: paymentData,
        onContinue: function (bearer) {
          // Set the updated amount & fee
          if (!session.payload) {
            session.payload = {};
          }
          session.payload.amount = bearer.amount;
          session.payload.fee = bearer.fee;

          // In case of MCC transaction, BE sends mcc request id, that we need to forward
          if (bearer.mcc_request_id) {
            session.payload.mcc_request_id = bearer.mcc_request_id;
          }

          // Don't redirect to fees route now
          session.feesRedirect = false;
          session.submit();
        },
      });
    }
  },

  closeModal: function (overlayProps = {}) {
    let session = this;

    // If we have navstack populated we need to clear the stack and the respective states
    // with respect to the screen rendered via navstack
    clearStack();
    // Note: As of now EMI screens are rendered via navstack hence clearing only those state
    // Can conditionalise further once more payment methods are migrated to navstack
    selectedBank.set(null);
    selectedPlan.set(null);

    if (session.get('modal.confirm_close')) {
      Confirm.confirmClose().then(function (close) {
        if (close) {
          session.hide();
        }
      });
    } else {
      session.hide(false, overlayProps);
    }
  },

  onOtpSubmit: function () {
    this.otpView.updateScreen({
      truecallerLoginFailed: false,
    });

    if (this.checkInvalid('#form-otp')) {
      return;
    }

    let isWallet = this.payload && this.payload.method === 'wallet';

    Analytics.track('otp:submit', {
      type: AnalyticsTypes.BEHAV,
      data: {
        wallet: isWallet,
      },
    });
    if (isWallet) {
      WalletTracker.OTP_SUBMITTED({
        method: { name: METHODS.WALLET },
        instrument: {
          name: (this.payload && this.payload.wallet) || '',
        },
      });
    }

    let otp =
      storeGetter(discreet.OTPScreenStore.otp) ||
      storeGetter(discreet.OTPScreenStore.digits).join('');

    if (
      otp.length > 0 &&
      (!RazorpayHelper.isOneClickCheckout() ||
        !storeGetter(discreet.OTPScreenStore.isRazorpayOTP) ||
        otp.length === storeGetter(discreet.OTPScreenStore.digits).length)
    ) {
      this.commenceOTP('verifying_otp');

      if (isWallet || this.headless) {
        this.otpView.updateScreen({
          showCtaOneCC: false,
        });
        return this.r.submitOTP(otp);
      }

      let queryParams;
      let callback;

      let isCardlessEmi =
        this.payload && this.payload.method === 'cardless_emi';

      if (!isCardlessEmi && this.tab !== 'upi') {
        const isPayloadIsOfQRFlow = isPayloadIsOfQR(this.payload);
        // card tab only past this
        // card filled by logged out user + remember me
        if (this.payload && !isPayloadIsOfQRFlow) {
          callback = (msg) => {
            if (this.getCurrentCustomer().logged) {
              // OTP verification successful
              OtpService.resetCount('razorpay');
              if (RazorpayHelper.isEmiV2() && this.payload.method === 'emi') {
                handleEmiPaymentV2({
                  payloadData: this.payload,
                });
              } else {
                this.submit();
              }
              let isRedirect = this.get('redirect');
              if (!isRedirect) {
                this.r.emit('payment.resume');
              }
              this.showLoadError();
            } else {
              this.r.emit('payment.error', discreet.error(msg));
              Analytics.track('behav:otp:incorrect', {
                wallet: isWallet,
              });
              this.askOTP(
                this.otpView,
                msg,
                true,
                { phone: getPhone() },
                undefined,
                msg,
                true
              );
              this.updateCustomerInStore();
            }
          };
        } else {
          let self = this;

          if (this.payload) {
            // OTP verification for saving card
            Analytics.track('saved_cards:save:otp:submit');
          } else {
            // OTP verification for accessing saved cards
            Analytics.track('saved_cards:access:otp:submit');
          }

          callback = (msg) => {
            if (self.getCurrentCustomer().logged) {
              // OTP verification successful
              OtpService.resetCount('razorpay');

              self.updateCustomerInStore();
              // if new emi flow redirect to emi page
              if (RazorpayHelper.isEmiV2() && self.tab === 'emi') {
                const screenToSet = 'emi';
                Analytics.track('screen:switch', {
                  data: {
                    from: this.screen || '',
                    to: screenToSet || '',
                  },
                });
                Analytics.setMeta('screen', screenToSet);
                Analytics.setMeta('timeSince.screen', discreet.timer());

                this.screen = screenToSet;
                screenStore.set(screenToSet);
                this.otpView.updateScreen({
                  showCtaOneCC: false,
                });
                makeHidden('.screen.' + shownClass);
                renderEmiOptions();
              } else if (this.isOpen) {
                self.svelteCardTab.showLandingView().then(function () {
                  self.showCardTab();
                  /**
                   * In case p13n from storage we store token_id if we after otp verify select other card in presubmit it pick storage card data
                   */
                  HomeScreenStore.selectedInstrumentId.set(null);
                });
              }
            } else {
              Analytics.track('behav:otp:incorrect', {
                wallet: isWallet,
              });
              this.askOTP(
                this.otpView,
                msg,
                true,
                { phone: getPhone() },
                undefined,
                msg,
                true
              );
              self.updateCustomerInStore();
            }
          };
        }
      }

      let submitPayload = {
        otp: otp,
        email: getEmail(),
      };

      // If new emi flow and tab is emi
      // new flow will take over
      const isEmiFlowForCardless =
        this.payload &&
        this.payload.method === 'cardless_emi' &&
        this.tab === 'emi' &&
        isEmiV2();
      if (isEmiFlowForCardless) {
        submitPayload = {
          ...submitPayload,
          provider: getSelectedBankCode(),
          method: 'cardless_emi',
          payment_id: this.r._payment.payment_id,
        };
        callback = cardlessEmiCallBack;

        this.otpView.updateScreen({
          showCtaOneCC: false,
        });
      } else if (this.tab === 'cardless_emi' || isCardlessEmi) {
        const providerCode = CardlessEmiStore.providerCode;

        submitPayload = Object.assign(submitPayload, {
          provider: providerCode,
          method: 'cardless_emi',
          payment_id: this.r._payment.payment_id,
        });

        callback = function (msg, data) {
          if (msg) {
            this.otpView.updateScreen({
              showCtaOneCC: true,
            });
            this.fetchCardlessEmiPlans({
              incorrect: true,
            });
          } else {
            // OTP verification successful
            OtpService.resetCount('razorpay');

            CardlessEmiStore.plans[providerCode] = data.emi_plans;
            CardlessEmiStore.loanUrls[providerCode] = data.loan_url;
            CardlessEmiStore.ott[providerCode] = data.ott;
            CardlessEmiStore.lenderBranding[providerCode] =
              data.lender_branding_url;
            this.showCardlessEmiPlans();
          }
        };

        this.otpView.updateScreen({
          showCtaOneCC: false,
        });
      }

      if (this.tab === 'upi') {
        callback = (msg) => {
          if (msg) {
            Analytics.track('behav:otp:incorrect');
            this.askOTP(this.otpView, msg, true);
            this.updateCustomerInStore();
          } else {
            discreet.upiTab.render();
            this.setScreen('upi');
          }
        };
      }

      if (this.tab === 'paylater') {
        const providerCode = PayLaterStore.providerCode;

        queryParams = {
          provider: providerCode,
          method: 'paylater',
        };

        callback = function (msg, data) {
          this.otpView.updateScreen({ loading: false });
          $('#body').addClass('sub');
          if (msg) {
            this.askPayLaterOtp('incorrect');
          } else {
            if (data.ott) {
              // OTP verification successful
              OtpService.resetCount('razorpay');

              PayLaterStore.otpVerified = true;
              PayLaterStore.ott[providerCode] = data.ott;
              PayLaterStore.contact = data.contact;
              this.switchTab('paylater');
              this.submitPayLater();
            }
          }
        };
        this.commenceOTP('verifying');
      }

      let phone = '';
      // Since Contact number for emi can be changed
      // we need to get the current emi contact in order to verify cardless otp
      if (isEmiFlowForCardless) {
        phone = getEmiContact();
      }

      this.getCurrentCustomer(phone).submitOTP(
        submitPayload,
        callback.bind(this),
        queryParams
      );
    } else {
      updateScore('clickOnSubmitWithoutDetails');
      Form.shake();
    }
  },

  getCurrentCustomer: function (phone) {
    return this.getCustomer(phone || getPhone());
  },

  clearRequest: function (extra) {
    if (this.r._payment) {
      /**
       * When user clicks back, if there is a payment in progress
       * we auto-cancel it.
       * Hence we need a check for QR V2 payments, we won;t show any alert yet user can go out
       * And we shouldn't mark the payment cancelled
       */
      if (!isQRPaymentCancellable(extra)) {
        return;
      }
      this.hideOverlayMessage();
      this.r.emit('payment.cancel', extra);
    }
    this.hideTimer();
    if (this.payload && this.payload.method === 'cardless_emi') {
      this.resetCardlessEmiStoreForProvider(this.payload.provider);
    }

    this.isResumedPayment = false;
    /**
     * lastPayloadValue contain payload data used before reset this.payload to null.
     * This is consumed by postPaymentScreen in emailless checkout flow
     */
    this.lastPayloadValue = this.payload;
    this.payload = null;
    this.powerwallet = false;

    Analytics.removeMeta('doneByInstrument');
    Analytics.removeMeta('instrumentMeta');
    Analytics.removeMeta('doneByP13n');

    let params = {};
    params[Constants.UPI_POLL_URL] = '';
    params[Constants.PENDING_PAYMENT_TS] = '0';
    if (!this.activity_recreated) {
      this.setParamsInStorage(params);
    }

    UTILS.abortAjax(this.ajax);

    clearTimeout(this.requestTimeout);
    this.requestTimeout = null;
  },

  /**
   * Removes items from the CardlessEmiStore
   * corresponding to the given provider.
   * @param {string} provider
   */
  resetCardlessEmiStoreForProvider: function (provider) {
    if (!provider) {
      return;
    }

    ObjectUtils.loop(CardlessEmiStore, function (value) {
      delete value[provider];
    });
  },

  /**
   * Attempts a payment
   * @param {Event} [e]
   * @param {Object} [payload] Overridden payload
   */
  preSubmit: function (e, payload) {
    /**
     * If pyament is controlled via navstack i.e for new EMI flow
     * shift the control to handle EmiPayment
     */
    if (
      !controlledViaSession() &&
      this.tab === 'emi' &&
      (this.screen === 'card' || this.screen === 'bajaj') &&
      RazorpayHelper.isEmiV2()
    ) {
      const bank = getSelectedEmiBank();
      // enable for dev-testing
      // bank.downtimeConfig = {
      //   severe: 'low',
      //   downtimeInstrument: bank.code,
      // };
      initiateEmiFlow(bank, selectedBank.set.bind(selectedBank), () => {
        handleEmiPaymentV2({
          action: 'card',
        });
      });
      return;
    }
    if (this.tab === 'home-1cc') {
      return;
    }
    if (e instanceof Event) {
      e.preventDefault();
      e.stopPropagation();
    }
    /**
     * Required in both submit and pre-submit as someareas we directly call submit but presubmit in most cases
     */
    if (avoidSessionSubmit()) {
      return;
    }

    // let <CTA> handle click, if present
    // used for keyboard submit in payout screen
    let cta = docUtil.querySelector('#footer-cta + span');
    if (cta && e && e.type === 'submit') {
      return cta.click();
    }
    let screen = this.screen;
    let tab = this.tab;
    let selectedInstrument = this.getSelectedPaymentInstrument();

    /**
     * The CTA for home screen is visible only on the new design. If it was
     * clicked, switch to the new payment methods screen.
     */
    if (!screen) {
      if (this.checkCommonValidAndTrackIfInvalid()) {
        // switch to methods tab
        if (this.homeTab?.onDetailsScreen()) {
          Analytics.track('contact_details:cta_click', {
            type: AnalyticsTypes.BEHAV,
          });
          MiscTracker.CONTACT_DETAILS_PROCEED_CLICK();
          if (this.homeTab.shouldGoNext()) {
            this.homeTab.next();
            return discreet.CRED.checkCREDEligibilityForUpdatedContact();
          }
        }
      } else {
        this.offers && this.offers.clearOffer();
        return;
      }
    }

    if (screen === 'otp') {
      return this.onOtpSubmit();
    }

    this.refresh();
    let data = payload;

    if (!data) {
      data = this.getPayload();
    }

    this.payload = data;

    if (data.auth_type && data.auth_type === 'c3ds') {
      /**
       * Deleting this from data manually because c3ds is just for Checkout,
       * API takes 3DS, which is the default anyway.
       */
      delete data.auth_type;
    }

    /**
     * For Paper Nach, we need to send auth_type=physical
     * for now.
     */
    if (data.method === 'nach' && !data.auth_type) {
      data.auth_type = 'physical';
    }

    if (data.partial_payment) {
      delete data.partial_payment;
    }

    let AVSRequired = false;
    let AVSRequiredForEntity = null;
    let AVSMap = discreet.storeGetter(CardScreenStore.AVSScreenMap) || {};
    let AVSData =
      this.svelteCardTab?.getAVSPayload?.(selectedInstrument || {}) || {};
    let isOnAVSScreen = AVSData.isOnAVSScreen;
    let isAVSScreenFromHomeScreen = AVSData.isAVSScreenFromHomeScreen;

    // NVS (Name address Verification System)
    let { NVSRequired, isNVSFormHomeScreenView } = getInternationalTabData();
    let isOnNVSForm = isInternationalAVSView();

    let tpv = MethodStore.getTPV();
    if (tpv && tpv.invalid && this.homeTab && this.homeTab.validateTPVOrder) {
      return this.homeTab.validateTPVOrder(tpv, true);
    }

    if (tpv) {
      if (!this.checkCommonValidAndTrackIfInvalid()) {
        // TODO check multi TPV with UPI prefill
        return;
      }
      /**
       * This logic gets executed only if TPV order is valid
       * tpv.method can be undefined if both UPI & NB enabled
       * - for this case we will be auto-selecting NB in radio list in home screen defaults for TPV
       * - if user directly clicks pay in home screen, data.method will be undefined and
       * - getSelectedTPVOrderMethod returns the approriate method chosen
       */

      data.method = data.method || this.homeTab.getSelectedTPVOrderMethod();
      data.bank = tpv.code;

      if (data.method === 'upi') {
        if (tab !== 'upi') {
          return this.switchTab('upi');
        }
        if (this.checkInvalid('#form-upi input:checked + label')) {
          return;
        }
      }
      // from home page to AVS screen transition set screen = card
    } else if (
      screen &&
      !isAVSScreenFromHomeScreen &&
      !isNVSFormHomeScreenView
    ) {
      if (screen === 'card') {
        // AVS check
        const isSavedCardScreen = this.svelteCardTab.isOnSavedCardsScreen();
        const cardIin = discreet.storeGetter(CardScreenStore.cardIin);
        const selectedCard = discreet.storeGetter(CardScreenStore.selectedCard);
        /**
         * if new card is added then get cardIin
         * else if saved card selected on cards screen then get tokenId
         */
        AVSRequiredForEntity = discreet.CardHelper.getEntityForAVSMap({
          currentView: isSavedCardScreen ? CardViews.SAVED_CARDS : '',
          iin: cardIin,
          selectedCard: selectedCard,
        });
        AVSRequired = AVSRequiredForEntity
          ? Boolean(AVSMap[AVSRequiredForEntity])
          : false;
        // get card number & token id

        if (data.provider) {
          // Validate any additional input (like contact).
          if (this.checkInvalid('.selected.instrument')) {
            return;
          }
          // Set method as "app"
          // By default the method is set to whatever screen you're on. -_-
          data.method = 'app';
          // We don't want to validate card fields if we're paying via application.
          // Do nothing.
        } else if (!isSavedCardScreen) {
          // TODO: simplify conditions
          // Do not proceed with amex cards if amex is disabled for merchant
          // also without this, cardsaving is triggered before API returning unsupported card error
          let cardType = discreet.storeGetter(CardScreenStore.cardType);
          if (!MethodStore.isAMEXEnabled() && cardType === 'amex') {
            return this.showLoadError(
              I18n.format('card.card_number_help_amex'),
              true
            );
          }
        } else if (!data['card[cvv]']) {
          let checkedCard = $('.saved-card.checked');

          /**
           * When CVV is missing, allow to go ahead only if:
           * 1. Card is a not Maestro card
           * OR
           * 2. tab=emi and saved card supports emi and emi duration is not selected
           */
          if (
            !(
              checkedCard.$('.cardtype').attr('cardtype') === 'maestro' ||
              (checkedCard.attr('emi') &&
                this.tab === 'emi' &&
                !data.emi_duration)
            )
          ) {
            // no saved card was selected
            Analytics.track('shake:saved-cvv');
            updateScore('clickOnSubmitWithoutDetails');
            Form.shake();
            return $('.checked .saved-cvv input').focus();
          }
        }

        if (screen === 'card') {
          if (tab === 'emi') {
            /**
             * For when EMI duration is missing.
             */

            /**
             * If this is a new card and no EMI plans are available,
             * this is a validation error.
             */
            if (!data.token && !this.emiPlansForNewCard) {
              Analytics.track('shake:no-emi-plans');
              updateScore('clickOnSubmitWithoutDetails');
              Form.shake();
              return $('#card_number').focus();
            }

            if (this.checkInvalid()) {
              return;
            }

            if (!data.emi_duration) {
              /**
               * If this is a saved ard and no EMI duration is selected,
               * show the EMI plans.
               */
              if (data.token) {
                this.showEmiPlansForSavedCard({
                  currentTarget: $(
                    '.saved-card[token="' + data.token + '"] .emi-plans-trigger'
                  )[0],
                });
              } else {
                /**
                 * If this is a new card and no EMI duration is selected,
                 * show the EMI plans.
                 */
                this.showEmiPlansForNewCard({
                  delegateTarget: $(
                    '#add-card-container .emi-plans-trigger'
                  )[0],
                });
              }

              return;
            }

            // Set method explicitly.
            data.method = 'emi';
          } else {
            // This is not the EMI tab, delete duration if it exists.
            delete data.emi_duration;
          }
        }
        let forcedOffer = discreet.Offers.getForcedOffer();
        let offer = this.getAppliedOffer();
        if (forcedOffer && offer) {
          let isCardOfferValid = discreet.storeGetter(
            discreet.OffersStore.isCardValidForOffer
          );
          // check if its valid offer or not
          if (!isCardOfferValid) {
            Form.shake();
            // if saved card screen
            $('.checked .saved-cvv input').focus();
            return $('#card_number').focus();
          }
        }
      } else if (/^emiplans/.test(screen)) {
        if (!(data.method === 'cardless_emi' && data.emi_duration)) {
          return this.emiPlansView.submit();
        }
      }

      // perform the actual validation
      if (screen === 'upi' || screen === 'upi_otm') {
        // Event triggered when user enters UPI ID and clicks submit
        Analytics.track('checkoutUpiVpaSubmitted');
        let formSelector = '#user-new-vpa-container-' + screen;

        if (data['_[flow]'] === 'directpay') {
          if (data.upi_provider === 'google_pay') {
            formSelector = '#gpay-phone';
          }
        }

        if (this.checkInvalid(formSelector)) {
          return;
        }
      } else if (this.checkInvalid()) {
        return;
      }

      //
      // 1. If Payment is Recurring &&
      // 2. If on add card screen and save card checkbox is not checked
      // 3. If on saved card screen and consent is not already taken for saved card && checkbox is also not checked
      // ==> Shake the form and show tooltip on checkbox
      let isRecurring = RazorpayHelper.isRecurring();
      let isSavedCardScreen = this.svelteCardTab.isOnSavedCardsScreen();

      // For saved card screen consent is maintained elsewhere
      let rememberCardCheck = discreet.storeGetter(
        isSavedCardScreen
          ? CardScreenStore.userConsentForTokenization
          : CardScreenStore.remember
      );

      let selectedCard = discreet.storeGetter(CardScreenStore.selectedCard);
      let selectedCardConsent = selectedCard && selectedCard.consent_taken;
      let isSavedCardScreenAndConsentAlreadyTaken =
        isSavedCardScreen && selectedCardConsent;

      if (
        isRecurring &&
        !rememberCardCheck &&
        !isSavedCardScreenAndConsentAlreadyTaken &&
        this.tab === 'card'
      ) {
        let showSavedCardTooltip = CardScreenStore.showSavedCardTooltip;
        Form.shake();
        showSavedCardTooltip.update(function () {
          return true;
        });

        return;
      }
    } else if (selectedInstrument) {
      if (
        selectedInstrument.method === 'card' &&
        isOnAVSScreen &&
        this.checkInvalid('#form-card')
      ) {
        return;
      }

      if (!isOnAVSScreen && !this.checkCommonValidAndTrackIfInvalid()) {
        return;
      }

      if (selectedInstrument.method === 'card' && !isOnAVSScreen) {
        // in AVS screen there is no cvv input
        AVSRequiredForEntity = selectedInstrument.token_id;
        AVSRequired = Boolean(AVSMap[AVSRequiredForEntity]);
        /*
         * Add cvv to data from the currently selected instrument
         */
        let instrumentInDom = _El.closest(
          docUtil.querySelector(
            '.home-methods input[value="' + selectedInstrument.id + '"]'
          ),
          '.instrument'
        );
        let cvvInput = instrumentInDom.querySelector('.cvv-input');

        if (cvvInput) {
          if (cvvInput.value.length === cvvInput.maxLength) {
            data['card[cvv]'] = cvvInput.value;
          } else {
            cvvInput.focus();
            updateScore('clickOnSubmitWithoutDetails');
            return Form.shake();
          }
        }
      } else if (selectedInstrument.method === 'cod') {
        // Show order summary when payment method=cod
        discreet.OneClickCheckoutInterface.showOrderSummary();
        return;
      }

      // check for NVS form validations
      if (
        isOnNVSForm &&
        isNVSFormHomeScreenView &&
        this.checkInvalid('#form-international')
      ) {
        return;
      }
      if (
        !isOnNVSForm &&
        discreet.isInternationalInPreferredInstrument(selectedInstrument)
      ) {
        NVSRequired = updateInternationalProvider(
          selectedInstrument.providers[0]
        );
        this.switchTab(INTERNATIONAL_TAB_NAME, {
          directlyToNVS: NVSRequired,
        });
      }

      if (discreet.IntlBankTransferTab.preferredMethod(selectedInstrument)) {
        this.switchTab(discreet.IntlBankTransferTab.TAB_NAME, {
          directlyToDetails: true,
        });
        return;
      }
    } else if (data.method === 'paypal') {
      // Let method=paypal payments go through directly
    } else {
      return;
    }

    if (
      discreet.storeGetter(CardScreenStore.internationalCurrencyCalloutNeeded)
    ) {
      showConversionChargesCallout();
      return;
    }

    /** Ask popup to show benefits of save cards and get confirmation to save or not
     * for card flow will ask when user didn't give consent to save card
     * will not ask for international card as we don't tokenized them in backend
     */
    const isSavedCardScreen = this.svelteCardTab?.isOnSavedCardsScreen();
    if (
      data.method === 'card' &&
      showTokenisationBenefitModal() &&
      !AVSRequired
    ) {
      if (this.tokenisationPopupShown) {
        this.tokenisationPopupShown = false;
      } else {
        const thisSession = this;
        openConsentOverlay(isSavedCardScreen).then(function (saved) {
          if (!saved) {
            thisSession.tokenisationPopupShown = true;
          }
          thisSession.preSubmit();
        });
        return;
      }
    }

    payload = this.payload;
    // checking if the method selected is from the preferred method or from the method screen as this.payload is null in preferred methods
    if (
      selectedInstrument &&
      selectedInstrument.id &&
      selectedInstrument.id.indexOf('rzp.cluster') === -1 &&
      !payload.downtimeSeverity
    ) {
      payload = selectedInstrument;
    }
    this.downtimeSeverity = payload.downtimeSeverity;
    let downtimeInstrument = discreet.downtimeUtils.checkForDowntime(payload);
    if (!isOnAVSScreen) {
      CardScreenStore.isAVSEnabledForEntity.set(AVSRequiredForEntity);
    }

    // meta for tracking AVS
    if (AVSRequired || isOnAVSScreen) {
      Analytics.setMeta('avs', true);
    } else {
      Analytics.removeMeta('avs');
    }
    // meta for tracking NVS
    if (NVSRequired || isOnNVSForm) {
      Analytics.setMeta('nvs', true);
    } else {
      Analytics.removeMeta('nvs');
    }
    if (!isOnAVSScreen && AVSRequired) {
      let directlyToAVS = false;
      if (screen !== 'card') {
        // change to card screen
        this.showCardTab();
        directlyToAVS = true;
      }
      // verify AVS needed
      this.svelteCardTab.showAVSView(directlyToAVS);
    } else if (!isOnNVSForm && NVSRequired) {
      if (screen !== INTERNATIONAL_TAB_NAME) {
        this.setScreen(INTERNATIONAL_TAB_NAME);
      }
      showInternationalAVS(screen !== INTERNATIONAL_TAB_NAME);
    } else if (!downtimeInstrument) {
      this.submit();
    } else {
      discreet.downtimeUtils.showDowntimeAlert(downtimeInstrument);
    }
  },

  getSelectedPaymentInstrument: function () {
    return storeGetter(HomeScreenStore.selectedInstrument);
  },

  verifyVpaAndContinue: function (data) {
    let self = this;
    self.showLoadError(I18n.format('upi.verifying_vpa_info'), false, true);
    $('#overlay-close').hide();
    UPITracker.VPA_VERIFICATION_STARTED();

    RazorpayHelper.verifyVPA(data.vpa)
      .then(function (data) {
        $('#overlay-close').show();
        setTimeout(function () {
          closeErrorModal();
          hideOverlay($('#error-message'));
          if (self.payload) {
            self.submit({
              vpaVerified: true,
            });
          }
        }, 200);
        UPITracker.VPA_VERIFICATION_ENDED({
          response: data,
        });
      })
      .catch(function (vpaValidationError) {
        let errorDescription = ObjectUtils.get(
          vpaValidationError,
          'error.description'
        );
        UPITracker.VPA_VERIFICATION_ENDED({
          response: vpaValidationError?.error,
        });
        let errorMessage = errorDescription
          ? I18n.translateErrorDescription(
              errorDescription,
              I18n.getCurrentLocale()
            )
          : I18n.format('upi.invalid_vpa_default_message');

        self.showLoadError(errorMessage, true, false, 'Invalid VPA');
      });
  },

  submit: function (props) {
    /**
     * if upi-payment module has any downtime or has to wait for user to click on Pay button,
     * it will set the data in respective handlers
     * `avoidSessionSubmit` will return true in such cases, explaining that
     * to avoid regular pre-submit and submit flows from sessionjs
     * Required in both submit and pre-submit as someareas we directly call submit but presubmit in most cases
     */
    if (avoidSessionSubmit()) {
      return;
    }

    /**
     * if emi-payment module has any downtime,
     * it will set the data in respective handlers
     * `avoidSessionSubmit` will return true in such cases, explaining that
     * to avoid regular pre-submit and submit flows from sessionjs
     * Required in both submit and pre-submit as someareas we directly call submit but presubmit in most cases
     */
    if (
      RazorpayHelper.isEmiV2() &&
      this.tab === 'emi' &&
      avoidSubmitViaSession()
    ) {
      return;
    }
    let locale = I18n.getCurrentLocale();
    if (!props) {
      props = {};
    }
    let vpaVerified = props.vpaVerified;
    let data = this.payload;
    // deleting downtimeSeverity & downtimeInstrument from data & saving downtimeSeverity for analytics
    if (data) {
      delete data.downtimeSeverity;
      delete data.downtimeInstrument;
    }

    let goto_payment = '#error-message .link';
    let redirectableMethods = ['card', 'netbanking', 'wallet'];
    if (
      this.get('redirect') &&
      redirectableMethods.includes(this.payload.method)
    ) {
      $(goto_payment).hide();
    }

    if (this.data && this.data.method === 'netbanking' && !this.data.bank) {
      Analytics.track('netbanking:bank:empty', {
        type: AnalyticsTypes.DEBUG,
      });
    }

    // [ANALYTICS]
    if (data && data.method === 'upi') {
      trackUpiIntentInstrumentPaymentAttempted(
        discreet.storeGetter(UpiScreenStore.intentVpaPrefilledFromPreferences)
      );
    }

    if (this.r._payment) {
      if (isQRPaymentCancellable({}, true) === 2) {
        /**
         * intended empty if block as the cancel happens within above function and flow has to come out of this payment
         */
        this.r._payment.off();
        this.r._payment.clear();
      } else if (data.method === 'cardless_emi') {
        /**
         * For Cardless EMI, payments are created at the first step,
         * before the user gets to select a plan.
         * Thus, we would need to submit again after the
         * user has created a plan, even though the payment
         * is already created.
         *
         * This does not happen for any other method.
         */
        data.payment_id = this.r._payment.payment_id;

        /**
         * If emi_duration is present, this is the final
         * payment submit request.
         * Clear existing payments.
         * Note: If any QR payment is active, by this time, it was cancelled, hence no errors on other payments
         */
        if (data.emi_duration) {
          this.r._payment.off();
          this.r._payment.clear();
        }
      } else {
        return;
      }
    }

    let that = this;

    let shouldContinue = true;

    if (this.tab === 'nach') {
      shouldContinue = this.nachScreen.shouldSubmit();
    }

    if (this.tab === 'upi') {
      shouldContinue = this.upiTab.shouldSubmit();
      if (!shouldContinue) {
        this.upiTab.updateStep();
      }
    }

    if (!shouldContinue) {
      return;
    }

    let session = this;
    let request = {
      feesRedirect: preferences.fee_bearer && !('fee' in data),
      optional: RazorpayHelper.getOptionalObject(),
      external: {},
      paused: this.get().paused,
      downtimeSeverity: this.downtimeSeverity,
    };

    let session_options = this.get();
    if (session_options.force_terminal_id) {
      data.force_terminal_id = session_options.force_terminal_id;
    }
    if (this.tab === 'emandate' && RazorpayHelper.isASubscription('emandate')) {
      // recurring token
      data.recurring_token =
        preferences.subscription && preferences.subscription.recurring_token;
      data.amount = 0;
    }

    let selectedInstrument = this.getSelectedPaymentInstrument();

    let AVSData =
      this.svelteCardTab?.getAVSPayload?.(selectedInstrument || {}) || {};
    // if AVS is on then screen is set to card but for saved card from home screen requires processing like home screen
    let isAVSScreenFromHomeScreen = AVSData.isAVSScreenFromHomeScreen;

    // AVS check
    let AVSMap = discreet.storeGetter(CardScreenStore.AVSScreenMap) || {};
    let selectedCard = discreet.storeGetter(CardScreenStore.selectedCard);
    let avsEntity = storeGetter(CardScreenStore.isAVSEnabledForEntity);

    let AVSRequired = avsEntity ? Boolean(AVSMap[avsEntity]) : false;

    let {
      selectedInternationalProvider,
      isNVSFormHomeScreenView,
      NVSRequired,
      NVSFormData,
    } = getInternationalTabData();
    let isOnNVSForm = isInternationalAVSView();
    /**
     * If user selects the card from p13n user will be auto-redirected to saved cards screen
     * And in both cases i.e, p13n card selection and saved card selection both will have
     * isSavedCardScreen:true and selectedInstrumnet.method=card.
     *
     * if card is selected from p13n then
     * isSavedCardScreen:true,
     * selectedCard:null,
     * tokenId:null,
     * selectedInstrument: { method: 'card', token_id:XXXXX, consent_taken }
     *
     * if selected from savedCards Screen then
     * isSavedCardScreen:true,
     * selectedCard:{ consent_taken, id: //here is the actual token_id , and tokenisation status(consent_taken) will be available here },
     * selectedInstrument: { method: 'card', token_id:undefined }
     * tokenId: XXXXX,
     *
     * since consent_taken param from token item is required to add consent to payload,
     */
    let isSavedCardScreen = this.svelteCardTab.isOnSavedCardsScreen();
    let isCardRelatedPayment =
      isSavedCardScreen && (data.method === 'card' || data['card[cvv]']);
    let addTokenizationConsentToPayload = false;
    // when card is selected from saved card screen
    let consentPendingForSelectedCardInSavedCardScreen =
      selectedCard && !selectedCard.consent_taken;
    // when card is selected from p13n block
    let consentPendingForSelectedCardInP13n =
      selectedInstrument &&
      selectedCard === null &&
      !selectedInstrument.consent_taken;
    if (
      isCardRelatedPayment &&
      (consentPendingForSelectedCardInSavedCardScreen ||
        consentPendingForSelectedCardInP13n)
    ) {
      addTokenizationConsentToPayload = true;
      if (this.screen) {
        // other than homescreen/p13n block
        // home screen case is handled little lower to this block
        data.user_consent_for_tokenisation = Number(
          discreet.storeGetter(CardScreenStore.userConsentForTokenization)
        );
      }
    }

    if (!this.screen || isAVSScreenFromHomeScreen || isNVSFormHomeScreenView) {
      if (selectedInstrument) {
        data = Instruments.addInstrumentToPaymentData(
          selectedInstrument,
          data,
          this.getCustomer(getPhone())
        );

        selectedInternationalProvider =
          this.screen === INTERNATIONAL_TAB_NAME && isNVSFormHomeScreenView
            ? data.provider
            : null;

        /** This logic is intended for cards tokenization feature and
         * can be removed after 31st December 2021 once whole rzp saved cards
         * are undergoing tokenization by default
         **/
        let user_consent_for_tokenisation = discreet.storeGetter(
          CardScreenStore.userConsentForTokenization
        );
        if (
          data.method === 'card' &&
          data.token &&
          addTokenizationConsentToPayload
        ) {
          data.user_consent_for_tokenisation = Number(
            user_consent_for_tokenisation
          );
        }
        this.payload = data;
        Analytics.setMeta('doneByInstrument', true);
        Analytics.setMeta(
          'instrumentMeta',
          discreet.getInstrumentMeta(selectedInstrument)
        );
        if (ObjectUtils.get(selectedInstrument, 'meta.preferred')) {
          /**
           * P13N is on home

           */
          BackStore = {
            tab: '',
            screen: '',
          };
          Analytics.setMeta('doneByP13n', true);
        }

        if (
          selectedInstrument._ungrouped &&
          selectedInstrument._ungrouped.length &&
          selectedInstrument._ungrouped[0].flow === 'qr' &&
          !BackStore
        ) {
          //  If triggered from custom config, back should take the user to L0
          BackStore = {
            tab: '',
            screen: '',
          };
        }
        switch (selectedInstrument.method) {
          case 'card':
          case 'emi': {
            this.switchTab(selectedInstrument.method);
            break;
          }

          case 'upi': {
            /**
             * UPI QR is a built on Checkout like a method in itself with method=upi and flow=qr.
             * And the payment happens from within the tab.
             * So, let's switch to it instead of continuing from here.
             */
            if (selectedInstrument._ungrouped[0].flow === 'qr') {
              this.switchTab('qr');
              return;
            }
            break;
          }

          case 'cardless_emi': {
            // If new emi flow is enabled and user has clicked on provider cardless config block
            // if it's a bank cardless provider for eg. hdfc, kotak
            // or if selected provider is cardless provider like early salary or hcin
            // redirect the user to tabs screen to check eligibility and show plans
            // else continue with payment
            const selectedProvider = selectedInstrument._ungrouped[0].provider;
            if (RazorpayHelper.isEmiV2()) {
              // if the provider is bank cardless provider
              // or if its native cardless provider
              if (
                !providersToAvoid.includes(selectedProvider) ||
                cardlessTabProviders.includes(selectedProvider)
              ) {
                session.switchTab('emi');
                screenStore.set('emiPlans');
                session.screen = 'emiPlans';
                selectedBank.set({
                  code: selectedProvider,
                  isCardless: true,
                });

                HomeScreenStore.selectedInstrumentId.set(selectedInstrument.id);

                pushStack({
                  component: EmiTabsScreen,
                  props: {
                    currentMethod: selectedInstrument,
                  },
                });
                return;
              }
              // if the provider is redirect provider like zestmoney, walnut
              // we need to initiate the payment
              handleEmiPaymentV2({
                action: 'cardless',
                payloadData: {
                  provider: selectedProvider,
                },
              });
              return;
            }
            session.selectCardlessEmiProvider(selectedProvider);

            break;
          }

          case 'paylater': {
            session.selectPayLaterProvider(
              selectedInstrument._ungrouped[0].provider
            );

            break;
          }

          case 'app': {
            // TODO: Check if it's possible to move this to instruments-config
            if (selectedInstrument._ungrouped[0].provider === 'cred') {
              Object.assign(this.payload, MethodStore.getPayloadForCRED());

              if (RazorpayHelper.isContactOptional()) {
                // For contact optional case, we ask for contact separately
                // which is present in proxyPhone.
                this.payload.contact = getProxyPhone();
              }
            }
          }
        }
      }
    }

    if (data?.method === 'wallet') {
      /**
       * Wallets might need to go through intent flow too
       * TODO: Add a feature check here
       */
      let shouldTurnWalletToIntent = discreet.Wallet.shouldTurnWalletToIntent(
        data.wallet,
        NativeStore.getUPIIntentApps().filtered
      );

      if (shouldTurnWalletToIntent) {
        data.upi_app = discreet.Wallet.getPackageNameForWallet(data.wallet);
      }
    }

    // For these conditions use google pay card + upi merged flow,
    // so make google pay intent call same as app so that
    // only one thing is managed from here on
    if (
      data.method === 'upi' &&
      data.upi_app === UPIUtils.GOOGLE_PAY_PACKAGE_NAME &&
      this.hasGooglePaySdk &&
      MethodStore.isGpayMergedFlowEnabled() &&
      (this.googlePayWrapperVersion === '2' ||
        this.googlePayWrapperVersion === 'both')
    ) {
      data.method = 'app';
      data.provider = 'google_pay';

      delete data.upi;
      delete data.upi_app;
      delete data['_[flow]'];
    }

    // For these condition use google pay upi half screen flow,
    // we are doing so many conditions because we want to
    // have back support for upi half screen flow in
    // multiple scenarios
    if (
      data.method === 'upi' &&
      data.upi_app === UPIUtils.GOOGLE_PAY_PACKAGE_NAME &&
      this.hasGooglePaySdk &&
      (this.googlePayWrapperVersion === '1' ||
        (this.googlePayWrapperVersion === 'both' &&
          !MethodStore.isGpayMergedFlowEnabled()))
    ) {
      request.external.gpay = true;
      request['_[flow]'] = 'intent';
    }

    // This is for Google pay card + upi merged flow, so this will
    // always happen via external google pay sdk. Payment started
    // from card screen will always have this method and provider
    // and we are converting upi payment to merged flow and
    // updating method to `app` and provider to `google_pay`
    if (
      this.hasGooglePaySdk &&
      data.method === 'app' &&
      data.provider === 'google_pay'
    ) {
      request.external.gpay = true;
    }

    if (data.method === 'paypal') {
      data.method = 'wallet';
      data.wallet = 'paypal';
    }
    if (RazorpayHelper.isAddressEnabled()) {
      let notes = (data.notes = ObjectUtils.clone(this.get('notes')) || {});
      // Add address
      notes.address = storeGetter(HomeScreenStore.address);
      notes.pincode = storeGetter(HomeScreenStore.pincode);
      notes.state = storeGetter(HomeScreenStore.state);

      if (Object.keys(notes).length > 15) {
        delete notes.pincode;
        delete notes.state;
        notes.address +=
          ', ' + Constants.STATES[notes.state] + ' - ' + notes.pincode;
      }
    }

    // If there's a package name, the flow is intent.
    if (data.upi_app) {
      data['_[flow]'] = 'intent';
      data['_[app]'] = data.upi_app;
    }

    if (
      data.method === 'upi' &&
      data['_[flow]'] === 'intent' &&
      WebPaymentsApi.appsThatSupportWebPayments.find(function (app) {
        return app.package_name === data.upi_app;
      }) &&
      WebPaymentsApi.isWebPaymentsApiAvailable(data.upi_app)
    ) {
      request.gpay = true;
    }

    // added rewardIds to the create payment request
    let reward = storeGetter(rewardsStore);
    if (reward && reward.reward_id && !RazorpayHelper.isEmailOptional()) {
      data.reward_ids = [reward.reward_id];
    }

    let appliedOffer = this.getAppliedOffer();
    if (appliedOffer && (!this.offers || this.offers.shouldSendOfferToApi())) {
      if (appliedOffer.type !== 'read_only') {
        data.offer_id = appliedOffer.id;
        this.r.display_amount = RazorpayHelper.isOneClickCheckout()
          ? this.get('amount')
          : appliedOffer.amount;
        updateScore('affordability_offers');
        Analytics.track('offers:applied_with_payment', {
          data: appliedOffer,
        });
      }
    } else {
      delete this.r.display_amount;
      let selectedPlan = this.emiPlansView.selectedPlan;
      if (data.emi_duration && selectedPlan && selectedPlan.offer_id) {
        data.offer_id = selectedPlan.offer_id;
      }
    }

    if (data.method === 'cardless_emi') {
      if (data.provider === 'flexmoney') {
        delete data.ott;
      }

      if (data.payment_id) {
        if (data.contact && !data.emi_duration) {
          this.showCardlessEmiPlans();
          return;
        }

        /**
         * If contact is optional, we want to open a popup and take ott and emi_duration there.
         */
        if (!data.contact) {
          delete data.ott;
          delete data.emi_duration;
        }
      } else {
        delete data.ott;
        delete data.emi_duration;
      }

      this.r.on('payment.process', function (paymentData) {
        let request = paymentData.request;
        let response = paymentData.response;

        let content = request.content;
        let method = content && content.method;
        let provider = content && content.provider;
        let emi_duration = content && content.emi_duration;

        // Abort if not Cardless EMI
        if (method !== 'cardless_emi') {
          return;
        }

        // Handle receiving emi_plans in the pilot payment create request
        if (response.emi_plans && response.emi_plans[provider]) {
          CardlessEmiStore.plans[provider] = response.emi_plans[provider];

          CardlessEmiStore.lenderBranding[provider] =
            response.lender_branding_url;
        }

        // Store the Resend URL
        if (response.resend_url) {
          // Init empty store if one doesn't exist
          if (!CardlessEmiStore.urls[provider]) {
            CardlessEmiStore.urls[provider] = {};
          }

          CardlessEmiStore.urls[provider].resend_otp = response.resend_url;
        }

        // Increase OTP sent count
        OtpService.markOtpSent('razorpay');

        if (!emi_duration) {
          session.hideOverlayMessage();
          return session.showCardlessEmiPlans();
        }
      });
    }

    if (!data.contact) {
      delete data.contact;
    }

    if (data.provider === 'epaylater') {
      if (data.contact) {
        if (!data.ott) {
          this.submitPayLater();
          return;
        }
        // If contact & ott are available, then this is the final submit() call,
        // If the contact doesn't start with +91, then make it.
        if (!data.contact.match(/^\+91/)) {
          data.contact = '+91' + data.contact;
        }
      } else {
        delete data.contact;
        delete data.ott;
      }
    }

    /* VPA verification */
    if (data.vpa && !vpaVerified) {
      return this.verifyVpaAndContinue(data);
    }

    if (
      data.method === INTERNATIONAL_TAB_NAME &&
      selectedInternationalProvider
    ) {
      data.provider = selectedInternationalProvider;
    }

    // for 1cc sending gc_used property on submit analytics event
    if (RazorpayHelper.isOneClickCheckout()) {
      data.gc_used = !!discreet.storeGetter(totalAppliedGCAmt);
    }

    // for paypal and trustly dcc enable is not required
    if (
      discreet.storeGetter(CardScreenStore.currencyRequestId) &&
      ((data.method === 'card' && RazorpayHelper.isDCCEnabled()) ||
        (data.method === 'wallet' && data.wallet === 'paypal') ||
        (data.method === INTERNATIONAL_TAB_NAME &&
          data.provider === selectedInternationalProvider))
    ) {
      data.currency_request_id = discreet.storeGetter(
        CardScreenStore.currencyRequestId
      );
      data.dcc_currency = discreet.storeGetter(CardScreenStore.dccCurrency);
      data.default_dcc_currency = discreet.storeGetter(
        CardScreenStore.defaultDCCCurrency
      );

      // These are undefined/empty if the user uses an Indian card
      if (!data.currency_request_id) {
        delete data.currency_request_id;
        delete data.dcc_currency;
        delete data.default_dcc_currency;
      }
    }

    /**
     * For AVS if method is card && currency is not INR i.e. DCC or MCC flow enabled
     */
    if (data.method === 'card' && AVSRequired) {
      // AVS
      AVSData = discreet.storeGetter(CardScreenStore.AVSBillingAddress) || {};
      // AVS will submit only on AVS screen
      if (this.svelteCardTab.isOnAVSScreen() && AVSData && AVSData.line1) {
        if (AVSData.countryCode) {
          // onretry we already updated the payload
          AVSData.country = AVSData.countryCode;
          delete AVSData.countryCode;
        }
        data.billing_address = {
          city: AVSData.city,
          country: AVSData.country,
          line1: AVSData.line1,
          line2: AVSData.line2,
          postal_code: AVSData.postal_code,
          state: AVSData.state,
        };
        Analytics.track('card:avsdata', {
          data: AVSData,
        });
      }
    }

    if (data.method === INTERNATIONAL_TAB_NAME) {
      data.method = 'app';
      if (isOnNVSForm && selectedInternationalProvider) {
        /**
         * International method namespace is only used on frontend. On backend it is treated as "app".
         */

        if (NVSRequired && NVSFormData) {
          if (NVSFormData.countryCode) {
            // onretry we already updated the payload
            NVSFormData.country = NVSFormData.countryCode;
            delete NVSFormData.countryCode;
          }
          data.billing_address = NVSFormData;
          Analytics.track('card:nvsformdata', {
            data: NVSFormData,
          });
        }
      }
    }

    if (request.feesRedirect) {
      this.showFeesUi();
      return;
    }

    /**
     * - Ask user to verify phone number if not logged in and wants to save card
     * - Show OTP screen after user agrees to fees
     */
    const isDomesticCustomer = storeGetter(HomeScreenStore.isIndianCustomer);
    if (data.save && !this.getCurrentCustomer().logged) {
      if (this.screen === 'card') {
        /**
         * - In case if recurring payment and recurring=preferred payments
         * - Ask user to verify phone if phone number is domestic only
         */
        if (RazorpayHelper.isRecurringOrPreferredPayment()) {
          if (isDomesticCustomer) {
            initLoginForSavedCard.call(
              this,
              TRUECALLER_VARIANT_NAMES.add_new_card
            );
            return;
          }
        } else {
          initLoginForSavedCard.call(
            this,
            TRUECALLER_VARIANT_NAMES.add_new_card
          );
          return;
        }
      } else if (!this.headless) {
        request.message = 'Verifying OTP...';
        request.paused = true;
      }
    }
    delete data.app_token;

    Razorpay.sendMessage({
      event: 'submit',
      data: data,
    });

    let wallet = data.wallet;
    let walletObj;

    if (data.method === 'wallet') {
      walletObj = freqWallets[wallet];

      if (!walletObj || walletObj.custom) {
        return;
      }

      if (this.hasAmazonpaySdk && wallet === 'amazonpay') {
        request.external.amazonpay = true;
      }
    }

    if (this.modal) {
      this.modal.options.backdropclose = false;
    }

    let emiCode, emiContact, isDebitEMI;
    if (data.method === 'emi') {
      emiCode = cardTab.getIssuerForEmiFromPayload(data);
      isDebitEMI = isDebitIssuer(emiCode);
      emiContact = discreet.storeGetter(HomeScreenStore.emiContact);
      if (isDebitEMI && emiContact) {
        data.contact = emiContact;
      }
      if (isDebitEMI) {
        data['_[mode]'] = 'debit_emi';
      }
    }

    if (data.method === 'app') {
      let provider = data.provider;

      CardsTracker.PAY_WITH_APPS_PAYMENT_INITIATED({
        instrument: {
          name: provider,
        },
      });
      Analytics.track('app:attempt', {
        data: {
          method: data.method,
          provider: provider,
        },
      });

      if (provider === 'cred') {
        if (RazorpayHelper.isContactOptional()) {
          // For contact optional case, we ask for contact separately
          // which is present in proxyPhone.
          this.payload.contact = getProxyPhone();
        }
        let userEligibleDetails =
          discreet.CRED.isUserEligible(this.payload.contact) || {};
        if (userEligibleDetails.eligible === undefined) {
          session.showLoadError(I18n.format('card.checking_cred_eligibility'));
          discreet.CRED.checkCREDEligibility(this.payload.contact)
            .then(function () {
              session.hideErrorMessage();
              session.submit();
            })
            .catch(function (e) {
              let userFacingError = I18n.format('card.no_cred_account');
              if (e.error && e.error.description) {
                userFacingError = e.error.description;
              }
              session.showLoadError(userFacingError, true);
            });
          return;
        } else if (!userEligibleDetails.eligible) {
          let userFacingError = I18n.format('card.no_cred_account');
          session.showLoadError(userFacingError, true);
          return;
        }
      }
    } else if (data.method === 'card' || data.method === 'emi') {
      this.nativeotp = !!this.shouldUseNativeOTP();

      let cardType = cardTab.getCardTypeFromPayload(data);
      let shouldUseNativeOTP = false;
      if (data.method === 'card') {
        if (
          this.nativeotp &&
          discreet.Flows.shouldUseNativeOtpForCardPayment(
            data,
            this.svelteCardTab.getTransformedTokens()
          )
        ) {
          shouldUseNativeOTP = true;
        }
      } else if (data.method === 'emi') {
        if (cardType === 'bajaj' && this.r.isLiveMode()) {
          shouldUseNativeOTP = true;

          BackStore = {
            tab: 'emi',
            screen: 'emi',
          };
          if (EmiStore.getBajajTCAccepted() === false) {
            EmiStore.setBajajTCAcceptedConsent();
            return;
          }
        } else if (isDebitEMI) {
          // Skip Native OTP for EMI with Debit Cards
          shouldUseNativeOTP = true;
        }
      }

      if (shouldUseNativeOTP) {
        let params = {
          extraProps: {
            reason: 'native_otp_enter',
          },
        };

        this.headless = true;
        Analytics.track('native_otp:attempt');
        // session.tabs.card.onHide();
        this.setScreen('otp', params);
        this.r.on('payment.otp.required', (data) => {
          // hide offers
          discreet.OffersStore.showOffers.set(false);
          session.otpView.updateScreen({
            showCtaOneCC: true,
          });
          this.askOTP(that.otpView, data);
        });
        this.r.on('payment.3ds.required', function () {
          showAuthOverlay();
          Analytics.track('native_otp:3ds_required:prompt');
        });

        request.nativeotp = true;
      } else {
        if (
          storeGetter(shouldShowProceedOverlay) &&
          !RazorpayHelper.getOption('redirect')
        ) {
          showTruecallerNecessaryCtaForPopup();
          shouldShowProceedOverlay.set(false);
          return;
        }
      }
    }
    let isDynamicWalletFlow = discreet.WalletHelper.isDynamicWalletFlow();

    if (
      !isDynamicWalletFlow &&
      discreet.Wallet.isPowerWallet(wallet) &&
      !request.feesRedirect &&
      data.contact &&
      data.email
    ) {
      this.powerwallet = true;
      this.otpView.updateScreen({
        skipTextLabel: 'resend_otp',
        allowSkip: false,
      });
      this.topBar?.setTitleOverride('otp', 'image', walletObj.logo);
      this.setOneCCTabLogo(walletObj.logo);
      this.commenceOTP('wallet_sending', 'wallet_enter', {
        wallet: I18n.getWalletName(walletObj.code, locale),
      });
    } else {
      if (this.screen === 'otp') {
        this.commenceOTP('payment_processing');
      } else {
        this.showLoadError();
      }
    }

    if (!isDynamicWalletFlow && wallet === 'freecharge') {
      this.otpView.updateScreen({
        maxlength: 4,
        digits: new Array(4),
      });
    } else if (isDebitEMI) {
      this.otpView.updateScreen({
        maxlength: 6,
        digits: new Array(6),
        mode: emiCode,
      });
    } else if (this.headless) {
      // OTP of length 8 is only required for Headless OTP.
      this.otpView.updateScreen({
        maxlength: 8,
        digits: new Array(8),
      });
    } else {
      this.otpView.updateScreen({
        maxlength: 6,
        digits: new Array(6),
      });
    }

    this.preferredInstrument = P13n.processInstrument(data, this);
    isQRPaymentCancellable({}, true);

    emitMagicFunnelEvent(MAGIC_FUNNEL.PAYMENT_ATTEMPT);
    let payment = this.r.createPayment(data, request);
    payment
      .on('payment.success', successHandler.bind(this))
      .on('payment.error', errorHandler.bind(this))
      .on('payment.cancel', cancelHandler.bind(this));

    if (data.method === 'wallet' && isDynamicWalletFlow) {
      /**
       * Register payment api otp.response callback, to trigger otp view.
       */
      this.r.on('payment.createPayment.responseType', function (type) {
        if (type === 'otp') {
          that.hideOverlayMessage();
          that.otpView.updateScreen({
            skipTextLabel: 'resend_otp',
            allowSkip: false,
          });
          that.topBar.setTitleOverride('otp', 'image', walletObj.logo);
          that.setOneCCTabLogo(walletObj.logo);
          if (wallet === 'freecharge') {
            that.otpView.updateScreen({
              maxlength: 4,
            });
          }
          that.commenceOTP('otp_sending_generic', undefined, {
            phone: getPhone(),
          });
        }
      });
    }

    this.attemptCount++;

    let iosCheckoutBridgeNew = Bridge.getNewIosBridge();

    // When the payment is handled by an external sdk that razorapy sdk interacts with,
    // this passes on the coproto or the payment data to the razorpay sdk
    if (request.external.amazonpay || request.external.gpay) {
      payment.on('payment.externalsdk.process', function (data) {
        /* invoke external sdk via our SDK */
        if (CheckoutBridge && CheckoutBridge.processPayment) {
          that.showLoadError();
          CheckoutBridge.processPayment(JSON.stringify(data));
        } else if (iosCheckoutBridgeNew) {
          iosCheckoutBridgeNew.postMessage({
            action: 'processPayment',
            body: data,
          });
        }
      });
    }

    /**
     * For Cardless EMI payments,
     * if this is the final payment request,
     * take the user back to the cardless EMI screen
     * from the plans screen
     */
    if (data.method === 'cardless_emi' && data.emi_duration) {
      this.switchTab('cardless_emi');
    }

    if (this.powerwallet) {
      this.commenceOTP('otp_sending_generic', undefined, {
        phone: getPhone(),
      });
    }

    if (data.method === 'wallet' && (this.powerwallet || isDynamicWalletFlow)) {
      this.r.on('payment.otp.required', (message) => {
        WalletTracker.NATIVE_OTP_SENT({
          method: {
            name: METHODS.WALLET,
            instrument: {
              name: (this.payload && this.payload.wallet) || '',
            },
          },
        });
        this.askOTP(that.otpView, message, false, { phone: getPhone() });
        that.otpView.updateScreen({
          showCtaOneCC: true,
          ctaOneCCDisabled: false,
          allowSkip: false,
        });
      });
      this.r.on(
        'payment.wallet.topup',
        function () {
          Analytics.track('wallet:balance:insufficient', {
            data: {
              wallet: this.payload && this.payload.wallet,
            },
          });

          let insufficient_text = 'Insufficient balance in your wallet';
          if (
            this.payload &&
            this.payload.wallet === 'payumoney' &&
            this.r._payment
          ) {
            if (!window.localStorage) {
              return this.r._payment.complete(
                discreet.error(insufficient_text)
              );
            }
          }

          this.otpView.updateScreen({
            loading: false,
            addFunds: true,
          });
          this.otpView.setTextView('wallet_insufficient_balance');
        }.bind(this)
      );
    } else if (data.method === 'upi') {
      updateLoadingCTA(I18n.format('misc.cancel_action'));
      updateSubLinkContent(I18n.format('misc.cancel_action'));

      this.r.on('payment.upi.noapp', function () {
        that.showLoadError(I18n.format('upi.intent_no_apps_error'), true);

        that.body.addClass('upi-noapp');
      });

      this.r.on('payment.upi.selectapp', function () {
        that.showLoadError(I18n.format('upi.intent_select_app'), false);
      });

      this.r.on('payment.upi.coproto_response', function (response) {
        let params = {};
        params[Constants.UPI_POLL_URL] = response.request.url;
        params[Constants.PENDING_PAYMENT_TS] = Date.now() + '';
        that.setParamsInStorage(params);

        /**
         * When the payment response is for intent mweb using deeplink (without specific app)
         * Invoke the flow where upi intent url is opened using deeplink
         */
        if (data.upi_app === null && response.data.intent_url) {
          processIntentOnMWeb(response.data.intent_url);
        }
      });

      this.r.on('payment.upi.pending', function (data) {
        if (data && data.flow === 'upi-intent') {
          Analytics.track('upi_pending', {
            data: {
              data: data,
              message: 'misc.payment_waiting_confirmation',
            },
            immediately: true,
          });
          return that.showLoadError(
            I18n.format('misc.payment_waiting_confirmation')
          );
        }

        that.showLoadError(I18n.format('upi.intent_accept_request'));
      });
    } else if (data.method === 'app') {
      let appName = 'app';
      if (data.provider === 'cred') {
        appName = 'CRED app';
      }

      if (data.provider === 'trustly') {
        // Show goto payment popup link in loader
        updateLoadingCTA(I18n.format('misc.go_to_payment'));
        updateSubLinkContent(I18n.format('misc.go_to_payment'));
      }

      this.r.on('payment.app.pending', function () {
        // Collect flow
        // Message: Please complete the payment on the {app}
        let message = I18n.formatTemplateWithLocale(
          'misc.complete_payment_on_app',
          { app: appName },
          locale
        );
        return that.showLoadError(message);
      });

      this.r.on('payment.app.coproto_response', function (coprotoResponse) {
        // Intent flow
        // Message: Redirecting you to the {app}...
        Analytics.track('app_coproto_response', {
          data: {
            data: coprotoResponse,
            message: 'misc.checking_payment_status',
          },
        });
        let message = I18n.formatTemplateWithLocale(
          'misc.redirecting_to_app',
          { app: appName },
          locale
        );
        return that.showLoadError(message);
      });

      this.r.on('payment.app.intent_response', function (intentResponse) {
        // Message: Checking the payment status...

        Analytics.track('app_intent_response', {
          data: {
            data: intentResponse,
            message: 'misc.checking_payment_status',
          },
        });
        let message = I18n.formatMessageWithLocale(
          'misc.checking_payment_status',
          locale
        );
        return that.showLoadError(message);
      });

      // Message: Your payment is being processed
      return that.showLoadError();
    } else {
      if (!this.headless) {
        updateLoadingCTA(I18n.format('misc.go_to_payment'));
        // We are not using old error-dialog in the new, redesigned UI.
        updateSubLinkContent(I18n.format('misc.go_to_payment'));
        this.r.on('payment.cancel', function () {
          that.showLoadError(I18n.format('misc.payment_canceled'), true);
        });
      }
    }
  },

  getPayload: function () {
    let data = this.getFormData();
    let selectedInstrument = this.getSelectedPaymentInstrument();

    if (this.screen === 'card' && this.tab === 'emi') {
      if (!this.svelteCardTab.isOnSavedCardsScreen()) {
        setEmiBank(data);
      }
      if (RazorpayHelper.isRecurring()) {
        let recurringValue = this.get('recurring');
        data.recurring = _.isString(recurringValue) ? recurringValue : 1;
      }
    }

    // data.amount is needed by external libraries relying on `onsubmit` postMessage
    // data.amount may already be there in case of emandate
    if (!data.hasOwnProperty('amount')) {
      data.amount = this.get('amount');
    }
    let offer = this.getAppliedOffer();
    let hasDiscount = offer && offer.amount !== offer.original_amount;

    if (RazorpayHelper.isOneClickCheckout() && hasDiscount) {
      data.amount =
        data.amount + storeGetter(discreet.ChargesStore.offerAmount);
    }
    if (MethodStore.getSingleMethod() === 'paypal') {
      data.method = 'paypal';
    }

    if (selectedInstrument && selectedInstrument.method === 'cod') {
      data.method = 'cod';
    }

    return data;
  },

  /**
   * Returns the object to be passed while
   * cancelling a payment
   *
   * @returns {Object}
   */
  getCancelReason: function () {
    let reason;

    if (this.payload && this.payload.method === 'cardless_emi') {
      reason = {
        '_[reason]': 'PAYMENT_CANCEL_BEFORE_OTP_VERIFY',
      };

      if (!this.payload.emi_duration) {
        reason = {
          '_[reason]': 'PAYMENT_CANCEL_BEFORE_PLAN_SELECT',
        };
      }
    }

    return reason;
  },

  /**
   * Cleans up all the Svelte components that were added.
   */
  cleanUpSvelteComponents: function () {
    let views = [
      'cardlessEmiView',
      'currentScreen',
      'emandateView',
      'emi',
      'emiPlansView',
      'emiScreenView',
      'homeTab',
      'nachScreen',
      'otpView',
      'payLaterView',
      'savedCardsView',
      'svelteOverlay',
      'upiCancelReasonPicker',
      'nbCancelReasonPicker',
      'timer',
      'oneClickCheckoutHome',
      'svelteCardTab',
    ];

    let session = this;

    views.forEach(function (_view) {
      let view = session[_view];

      if (view) {
        try {
          if (typeof view.$destroy === 'function') {
            view.$destroy();
          }

          if (typeof view.destroy === 'function') {
            view.destroy();
          }
        } catch (err) {}

        session[_view] = null;
      }
    });
  },

  close: function () {
    if (this.prefCall) {
      this.prefCall.abort();
      this.prefCall = null;
    }

    if (this.isOpen) {
      Analytics.track('modal:close', {
        immediately: true,
      });

      let cancelReason = this.getCancelReason();

      UTILS.abortAjax(this.ajax);
      this.clearRequest(cancelReason);
      this.r.emit('cancelPersistPayment');
      this.isOpen = false;

      es6components.destroyAll();
      this.cleanUpSvelteComponents();
      stopVerificationPolling();

      try {
        this.delegator.destroy();
        this.listeners.forEach(function (unlisten) {
          unlisten();
        });
      } catch (e) {}
      this.bits.forEach(function (bit) {
        bit.off();
      });
      this.listeners = [];
      this.bits = [];
      deletePrefsCache();
      if (this.mainModal) {
        this.mainModal.$destroy();
      }

      this.tab = this.screen = '';
      tabStore.set(this.tab);
      screenStore.set(this.screen);
      this.modal = this.emi = this.el = this.card = null;
      window.setPaymentID = window.onComplete = null;
      this.isCorporateBanking = null;
    }
  },

  saveAndClose: function () {
    if (this.isOpen) {
      this.data = this.getFormData();
      this.close();
    }
  },

  closeAndDismiss: function () {
    let wasShown = this.modal && this.modal.isShown;
    this.saveAndClose();

    if (wasShown) {
      sendDismissEvent(this.dismissReason);
    }
  },

  setOffers: function () {
    let forcedOffer = discreet.Offers.getForcedOffer();
    let allOffers = discreet.Offers.getOffersForTab();

    /**
     * Since setOffers is called on render (render => setSvelteComponents=> setOffers) and also by CRED utilities
     * By this execution, an instance of offers may present in DOM
     * Hence offers view has to be destroyed with clearing offer first (else new offer screen gets effect of applied offer)
     * And as screen/switchTab updates offer screen accordingly, setting session.offers to undefined is necessary to avoid them.
     */
    if (this.offers && this.offers.$destroy) {
      if (this.offers.getAppliedOffer && this.offers.getAppliedOffer()) {
        this.offers.clearOffer();
      }
      this.offers.$destroy();
      this.offers = undefined;
    }

    // we show offers from backend + zestmoney offer which is
    // universally enabled
    if (forcedOffer || allOffers.length > 0) {
      Analytics.setMeta('hasOffers', true);
    } else if (!MethodStore.isZestMoneyEnabled()) {
      // if zestmoney isn't enabled, and backend also hasn't sent
      // any offers, don't proceed to initialize offers.
      return;
    }

    if (forcedOffer) {
      // Set $appliedOffer for Offer Validations to take place
      discreet.OffersStore.appliedOffer.set(forcedOffer);

      if (forcedOffer.payment_method === 'wallet') {
        this.walletOffer = forcedOffer;
      }

      Analytics.setMeta('forcedOffer', true);
    } else {
      let appliedOffer;
      this.getAppliedOffer = function () {
        return appliedOffer;
      };
      let session = this;
      this.offers = new discreet.OffersView({
        target: docUtil.getElementById('bottom'),
        props: {
          applicableOffers: allOffers,
          setAppliedOffer: function (offer, shouldNavigate) {
            appliedOffer = offer;
            setAppropriateCtaText();
            if (offer && shouldNavigate) {
              session.handleOfferSelection(offer);
            }
          },
          onShown: function () {
            if (session.screen === 'otp') {
              session.otpView.updateScreen({
                showCtaOneCC: false,
              });
            } else {
              let instance = session.getCurrentTabInstance();
              if (instance && instance.onHide) {
                instance.onHide();
              }
            }
            Analytics.track(
              'offers:list_view:screen:' + (session.screen || 'home'),
              {
                data: session.getAppliedOffer(),
              }
            );
          },
          onHide: function () {
            if (session.screen === 'otp') {
              session.otpView.updateScreen({
                showCtaOneCC: true,
              });
            } else {
              let instance = session.getCurrentTabInstance();
              const isNavstackControlled =
                isMainStackPopulated() && !controlledViaSession();
              // if navstack is invoked and sessionjs is not in control of rendering UI
              // skip invoking the onshown method
              if (instance && instance.onShown && !isNavstackControlled) {
                instance.onShown();
              }
            }
          },
        },
      });
    }
  },

  /**
   * Returns the currently applied offer
   *
   * @returns {Offer}
   */
  getAppliedOffer: function () {
    return discreet.Offers.getForcedOffer();
  },

  /**
   * Show an error with the offer.
   * @param {Function} cb callback
   */
  showOffersError: function (cb) {
    let methodDescription = '',
      screen = this.screen;

    if (screen === 'netbanking') {
      methodDescription = 'selected bank';
    } else if (screen === 'upi') {
      methodDescription = 'entered VPA';
    } else if (isEmiV2() && screen === 'emi') {
      methodDescription = 'selected emi provider';
    } else if (screen === 'emi' || screen === 'emiplans') {
      methodDescription = 'selected plan';
    } else {
      methodDescription = 'selected ' + this.screen;
    }

    this.offers.showError(methodDescription, cb);
  },

  getCustomer: function () {
    return getCustomer.apply(null, arguments);
  },

  updateCustomerInStore: function () {
    let customer = this.getCustomer(getPhone());
    CustomerStore.customer.set(customer);
  },

  /**
   * Mark headless as failed and perform cleanup
   */
  markHeadlessFailed: function () {
    Analytics.removeMeta('headless');
    this.headless = false;

    if (this.headlessMetadata) {
      let metadata = this.headlessMetadata;
      OtpService.resetCount(metadata.issuer || metadata.network);

      this.headlessMetadata = null;
    }
  },

  setPreferences: function (prefs) {
    this.preferences = prefs;
    preferences = prefs;

    if (RazorpayHelper.isOneClickCheckout()) {
      if (preferences.order) {
        const initializeAndReset = !(isMagicShopifyFlow() || isMagicWoocFlow());
        if (initializeAndReset) {
          discreet.ChargesHelper.initializeAndReset(
            parseInt(preferences.order.line_items_total)
          );
        }
      } else {
        const cart = isMagicShopifyFlow()
          ? RazorpayHelper.getOption('shopify_cart')
          : isMagicWoocFlow()
          ? RazorpayHelper.getOption('cart')
          : null;

        if (cart?.total_price) {
          discreet.ChargesHelper.initialize(cart.total_price);
        }
      }
    }

    let customer;
    let saved_customer = preferences.customer;
    if (saved_customer && saved_customer.addresses) {
      address.setSavedAddresses(saved_customer.addresses);
      address.setDefaultSelectedAddress();
    }
    this.invoice = preferences.invoice;
    this.subscription = preferences.subscription;

    /* set empty customer in case of local card saving */
    if (preferences.global === false) {
      this.local = true;
      customer = new Customer('');
      this.getCustomer = function () {
        return customer;
      };
    }
    Analytics.setMeta('global', preferences.global);

    /* Used previously logged in customer details and saved card tokens */
    if (saved_customer) {
      customer = this.getCustomer(saved_customer.contact, true);
      sanitizeTokens(saved_customer.tokens);
      customer.tokens = saved_customer.tokens;

      if (saved_customer.tokens || saved_customer.addresses) {
        isLoggedIn.set(true);
        customer.logged = true;
        try {
          EventsV2.setContext(ContextProperties.USER_LOGGEDIN, true);
          MiscTracker.USER_LOGGED_IN({
            loginSource: RazorpayHelper.getOption('customer_id')
              ? LOGIN_SOURCE_TYPES.MERCHANT_CUSTOMER_ID
              : LOGIN_SOURCE_TYPES.USER_AUTHENTICATION,
          });

          const traits = {};
          if (saved_customer.name) {
            traits.name = saved_customer.name;
          }
          if (saved_customer.email) {
            traits.email = saved_customer.email;
          }
          EventsV2.Identify(saved_customer.contact, traits);
        } catch {}
        Analytics.setMeta('loggedIn', true);
      }

      customer.customer_id = saved_customer.customer_id;
    }
    // Setting rtb_experiment based on prefs call for logged in users
    discreet.RTBHelper.setRTBVariant(preferences.rtb_experiment || {});
    /* set Razorpay instance for customer */
    Customer.prototype.r = this.r;
  },

  getCurrentTabInstance: function (override_tab) {
    let tab = override_tab || this.tab;
    if (tab === '') {
      return this.homeTab;
    }
    return this.tabs[tab];
  },
  tabs: {},
  hideOverlayMessage: hideOverlayMessage,
  hideOverlay: hideOverlay,
  showOverlay: showOverlay,
  errorHandler: errorHandler,
  successHandler: successHandler,
  cancelHandler: cancelHandler,
  getProxyPhone: getProxyPhone,
  askOTP: askOTP,
};

export default Session;
