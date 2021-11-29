import {
  isGlobalVault,
  shouldRememberCustomer,
  getCurrencies,
} from 'checkoutstore/index.js';
import { AVSBillingAddress, AVSScreenMap } from 'checkoutstore/screens/card';
import { delayOTP } from 'card/experiments';

import { Views } from 'ui/tabs/card/constant';

export function delayLoginOTPExperiment() {
  /**
   * check for global vault enabled
   */
  if (!isGlobalVault() || !shouldRememberCustomer()) {
    return false;
  }
  return delayOTP.enabled();
}

export const resetAVSBillingAddressData = () => {
  AVSBillingAddress.set(null);
};

export const updateAVSScreenMap = (key, value) => {
  AVSScreenMap.update((prevValue) => ({
    ...prevValue,
    [key]: value,
  }));
};

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
  return _Arr.find(tokens.items, (token) => token.id === tokenId);
};

export const fetchAVSFlagForCard = (params = {}) => {
  const key = params.iin || params.tokenId;
  if (key) {
    getCurrencies(params)
      .then((currencyPayload) => {
        updateAVSScreenMap(key, !!currencyPayload.avs_required);
      })
      .catch(() => {
        // Mark it as AVS flag disabled case
        updateAVSScreenMap(key, false);
      });
  }
};

/**
 * Get International selectedSaved Card either of:
 * 1. selectedCard if on saved-card screen
 * 2. selectedInstrument if on home-screen.
 */
export const getIntSelectedCardTokenId = ({
  currentView,
  selectedCard,
  selectedInstrument,
  tokens,
}) => {
  let preSelectedCard = null;

  // First check with the selectedCard store
  if (currentView === Views.SAVED_CARDS && selectedCard) {
    preSelectedCard = selectedCard;
  }
  // If selectedCard store is null then check with selectedInstrument store
  if (
    !preSelectedCard &&
    (currentView === Views.SAVED_CARDS || currentView === Views.HOME_SCREEN) &&
    selectedInstrument
  ) {
    preSelectedCard = getCardByTokenId(tokens, selectedInstrument.token_id);
  }

  const country = preSelectedCard?.card?.country;
  const tokenId = preSelectedCard?.id;

  return country && country !== 'IN' ? tokenId : null;
};

/**
 * Get entity for AVSMap on respective screen.
 * @param {*} param0
 * @returns
 */
export const getEntityForAVSMap = ({
  currentView,
  iin,
  selectedCard,
  selectedCardFromHome,
}) => {
  if (currentView === Views.SAVED_CARDS) {
    return selectedCard ? selectedCard.id : null;
  }
  if (currentView === Views.HOME_SCREEN) {
    return selectedCardFromHome ? selectedCardFromHome.id : null;
  }
  return iin;
};
