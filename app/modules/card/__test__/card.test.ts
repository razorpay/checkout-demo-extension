import {
  getCardByTokenId,
  showAuthOverlay,
  authOverlayOnContinue,
  showTokenisationBenefitModal,
} from 'card/helper/cards';
import { popStack, pushOverlay } from 'navstack';
import { Events } from 'analytics';
import { userConsentForTokenization } from 'checkoutstore/screens/card';
import {
  customerTokens,
  selctedTokenId,
  selctedToken,
} from '../__mocks__/card';
import { getSession } from 'sessionmanager';

jest.mock('sessionmanager', () => ({
  __esModule: true,
  getSession: jest.fn(() => ({
    screen: '',
  })),
}));

jest.mock('navstack', () => ({
  __esModule: true,
  pushOverlay: jest.fn(),
  popStack: jest.fn(),
}));

jest.mock('analytics', () => ({
  __esModule: true,
  Events: { TrackBehav: jest.fn() },
  CardEvents: {
    TOKENIZATION_BENEFITS_MODAL_SHOWN: 'tokenization_benefits_modal_shown',
  },
}));

jest.mock('razorpay/helper/experiment', () => ({
  __esModule: true,
  isRemoveDefaultTokenizationSupported: () => true,
}));

jest.mock('ui/tabs/card/utils', () => ({
  __esModule: true,
  shouldRememberCard: () => true,
}));

describe('Test getCardByTokenId', () => {
  test('should return token from customerTokens based on passed tokenId', () => {
    expect(getCardByTokenId(customerTokens, selctedTokenId)).toMatchObject(
      selctedToken
    );
  });
  test('should return null when tokenId is undefined', () => {
    const selctedTokenId = undefined;
    expect(getCardByTokenId(customerTokens, selctedTokenId)).toBe(null);
  });
  test('should return null when tokenId is undefined & customerTokens is null', () => {
    const selctedTokenId = undefined;
    const customerTokens = null;
    expect(getCardByTokenId(customerTokens, selctedTokenId)).toBe(null);
  });
  test('should return null when customerTokens.items is null', () => {
    (customerTokens as any).items = null;
    expect(getCardByTokenId(customerTokens, selctedTokenId)).toBe(null);
  });
});
describe('Test showAuthOverlay', () => {
  test('should call showAuthOverlay', () => {
    showAuthOverlay();
    expect(pushOverlay).toHaveBeenCalledTimes(1);
  });
});
describe('Test authOverlayOnContinue', () => {
  test('should call authOverlayOnContinue', () => {
    authOverlayOnContinue();
    expect(popStack).toHaveBeenCalledTimes(1);
    expect(Events.TrackBehav).toHaveBeenCalledTimes(1);
    expect(Events.TrackBehav).toHaveBeenCalledWith(
      'native_otp:3ds_required:click'
    );
  });
});
describe('Test showTokenisationBenefitModal', () => {
  test('should return false on L0 screen', () => {
    expect(showTokenisationBenefitModal()).toBe(false);
  });
  test('should return true on card screen', () => {
    (getSession as any).mockReturnValue({
      screen: 'card',
      svelteCardTab: {
        isOnSavedCardsScreen: () => true,
      },
    });
    userConsentForTokenization.set(false);
    expect(showTokenisationBenefitModal()).toBe(true);
  });
});
