import { shouldRememberCustomer } from 'checkoutstore/index.js';
import RazorpayStore, { isGlobalVault } from 'razorpay';
import { delayOTP } from 'card/experiments';
import AuthOverlay from 'ui/components/AuthOverlay.svelte';
import { popStack, pushOverlay } from 'navstack';
import { Events } from 'analytics';

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
