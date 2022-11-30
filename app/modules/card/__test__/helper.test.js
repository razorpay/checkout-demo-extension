import {
  delayLoginOTPExperiment,
  getIntSelectedCardTokenId,
  fetchAVSFlagForCard,
  getEntityForAVSMap,
  openConsentOverlay,
} from 'card/helper';
import { getCurrencies } from 'card/helper/dcc';
import { shouldRememberCustomer } from 'checkoutstore/index.js';
import { isGlobalVault } from 'razorpay';
import { AVSScreenMap } from 'checkoutstore/screens/card';

import { get } from 'svelte/store';

import { Views } from 'ui/tabs/card/constant';

import { customerTokens } from '../__mocks__/customerToken';
import CardTokenisationOverlaySvelte from 'ui/components/CardTokenisationOverlay.svelte';
import { pushOverlay } from 'navstack';
import { country, phone } from 'checkoutstore/screens/home';
import { isOTPSupported } from 'card/helper/cards';

jest.mock('checkoutstore/index.js', () => ({
  shouldRememberCustomer: jest.fn((cb) => (cb ? cb() : true)),
  getAmount: jest.fn(() => 1000),
}));

jest.mock('card/helper/dcc', () => ({
  getCurrencies: jest.fn(() => Promise.resolve({ avs_required: true })),
}));

jest.mock('razorpay', () => {
  const originalModule = jest.requireActual('razorpay');
  return {
    ...originalModule,
    __esModule: true,
    isGlobalVault: jest.fn((cb) => (cb ? cb() : true)),
    getCurrency: jest.fn(() => 'INR'),
    getCurrencies: jest.fn(() => Promise.resolve({ avs_required: true })),
    isRemoveDefaultTokenizationSupported: jest.fn(() => false),
  };
});

jest.mock('card/experiments', () => ({
  delayOTP: {
    enabled: jest.fn((cb) => (cb ? cb() : true)),
  },
}));

jest.mock('navstack', () => ({
  pushOverlay: jest.fn(),
}));

describe('delayLoginOTPExperiment', () => {
  test('GlobalVault + Remember Customer + experiment enabled', () => {
    expect(delayLoginOTPExperiment()).toBe(true);
  });

  test('Local Vault + Remember Customer + experiment enabled', () => {
    isGlobalVault.mockImplementation(() => false);
    expect(delayLoginOTPExperiment()).toBe(false);
  });

  test('Global Vault + Remember Customer False + experiment enabled', () => {
    shouldRememberCustomer.mockImplementation(() => false);
    expect(delayLoginOTPExperiment()).toBe(false);
  });
});

describe('AVS getIntSelectedCardTokenId', () => {
  test('should return null if no card is selected', () => {
    const tokenId = getIntSelectedCardTokenId({});
    expect(tokenId).toBeNull();
  });
  test('should return null if indian card selected on saved card view', () => {
    const selectedCard = customerTokens.items[2]; // Card with IN country;
    const tokenId = getIntSelectedCardTokenId({
      currentView: Views.SAVED_CARDS,
      tokens: customerTokens,
      selectedCard,
    });
    expect(tokenId).toBeNull();
  });
  test('should return null if selected card does not have country', () => {
    let selectedCard = customerTokens.items[1]; // Card does not have country;
    let tokenId = getIntSelectedCardTokenId({
      currentView: Views.SAVED_CARDS,
      tokens: customerTokens,
      selectedCard,
    });
    expect(tokenId).toBeNull();
    selectedCard = customerTokens.items[3]; // Card does not have country;
    tokenId = getIntSelectedCardTokenId({
      currentView: Views.SAVED_CARDS,
      tokens: customerTokens,
      selectedCard,
    });
    expect(tokenId).toBeNull();
  });
  test('should return null if current view is not saved card', () => {
    const selectedCard = customerTokens.items[1]; // Card does not have country;
    const tokenId = getIntSelectedCardTokenId({
      currentView: Views.HOME_SCREEN,
      tokens: customerTokens,
      selectedCard,
    });
    expect(tokenId).toBeNull();
  });
  test('should return null if current view neither is saved card or home screen is not saved card', () => {
    const selectedCard = customerTokens.items[1]; // Card does not have country;
    const tokenId = getIntSelectedCardTokenId({
      currentView: Views.CARD_APP,
      tokens: customerTokens,
      selectedCard,
    });
    expect(tokenId).toBeNull();
  });
  test('should return tokenId if international card is selected on saved card screen', () => {
    const selectedCard = customerTokens.items[0]; // Card with US country;
    const tokenId = getIntSelectedCardTokenId({
      currentView: Views.SAVED_CARDS,
      tokens: customerTokens,
      selectedCard,
    });
    expect(tokenId).toStrictEqual(selectedCard.id);
  });
  test('should return tokenId if international card is selected on home screen preferred method', () => {
    let selectedInstrument = {
      token_id: customerTokens.items[0].id,
    };
    let tokenId = getIntSelectedCardTokenId({
      currentView: Views.HOME_SCREEN,
      tokens: customerTokens,
      selectedInstrument,
    });
    expect(tokenId).toStrictEqual(selectedInstrument.token_id);
    selectedInstrument = {};
    tokenId = getIntSelectedCardTokenId({
      currentView: Views.HOME_SCREEN,
      tokens: customerTokens,
      selectedInstrument,
    });
    expect(tokenId).toBeNull();
  });
  test('should return null if customer tokens are empty on home screen', () => {
    const selectedInstrument = {
      token_id: customerTokens.items[0].id,
    };
    const tokenId = getIntSelectedCardTokenId({
      currentView: Views.HOME_SCREEN,
      tokens: null,
      selectedInstrument,
    });
    expect(tokenId).toBeNull();
  });
});

describe('AVS fetchAVSFlagForCard', () => {
  test('should not fetch if no iin or tokenId params are provided', () => {
    fetchAVSFlagForCard();
    expect(getCurrencies).toHaveBeenCalledTimes(0);
    fetchAVSFlagForCard({ test: 1 });
    expect(getCurrencies).toHaveBeenCalledTimes(0);
    fetchAVSFlagForCard({ iin: '' });
    expect(getCurrencies).toHaveBeenCalledTimes(0);
    fetchAVSFlagForCard({ tokenId: '' });
    expect(getCurrencies).toHaveBeenCalledTimes(0);
  });
  test('should update AVSScreenMap store on fetch success', async () => {
    // clear the store
    AVSScreenMap.set({});

    let params = { iin: 'iin_' };
    await fetchAVSFlagForCard(params);
    expect(getCurrencies).toHaveBeenCalledTimes(1);

    params = { tokenId: 'token_' };
    await fetchAVSFlagForCard(params);

    expect(getCurrencies).toHaveBeenCalledTimes(2);
    expect(get(AVSScreenMap)).toStrictEqual({
      iin_: true,
      token_: true,
    });
  });
  test('should update AVSScreenMap store on fetch failure with false value', async () => {
    // clear the store
    AVSScreenMap.set({});

    let params = { tokenId: 'token_rejected_1' };
    // When avs_required flag is false
    getCurrencies.mockImplementation(() =>
      Promise.resolve({ avs_required: false })
    );
    await fetchAVSFlagForCard(params);
    expect(getCurrencies).toHaveBeenCalledTimes(1);

    expect(get(AVSScreenMap)).toStrictEqual({
      token_rejected_1: false,
    });

    params = { tokenId: 'token_rejected_2' };
    // When avs_required flag is undefined
    getCurrencies.mockImplementation(() => Promise.resolve({}));
    await fetchAVSFlagForCard(params);
    expect(getCurrencies).toHaveBeenCalledTimes(2);

    expect(get(AVSScreenMap)).toStrictEqual({
      token_rejected_1: false,
      token_rejected_2: false,
    });
  });
});

describe('AVS getEntityForAVSMap', () => {
  test('should return undefined if no parameter provided', () => {
    const entity = getEntityForAVSMap({});
    expect(entity).toBeUndefined();
  });
  test('should return iin if currentView is null', () => {
    const entity = getEntityForAVSMap({
      currentView: null,
      iin: 'iin_',
    });
    expect(entity).toStrictEqual('iin_');
  });
  test('should return selectedCard if currentView is saved-card', () => {
    const entity = getEntityForAVSMap({
      currentView: Views.SAVED_CARDS,
      selectedCard: { id: '1' },
      selectedCardFromHome: { id: '2' },
      iin: 'iin_',
    });
    expect(entity).toStrictEqual('1');
  });
  test('should return selectedCardFromHome if currentView is home-screen', () => {
    const entity = getEntityForAVSMap({
      currentView: Views.HOME_SCREEN,
      selectedCard: { id: '1' },
      selectedCardFromHome: { id: '2' },
      iin: 'iin_',
    });
    expect(entity).toStrictEqual('2');
  });
  test('should return iin if all parameters provided and currentView is upi', () => {
    const entity = getEntityForAVSMap({
      currentView: 'upi',
      selectedCard: { id: '1' },
      selectedCardFromHome: { id: '2' },
      iin: 'iin_',
    });
    expect(entity).toStrictEqual('iin_');
  });
  test('should return null if selectedCard provided and currentView is home-screen', () => {
    const entity = getEntityForAVSMap({
      currentView: Views.HOME_SCREEN,
      selectedCard: { id: '1' },
    });
    expect(entity).toStrictEqual(null);
  });
  test('should return null if selectedCardFromHome provided and currentView is saved-card', () => {
    const entity = getEntityForAVSMap({
      currentView: Views.SAVED_CARDS,
      selectedCardFromHome: { id: '2' },
    });
    expect(entity).toStrictEqual(null);
  });
});

describe('openConsentOverlay', () => {
  test('openConsentOverlay should be shown', async () => {
    expect(pushOverlay).not.toHaveBeenCalled();

    openConsentOverlay();

    expect(pushOverlay).toHaveBeenCalledTimes(1);

    expect(pushOverlay).toHaveBeenCalledWith(
      expect.objectContaining({
        component: CardTokenisationOverlaySvelte,
      })
    );
  });
});

describe('isOTPSupported', () => {
  test('with indian number', () => {
    phone.set('8888888888');
    country.set('+91');
    expect(isOTPSupported()).toBe(true);
  });

  test('with international number', () => {
    phone.set('8888888888');
    country.set('+44');
    expect(isOTPSupported()).toBe(false);
  });
});
