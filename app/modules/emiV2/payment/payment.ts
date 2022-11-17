// import { getIssuerForEmiFromPayload } from "checkoutframe/components/card";
import { customer } from 'checkoutstore/customer';
import { selectedPlan } from 'checkoutstore/emi';
import {
  isCurrentCardInvalidForEmi,
  isCurrentCardProviderInvalid,
} from 'emiV2/store';
import {
  contact as defaultContact,
  country,
  emiContact,
} from 'checkoutstore/screens/home';
import { getBankFromCardCache } from 'common/bank';
import { selectedTab } from 'components/Tabs/tabStore';
import { moveControlToSession, popStack, pushOverlay } from 'navstack';
import RazorpayStore, { isRedesignV15 } from 'razorpay';
import { getSession } from 'sessionmanager';
import { get } from 'svelte/store';
import ConfirmAndPay from 'ui/components/ConfirmAndPay.svelte';
import {
  clearPaymentRequest,
  createEMiPaymentV2,
  setCardInPayload,
} from 'emiV2/payment/prePaymentHandler';
import type {
  CardlessEmiPayload,
  PaymentProcessConfiguration,
  PaymentResponse,
  PaymentStatus,
} from 'emiV2/payment/types/payment';
import type {
  CardlessEMIStore,
  Customer,
  EmiPlan,
  PaymentMeta,
  Tokens,
} from 'emiV2/types';
import { selectedBank, emiViaCards } from 'emiV2/store';
import {
  cardlessEligibilityError,
  selectedInstrumentCardlessEligible,
  cardlessEmiStore,
  loadingEligibility,
} from 'emiV2/ui/components/EmiTabsScreen/store';
import { ELIGIBILITY_VALIDATION_ERROR } from 'ui/labels/debit-emi';
import {
  isSelectedBankBajaj,
  showTokenisationBenefitModal,
} from 'emiV2/helper/helper';
import {
  cardName,
  cardNumber,
  currentCardType,
  selectedCard,
} from 'checkoutstore/screens/card';
import {
  trackCardlessEligibility,
  trackPayFullAmount,
  trackPaymentAttempt,
} from 'emiV2/events/tracker';
import type { EMIPayload } from 'emiV2/payment/types/payment';
import * as ObjectUtils from 'utils/object';
import { fetchCardlessEmiPlans } from 'emiV2/payment/cardlessEmi/cardlessEmi';
import { screenStore } from 'checkoutstore';
import { resetCallbackOnEmiPayViaBank } from 'emiV2/helper/emi';
import { disableCTA } from 'checkoutstore/screens/otp';
import { showOffers } from 'offers/store';
import { openConsentOverlay, showAuthOverlay } from 'card/helper';
import Analytics from 'analytics';
import { getSavedCardsForEMI } from 'emiV2/helper/card';
import { handleFeeBearer } from 'emiV2/helper/fee-bearer';
import { isCardlessTab } from 'emiV2/helper/tabs';

const getIssuerForEmiFromPayload = (payload: EMIPayload) => {
  const currentCustomer = get(customer) as Customer;
  const tokens = getSavedCardsForEMI(currentCustomer) as Array<Tokens>;
  let issuer = '';

  if (payload.token) {
    if (tokens) {
      tokens.forEach(function (t: Tokens) {
        if (t.token === payload.token) {
          issuer = t.card.issuer;

          // EMI code for Debit Cards is {bank}_DC
          if (t.card.type === 'debit') {
            issuer = `${issuer}_DC`;
          }
        }
      });
    }
  } else {
    const bankFromCache = getBankFromCardCache(payload['card[number]']);
    if (bankFromCache) {
      issuer = ObjectUtils.get(bankFromCache, 'code', '');
    }
  }

  return issuer;
};

function responseHandler(params: { status: PaymentStatus }) {
  const { status } = params;
  return (response: PaymentResponse) => {
    const session = getSession();
    /**
     * session.cancelHandler
     * session.errorHandler
     * session.successHandler
     */
    const savedToken = get(selectedCard);
    const currentTab = get(selectedTab);

    // emi_type should be either cardless_emi or emi
    // if user is on a screen and has cardless tab enabled
    // for providers like zestmoney, walnut etc we dont come to the tabs screen
    // therefor tab_name by default will be cardless
    const paymentTrackerMeta: PaymentMeta = {
      emi_type: isCardlessTab() ? 'cardless_emi' : 'emi',
      provider_name: get(selectedBank)?.name,
      tab_name: currentTab || 'cardless',
      emi_via_cards_screen: get(emiViaCards),
      emi_plans: 'NA',
    };

    const selectedPlanForEmi: EmiPlan = get(selectedPlan);

    if (selectedPlanForEmi) {
      paymentTrackerMeta.emi_plans = {
        nc_emi_tag: selectedPlanForEmi.subvention === 'merchant',
        tenure: selectedPlanForEmi.duration,
      };
    }
    // track payment success failure
    const errorDescription =
      response && response.error ? response.error.description : '';
    trackPaymentAttempt(
      {
        ...paymentTrackerMeta,
        status,
        failure_reason: status !== 'success' ? errorDescription : '',
        success: status === 'success',
      },
      status,
      savedToken
    );

    if (status === 'error') {
      if (
        response.error &&
        session.payload &&
        session.payload.method === 'cardless_emi'
      ) {
        let errorMessage = '';
        const errorReason: string = response.error.reason;
        if (errorReason === 'user_not_eligible') {
          // Track cardless eligibiilty check
          trackCardlessEligibility({
            ...paymentTrackerMeta,
            mobile_number: session.payload.contact,
            is_default_mobile_number:
              session.payload.contact === get(defaultContact),
            is_eligible: false,
          });
          errorMessage = ELIGIBILITY_VALIDATION_ERROR;
          cardlessEligibilityError.set(errorMessage);
          selectedInstrumentCardlessEligible.set(false);
        } else if (errorReason === 'invalid_mobile_number') {
          errorMessage = response.error.description;
          cardlessEligibilityError.set(errorMessage);
        }
      }
      loadingEligibility.set(false);
    }
    session[`${status}Handler`].call(session, response);
  };
}

// Handle Native OTP flow for debit card EMI
const nativeOtpFlow = () => {
  const session = getSession();
  const params = {
    extraProps: {
      reason: 'native_otp_enter',
    },
  };
  session.headless = true;
  moveControlToSession(true);
  session.setScreen('otp', params);
  session.r.on('payment.otp.required', (data: unknown) => {
    showOffers.set(false);
    session.otpView.updateScreen({
      showCtaOneCC: true,
    });
    session.askOTP(session.otpView, data);
  });
  // If 3ds is required show Auth overlay
  session.r.on('payment.3ds.required', function () {
    showAuthOverlay();
    Analytics.track('native_otp:3ds_required:prompt');
  });
};

export const checkContactValid = (phone: string) => {
  if (phone && get(country) === '+91') {
    if (phone.startsWith('+91')) {
      const slicedPhone = phone.slice(3);
      return slicedPhone.length === 10;
    }
    return phone.length === 10;
  }
  return false;
};

export const handleEmiPaymentV2 = (emiConfig: PaymentProcessConfiguration) => {
  const session = getSession();
  const isCardInvalidForEmi = get(isCurrentCardInvalidForEmi);
  const isCardProviderInvalid = get(isCurrentCardProviderInvalid);

  if (['card', 'bajaj'].includes(session.screen)) {
    if (isCardProviderInvalid) {
      //Track Try Another Emi Option click
      trackPayFullAmount(
        {
          provider_name: get(selectedBank)?.name,
          tab_name: get(selectedTab),
          card_type: get(currentCardType),
          emi_plan: {
            nc_emi_tag: get(selectedPlan).subvention === 'merchant',
            tenure: get(selectedPlan).duration,
          },
        },
        'try_another'
      );
      // Todo: doing popstack twice because we want to reach the EMI L0 screen
      // Since sending the depth value is not working
      popStack();
      popStack();

      // set the selected plan to be null
      selectedPlan.set(null);

      screenStore.set('emi');
      session.screen = 'emi';
      // setting the card invalid state to false
      isCurrentCardInvalidForEmi.set(false);
      isCurrentCardProviderInvalid.set(false);
      return;
    }

    // Check for card form validations
    if (session.checkInvalid()) {
      return;
    }

    // If selected bank is bajaj check for form validations
    // for name and card number to be empty
    // avoiding check invalid function call if v1.5 is enabled
    // since CTA state is handled as disabled
    if (
      isSelectedBankBajaj() &&
      session.checkInvalid('.bajaj-emi-screen') &&
      !isRedesignV15()
    ) {
      return;
    }

    if (isCardInvalidForEmi) {
      // If Card is invalid for EMI Payment and user has clicked on pay full amount

      //Track Pay Full Amount click
      trackPayFullAmount({
        provider_name: get(selectedBank)?.name,
        tab_name: get(selectedTab),
        card_type: get(currentCardType),
        emi_plan: {
          nc_emi_tag: get(selectedPlan).subvention === 'merchant',
          tenure: get(selectedPlan).duration,
        },
      });

      pushOverlay({
        component: ConfirmAndPay,
      });
      return;
    }
  }

  let basePayload: Partial<EMIPayload> = {
    ...session.getPayload(),
    method: emiConfig.action === 'cardless' ? 'cardless_emi' : 'emi',
    ...emiConfig.payloadData,
  };

  const tab: string = get(selectedTab);

  let emiContactForDebitEmi: string = get(emiContact);

  if (emiContactForDebitEmi && !emiContactForDebitEmi.startsWith('+91')) {
    emiContactForDebitEmi = `+91${emiContactForDebitEmi}`;
  }

  const globalContact: string = get(defaultContact);
  // in cases of saved cards we don't have value of emi contact in store
  // therefore we need to send global contact as default value
  const contact = emiContactForDebitEmi || globalContact;
  const isDefaultContact = contact === get(defaultContact);
  const plan = get(selectedPlan);

  // If contact for EMI is invalid stop the payment
  // and step is eligibility check
  if (!checkContactValid(contact) && emiConfig.cardlessEligibilityFlow) {
    return;
  }

  /**
   * Set Payload for card EMI Payment
   */
  if (isSelectedBankBajaj()) {
    basePayload = {
      ...basePayload,
      'card[number]': get(cardNumber).replace(/ /g, ''),
      'card[name]': get(cardName),
      contact,
    };

    delete basePayload['card[cvv]'];
  } else if (emiConfig.action === 'card') {
    basePayload = setCardInPayload(basePayload);
  }

  const { paymentPayload, paymentParams } = createEMiPaymentV2(basePayload);

  session.payload = paymentPayload;

  /** Ask popup to show benefits of save cards and get confirmation to save or not
   * for card emi flow will ask when user didn't give consent to save card
   * will not ask for bajaj card as we don't tokenized them in backend
   */
  if (showTokenisationBenefitModal(emiConfig)) {
    if (!emiConfig?.tokenisationPopupShown) {
      openConsentOverlay().then(function (saved) {
        const newEmiConfig: PaymentProcessConfiguration = { action: 'card' };
        if (!saved) {
          newEmiConfig.tokenisationPopupShown = true;
        }
        handleEmiPaymentV2(newEmiConfig);
      });
      return;
    }
  }

  // If the payment request call has been made for cardless eligiblity check
  // We dont't need to send emi plan duration
  if (!emiConfig.cardlessEligibilityFlow) {
    if (plan && plan.duration) {
      paymentPayload.emi_duration = plan.duration.toString();
    }
  }

  if (paymentParams.feesRedirect) {
    /**
     * Here the fee redirect screen has to be controlled
     *
     */
    handleFeeBearer(paymentPayload, ({ amount, fee }) => {
      /**
       * Once the fee bearer consent is taken , callback will be hit with fee and amount
       * hence that amount and fee will be carry-forwarded with previously prepared payload
       * with this there will not be any side effect.
       */
      handleEmiPaymentV2({
        ...emiConfig,
        payloadData: {
          ...paymentPayload,
          amount,
          fee,
        },
      });
    });
    return;
  }

  if (
    paymentPayload.save &&
    !session.getCurrentCustomer().logged &&
    !isSelectedBankBajaj()
  ) {
    // Only show the save cards screen for credit debit emi
    if (emiConfig.action === 'card') {
      moveControlToSession(true);
      session.sendOTP(true);
      return;
    }
    if (!session.headless) {
      paymentParams.message = 'Verifying OTP...';
      paymentParams.paused = true;
    }
  }

  if (emiConfig.action === 'otp_skipped') {
    delete paymentPayload.save;
  }

  // Move to native otp flow for DC EMI
  if (tab === 'debit') {
    if (emiContactForDebitEmi) {
      paymentPayload.contact = contact;
    }
    paymentPayload['_[mode]'] = 'debit_emi';
  }

  session.nativeotp = !!session.shouldUseNativeOTP();
  let shouldUseNativeOTP = false;

  if ((isSelectedBankBajaj() && session.r.isLiveMode()) || tab === 'debit') {
    shouldUseNativeOTP = true;
  }

  if (shouldUseNativeOTP) {
    nativeOtpFlow();
    paymentParams.nativeotp = true;
  }

  if (session.screen === 'otp') {
    session.commenceOTP('payment_processing');
  } else if (emiConfig.cardlessEligibilityFlow) {
    // If it's a cardless emi eleigibility check we show the loader in the input field
    loadingEligibility.set(true);
  } else {
    session.showLoadError();
  }

  disableCTA.set(false);

  if (session.otpView) {
    if (tab === 'debit') {
      const emiCode = getIssuerForEmiFromPayload(paymentPayload);
      session.otpView.updateScreen({
        maxlength: 6,
        digits: new Array(6),
        mode: emiCode,
      });
    } else if (session.headless) {
      // OTP of length 8 is only required for Headless OTP.
      session.otpView.updateScreen({
        maxlength: 8,
        digits: new Array(8),
      });
    } else {
      session.otpView.updateScreen({
        maxlength: 6,
        digits: new Array(6),
      });
    }
  }

  if (session.r._payment) {
    if (paymentPayload.method === 'cardless_emi') {
      /**
       * For Cardless EMI, payments are created at the first step,
       * before the user gets to select a plan.
       * Thus, we would need to submit again after the
       * user has created a plan, even though the payment
       * is already created.
       *
       * This does not happen for any other method.
       */
      paymentPayload.payment_id = session.r._payment.payment_id;

      /**
       * If emi_duration is present, this is the final
       * payment submit request.
       * Clear existing payments.
       * Note: If any QR payment is active, by this time, it was cancelled, hence no errors on other payments
       */
      if (paymentPayload.emi_duration) {
        clearPaymentRequest();
      }
    } else {
      return;
    }
  }

  function onPaymentProcess(paymentData: CardlessEmiPayload) {
    const request = paymentData.request;
    const response = paymentData.response;

    const content = request.content;
    const method = content && content.method;
    const provider = content && content.provider;

    // Abort if not Cardless EMI
    if (method !== 'cardless_emi') {
      return;
    }
    const isEligibleForCardless =
      response.emi_plans && response.emi_plans[provider];

    //TrackCardless Emi Eligibility Check
    trackCardlessEligibility({
      emi_type: isCardlessTab() ? 'cardless_emi' : 'emi',
      provider_name: provider,
      tab_name: get(selectedTab),
      mobile_number: contact,
      is_default_mobile_number: isDefaultContact,
      is_eligible: true,
    });

    const cardlessEmiStorePlans = get(cardlessEmiStore);

    const cardlessEmiObject: CardlessEMIStore = {
      providerCode: provider,
      contact: content.contact,
      urls: {},
      plans: {},
    };

    if (response.emi_plans && response.emi_plans[provider]) {
      if (cardlessEmiObject && cardlessEmiObject.plans) {
        cardlessEmiObject.plans[provider] = response.emi_plans[provider];
      }
      cardlessEmiObject.ott = content.ott;

      // Enable the eligibility check to render the plans
      selectedInstrumentCardlessEligible.set(true);

      session.hideOverlayMessage();
      loadingEligibility.set(false);
    }

    if (response.resend_url) {
      // Init empty store if one doesn't exist
      if (
        cardlessEmiObject &&
        cardlessEmiObject.urls &&
        !cardlessEmiObject.urls[provider]
      ) {
        cardlessEmiObject.urls[provider] = {};
        cardlessEmiObject.urls[provider].resend_otp = response.resend_url;
      }
    }

    // Store the cardless emi plans along with provider in the svelte store
    cardlessEmiStore.set([...cardlessEmiStorePlans, cardlessEmiObject]);

    // since zestmoney follows a redirect flow
    // but on func it has native flow so in order
    // to follow a redirect approach
    if (!isEligibleForCardless && provider !== 'zestmoney') {
      loadingEligibility.set(false);
      fetchCardlessEmiPlans();
    }
  }

  if (!paymentPayload.token) {
    delete paymentPayload.token;
  }

  if (!paymentPayload.contact) {
    delete paymentPayload.contact;
  }

  (global as any).Razorpay.sendMessage({
    event: 'submit',
    data: paymentPayload,
  });

  // before we create the payment,
  // since no callbacks are pending reset if any
  resetCallbackOnEmiPayViaBank();

  const rzpInstanceWithPayment = RazorpayStore.razorpayInstance
    .createPayment(paymentPayload, paymentParams)
    .on(
      'payment.success',
      responseHandler({
        status: 'success',
      })
    )
    .on('payment.process', (paymentData: CardlessEmiPayload) => {
      onPaymentProcess(paymentData);
    })
    .on(
      'payment.error',
      responseHandler({
        status: 'error',
      })
    )
    .on(
      'payment.cancel',
      responseHandler({
        status: 'cancel',
      })
    );

  session.attemptCount++;
};
