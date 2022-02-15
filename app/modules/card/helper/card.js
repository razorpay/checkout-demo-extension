import { shouldRememberCustomer } from 'checkoutstore/index.js';
import { isGlobalVault } from 'razorpay';
import { delayOTP } from 'card/experiments';

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
