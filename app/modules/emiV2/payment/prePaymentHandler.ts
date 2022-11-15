import { shouldRememberCustomer } from 'checkoutstore';
import { reward } from 'checkoutstore/rewards';
import {
  cardCvv,
  cardExpiry,
  cardName,
  cardNumber,
  currentCvv,
  remember,
  selectedCard,
} from 'checkoutstore/screens/card';
import { selectedBank } from 'emiV2/store';
import {
  getOption,
  getOptionalObject,
  getPreferences,
  isEmailOptional,
  isOneClickCheckout,
} from 'razorpay';
import { getSession } from 'sessionmanager';
import { get } from 'svelte/store';
import type { EMIPayload, Rewards } from 'emiV2/payment/types/payment';
import { moveControlToSession, popStack } from 'navstack';
import { removeAppliedOfferForMethod } from 'emiV2/helper/offers';
import updateScore from 'analytics/checkoutScore';
import Analytics from 'analytics';
import type { EmiPlan } from 'emiV2/types';
import { selectedPlan } from 'checkoutstore/emi';
import { cardlessEmiStore } from 'emiV2/ui/components/EmiTabsScreen/store';

export const clearEmiPaymentPayload = () => {
  selectedBank.set(null);
};

function generateRequestParamsForPayment(): Payment.PaymentParams {
  const session = getSession();

  const params: Payment.PaymentParams = {
    feesRedirect: getPreferences('fee_bearer'),
    external: {},
    optional: getOptionalObject(),
    paused: session.get().paused,
  };
  return params;
}

export const createEMiPaymentV2 = (basePayload: Partial<EMIPayload>) => {
  const session = getSession();
  const paymentPayload: EMIPayload = { ...basePayload } as EMIPayload;
  const paymentParams: Payment.PaymentParams =
    generateRequestParamsForPayment();

  const currentPlan: EmiPlan = get(selectedPlan);

  if (getOption('force_terminal_id')) {
    paymentPayload.force_terminal_id = getOption('force_terminal_id');
  }

  const { reward_id } = (reward || {}) as Rewards;
  if (reward_id && !isEmailOptional()) {
    paymentPayload.reward_ids = [reward_id];
  }
  const appliedOffer: Offers.OfferItem = session.getAppliedOffer();
  if (currentPlan && currentPlan.offer_id) {
    paymentPayload.offer_id = currentPlan.offer_id;
  } else if (
    appliedOffer &&
    (!session.offers || session.offers.shouldSendOfferToApi())
  ) {
    // If applied offer is not validated against the card -> show the original amount in payment loader screen
    if (appliedOffer.type !== 'read_only') {
      paymentPayload.offer_id = appliedOffer.id;
      session.r.display_amount = isOneClickCheckout()
        ? session.r.get('amount')
        : appliedOffer.amount;
      updateScore('affordability_offers');
      Analytics.track('offers:applied_with_payment', {
        data: appliedOffer,
      });
    }
  }

  if (paymentParams?.feesRedirect && typeof paymentPayload?.fee === 'number') {
    paymentParams.feesRedirect = false;
  }

  delete paymentPayload.downtimeSeverity;
  delete paymentPayload.downtimeInstrument;

  return {
    paymentPayload,
    paymentParams,
  };
};

export const setCardInPayload = (basePayload: Partial<EMIPayload>) => {
  const isSavedCardEnabled = shouldRememberCustomer();
  const shouldRemember = get(remember);
  const selectedToken = get(selectedCard);
  basePayload = {
    ...basePayload,
    'card[number]': get(cardNumber).replace(/ /g, ''),
    'card[cvv]': get(cardCvv),
    'card[expiry]': get(cardExpiry),
    'card[name]': get(cardName),
  };

  if (selectedToken) {
    basePayload.token = selectedToken['token'];
    basePayload['card[cvv]'] = get(currentCvv);
    delete basePayload['card[number]'];
    delete basePayload['card[expiry]'];
    delete basePayload['card[name]'];
  }
  if (isSavedCardEnabled && shouldRemember) {
    basePayload.save = 1;
  }

  return basePayload;
};

/**
 * Helper function to redirect from emi flow to card flow
 * if the selected card is ineligible for payment and the user clicks on 'Pay Full Amount' CTA
 */
export const payInFull = () => {
  popStack();
  const session = getSession();
  // Remve card screen from navStack
  moveControlToSession(true);
  session.switchTab('card');
  session.svelteCardTab.showLandingView('emi').then(function () {
    session.showCardTab();
    // if there is any no cost emi offer appplied
    // remove it
    removeAppliedOfferForMethod('card');
    session.preSubmit();
  });
};

/**
 * Helper function to clear existing payment request
 * Use Cases: When different contact/provider is used for checking cardless eligibility
 * When an eligibility call has been made, but the user switches tab
 * If the user has checked eligibility but going ahead with a different option
 */
export const clearPaymentRequest = () => {
  const session = getSession();
  if (session.r._payment) {
    // set cardless emi store to empty after clearing the payment request
    cardlessEmiStore.set([]);
    session.r._payment.off();
    session.r._payment.clear();
  }
};
