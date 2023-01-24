import { shouldRememberCustomer } from 'checkoutstore/index.js';
import RazorpayStore, {
  isGlobalVault,
  isRemoveDefaultTokenizationSupported,
} from 'razorpay';
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
import { shouldRememberCard } from 'ui/tabs/card/utils';
import { AnalyticsV2State } from 'analytics-v2';
import { CardsTracker } from 'card/analytics/events';
import { tabStore } from 'checkoutstore';
import { isHeadless } from 'otp/sessionInterface';
import type { Tokens } from 'razorpay/types/Preferences';
import type { TokenisationOverlayProps } from 'card/types';
import { METHODS } from 'checkoutframe/constants';

export function delayLoginOTPExperiment() {
  /**
   * check for global vault enabled
   */
  if (!isGlobalVault() || !shouldRememberCustomer()) {
    return false;
  }
  return delayOTP.enabled();
}

export const getCardByTokenId = (
  tokens: Tokens | null,
  tokenId: string | undefined
) => {
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

export const authOverlayOnContinue = () => {
  popStack();
  Events.TrackBehav('native_otp:3ds_required:click');
  RazorpayStore.razorpayInstance?._payment?.gotoBank();
};

// 3ds overlay
export const showAuthOverlay = () => {
  pushOverlay({
    component: AuthOverlay,
    props: {
      onContinue: authOverlayOnContinue,
    },
  });
};

// truecaller necessary CTA overlay
export const showTruecallerNecessaryCtaForPopup = () => {
  const session = getSession();
  pushOverlay({
    component: AuthOverlay,
    props: {
      onContinue: () => {
        popStack();
        session.submit();
      },
    },
  });
};

export const showConsentOverlay = (props: TokenisationOverlayProps) => {
  pushOverlay({
    component: CardTokenisationOverlaySvelte,
    props,
  });
  // TODO: need to remove any, once card events file migrated to ts
  Events.TrackBehav((CardEvents as any).TOKENIZATION_BENEFITS_MODAL_SHOWN);
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

export const showTokenisationBenefitModal = (): boolean => {
  try {
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
  } catch {
    return false;
  }
};

// as of now we only send OTP for indian customer from backend
export const isOTPSupported = () => {
  const isDomesticCustomer = get(isIndianCustomer);
  return isDomesticCustomer;
};

export const trackCardOTPEntered = (otpReason: string) => {
  try {
    if (get(tabStore) === METHODS.CARD) {
      if (isHeadless()) {
        CardsTracker.NATIVE_OTP_FILLED({
          ...AnalyticsV2State.selectedInstrumentForPayment,
          flow: AnalyticsV2State.cardFlow,
        });
      } else {
        CardsTracker.OTP_ENTERED({
          for: otpReason,
        });
      }
    }
  } catch (e) {}
};

export const trackCardOTPResend = (otpReason: string) => {
  try {
    if (get(tabStore) === METHODS.CARD) {
      if (isHeadless()) {
        CardsTracker.NATIVE_OTP_SMS_RESEND_CLICKED({
          instrument: AnalyticsV2State.selectedInstrumentForPayment.instrument,
        });
      } else {
        CardsTracker.RESEND_OTP_CLICKED({
          for: otpReason,
        });
      }
    }
  } catch (e) {}
};
