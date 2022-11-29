import { get } from 'svelte/store';
import { Views } from 'ui/tabs/card/constant';
import { getCurrencies } from './dcc';
import { AVSBillingAddress, AVSScreenMap } from 'checkoutstore/screens/card';
import { getCardByTokenId } from './cards';
import type {
  UpdateAVSFormDataParam,
  CurrenciesPayload,
  SelectedCardTokenIdParam,
  AVSEntityParam,
  AVSBillingAddressData,
} from 'card/types';

export const fetchAVSFlagForCard = (params: CurrenciesPayload = {}) => {
  const key = params.iin || params.tokenId;
  if (key) {
    getCurrencies(params)
      .then((currencyPayload: DCC.GetCurrenciesResponseType) => {
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
}: SelectedCardTokenIdParam) => {
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
}: AVSEntityParam) => {
  if (currentView === Views.SAVED_CARDS) {
    return selectedCard ? selectedCard.id : null;
  }
  if (currentView === Views.HOME_SCREEN) {
    return selectedCardFromHome ? selectedCardFromHome.id : null;
  }
  return iin;
};

export const resetAVSBillingAddressData = () => {
  AVSBillingAddress.set(null);
};

export const setAVSBillingAddressData = (data: AVSBillingAddressData) => {
  // TODO: need to remove any type after checkoutstore/screens/card migrated to ts
  AVSBillingAddress.set(data as any);
};

export const updateAVSScreenMap = (key: string, value: boolean) => {
  AVSScreenMap.update((prevValue) => ({
    ...prevValue,
    [key]: value,
  }));
};

export const updateAVSFormDataForCardView = ({
  lastView,
  direct,
  selectedCard,
  selectedCardFromHome,
}: UpdateAVSFormDataParam) => {
  if (lastView !== Views.ADD_CARD) {
    let billingAddress: AVSBillingAddressData = null;
    if (direct && selectedCardFromHome?.billing_address) {
      // directly come from home screen
      billingAddress = {
        ...selectedCardFromHome.billing_address,
      };
    } else if (!direct && selectedCard?.billing_address) {
      // from card screen
      billingAddress = {
        ...selectedCard.billing_address,
      };
    }
    setAVSBillingAddressData(billingAddress);
  } else if (get(AVSBillingAddress)) {
    /**
     * If user comes from ADD_CARD screen then:
     * if AVSBillingAddress store has previously stored card and
     * user is trying to add new card then previous billing address should not be shown
     * */
    setAVSBillingAddressData(null);
  }
};