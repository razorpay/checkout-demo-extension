import { shouldRememberCustomer } from 'checkoutstore/index.js';
import RazorpayStore, { isGlobalVault } from 'razorpay';
import { delayOTP } from 'card/experiments';
import AuthOverlay from 'ui/components/AuthOverlay.svelte';
import { popStack, pushOverlay } from 'navstack';
import { CardEvents, Events } from 'analytics';
import { get } from 'svelte/store';
import {
  remember,
  userConsentForTokenization,
} from 'checkoutstore/screens/card';
import CardTokenisationOverlaySvelte from 'ui/components/CardTokenisationOverlay.svelte';
import { getSession } from 'sessionmanager';
import { isIndianCustomer } from 'checkoutstore/screens/home';
import { isRemoveDefaultTokenizationSupported } from 'razorpay/helper/experiment';
import { shouldRememberCard } from 'ui/tabs/card/utils';

export function delayLoginOTPExperiment() {
  /**
   * check for global vault enabled
   */
  if (!isGlobalVault() || !shouldRememberCustomer()) {
    return false;
  }
  return delayOTP.enabled();
}

export const getCardByTokenId = (tokens, tokenId) => {
  if (!tokenId) {
    return null;
  }
  if (!tokens) {
    return null;
  }
  if (!tokens.items) {
    return null;
  }
  return tokens.items.find((token) => token.id === tokenId);
};

// 3ds overlay
export const showAuthOverlay = () => {
  pushOverlay({
    component: AuthOverlay,
    props: {
      onContinue: () => {
        popStack();
        Events.TrackBehav('native_otp:3ds_required:click');
        RazorpayStore.razorpayInstance?._payment?.gotoBank();
      },
    },
  });
};

const showConsentOverlay = (props) => {
  pushOverlay({
    component: CardTokenisationOverlaySvelte,
    props,
  });
  Events.TrackBehav(CardEvents.TOKENIZATION_BENEFITS_MODAL_SHOWN);
};

//using promise here as we don't need its value and have to perform a common action on both click and give command back to function
export const openConsentOverlay = (isSavedCardScreen = false) =>
  new Promise(function (resolve) {
    showConsentOverlay({
      onPositiveClick: () => {
        if (isSavedCardScreen) {
          userConsentForTokenization.set(true);
        } else {
          remember.set(true);
        }
        resolve(true);
      },
      onNegativeClick: () => resolve(false),
    });
  });

/** Ask popup to show benefits of save cards and get confirmation to save or not
 * for card flow will ask when user didn't give consent to save card
 * will not ask for international card as we don't tokenized them in backend
 */

export const showTokenisationBenefitModal = () => {
  const session = getSession();

  const isSavedCardScreen = session.svelteCardTab?.isOnSavedCardsScreen();
  const rememberCardCheck = isSavedCardScreen
    ? get(userConsentForTokenization)
    : get(remember);

  if (
    session.screen === 'card' &&
    !rememberCardCheck &&
    shouldRememberCard(get(isIndianCustomer)) &&
    isRemoveDefaultTokenizationSupported()
  ) {
    return true;
  }
  return false;
};
