import { isCardOrEMIEnabled } from 'checkoutstore/methods';
import { getDisplayAmount } from 'razorpay';
import { getView, setView, destroyView } from './';
import { get } from 'svelte/store';

import Razorpay from 'common/Razorpay';
import { getBankFromCardCache, isDebitEMIBank } from 'common/bank';
import { getCardType } from 'common/card';

import {
  showViewEmiPlans,
  showSelectEmiPlan,
  showEnterCardDetails,
  setAppropriateCtaText,
} from 'cta';
import {
  getEmiDurationForSavedCard,
  getEmiDurationForNewCard,
} from 'checkoutstore/emi';
import {
  selectedCard,
  cardCvv,
  isAVSEnabledForEntity,
} from 'checkoutstore/screens/card';
import CardTab from 'ui/tabs/card/index.svelte';
import { getSession } from 'sessionmanager';
import { METHODS } from 'checkoutframe/constants';
import { querySelector } from 'utils/doc';
import * as ObjectUtils from 'utils/object';

const CARD_KEY = 'svelteCardTab';

export function render() {
  const session = getSession();
  if (isCardOrEMIEnabled) {
    const cardTab = new CardTab({
      target: querySelector('#form-fields'),
    });
    setView(CARD_KEY, cardTab);
    session.tabs = {
      ...session.tabs,
      [METHODS.EMI]: cardTab,
      [METHODS.CARD]: cardTab,
    };
    return cardTab;
  }
}

export function destroy() {
  destroyView(CARD_KEY);
}

function getCardTab() {
  return getView(CARD_KEY);
}

/**
 * Set the "View EMI Plans" CTA as the Pay Button
 * if all the criteria are met.
 *
 * Criteria:
 * Mandatory: tab=emi
 *
 * 1. If saved cards screen, show if selected saved card does not have a plan selected.
 * 2. If new card screen, show if no emi plan is selected.
 */
export function setEmiPlansCta(screen, tab) {
  let type;

  const cardTab = getCardTab();
  // TODO return early if cardTab is null
  // current code calls setAppropriateCtaText in default condition
  // which is run every time session.setScreen is called
  if (cardTab) {
    const isSavedScreen = cardTab.isOnSavedCardsScreen();
    const savedCard = get(selectedCard);

    if (screen === 'card' && tab === 'emi') {
      if (isSavedScreen) {
        if (savedCard) {
          if (!getEmiDurationForSavedCard()) {
            type = 'show';
          }
        }
      } else if (!getEmiDurationForNewCard()) {
        type = 'show';
      }
    } else if (screen === 'emiplans') {
      if (isSavedScreen) {
        if (savedCard) {
          if (!get(cardCvv)) {
            type = 'select';
          }
        }
      }
    } else if (screen === 'emi' && tab === 'emiplans') {
      type = 'emi';
    }
  }

  switch (type) {
    case 'show':
      showViewEmiPlans();
      break;

    case 'select':
      showSelectEmiPlan();
      break;

    case 'emi':
      showEnterCardDetails();
      break;

    default: {
      if (get(isAVSEnabledForEntity)) {
        return;
      } // prevent CTA update in post AVS OTP screen[saved card]
      setAppropriateCtaText();
    }
  }
}

/**
 * Returns the issuer for EMI from Payload
 *
 * @param {Object} payload
 * @param {Array} tokens
 *
 * @return {String} issuer
 */
export function getIssuerForEmiFromPayload(payload) {
  const tokens = getCardTab().getTransformedTokens();
  let issuer = '';

  if (payload.token) {
    if (tokens) {
      tokens.forEach(function (t) {
        if (t.token === payload.token) {
          issuer = t.card.issuer;

          // EMI code for debit card issuer
          if (isDebitEMIBank(issuer, t.card.type)) {
            issuer = `${issuer}_DC`;
          }
        }
      });
    }
  } else {
    issuer = ObjectUtils.get(
      getBankFromCardCache(payload['card[number]']),
      'code',
      ''
    );
  }

  return issuer;
}

/**
 * Returns the cardType from payload
 *
 * @param {Object} payload
 * @param {Array} tokens
 *
 * @return {String} cardType
 */
export function getCardTypeFromPayload(payload) {
  const tokens = getCardTab().getTransformedTokens();
  let cardType = '';

  if (payload.token) {
    if (tokens) {
      tokens.forEach(function (t) {
        if (t.token === payload.token) {
          cardType = t.card.networkCode;
        }
      });
    }
  } else {
    cardType = getCardType(payload['card[number]']);
  }

  return cardType;
}

/**
 * Get the text to show to EMI plan.
 * @param {Number} amount
 * @param {Object} plan
 *
 * @return {Object}
 */
export function getEmiText(amount, plan) {
  let amountPerMonth = Razorpay.emi.calculator(
    amount,
    plan.duration,
    plan.interest
  );

  return {
    duration: plan.duration,
    amount: getDisplayAmount(amountPerMonth),
  };
}
