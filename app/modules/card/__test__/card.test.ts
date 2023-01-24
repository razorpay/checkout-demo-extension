import {
  getCardByTokenId,
  showAuthOverlay,
  authOverlayOnContinue,
  showTokenisationBenefitModal,
  trackCardOTPEntered,
  trackCardOTPResend,
} from 'card/helper/cards';
import { popStack, pushOverlay } from 'navstack';
import { Events } from 'analytics';
import { remember } from 'checkoutstore/screens/card';
import {
  customerTokens,
  selctedTokenId,
  selctedToken,
} from '../__mocks__/card';
import { getSession } from 'sessionmanager';
import { isRemoveDefaultTokenizationSupported } from 'razorpay';
import { otpReasons } from 'otp/constants';
import { CardsTracker } from 'card/analytics/events';
import { AnalyticsV2State } from 'analytics-v2';
import { flow } from 'card/constants';
import { tabStore } from 'checkoutstore';
import { isHeadless } from 'otp/sessionInterface';

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

jest.mock('razorpay', () => {
  const originalModule = jest.requireActual('razorpay');
  return {
    __esModule: true,
    ...originalModule,
    isRemoveDefaultTokenizationSupported: jest.fn(() => true),
  };
});

jest.mock('ui/tabs/card/utils', () => ({
  __esModule: true,
  shouldRememberCard: () => true,
}));

jest.mock('card/analytics/events', () => {
  const originalModule = jest.requireActual('card/analytics/events');
  return {
    __esModule: true,
    ...originalModule,
    CardsTracker: {
      NATIVE_OTP_SMS_RESEND_CLICKED: jest.fn(),
      RESEND_OTP_CLICKED: jest.fn(),
      NATIVE_OTP_FILLED: jest.fn(),
      OTP_ENTERED: jest.fn(),
    },
  };
});

jest.mock('otp/sessionInterface', () => ({
  __esModule: true,
  isHeadless: jest.fn(),
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
        isOnSavedCardsScreen: () => false,
      },
    });
    (isRemoveDefaultTokenizationSupported as any).mockReturnValue(true);
    expect(showTokenisationBenefitModal()).toBe(true);
  });

  test('should return false as experiment is false', () => {
    (getSession as any).mockReturnValue({
      screen: 'card',
      svelteCardTab: {
        isOnSavedCardsScreen: () => false,
      },
    });
    (isRemoveDefaultTokenizationSupported as any).mockReturnValue(false);
    expect(showTokenisationBenefitModal()).toBe(false);
  });

  test('should return true on card screen', () => {
    (getSession as any).mockReturnValue({
      screen: 'card',
      svelteCardTab: {
        isOnSavedCardsScreen: () => false,
      },
    });
    (isRemoveDefaultTokenizationSupported as any).mockReturnValue(true);
    remember.set(false);
    expect(showTokenisationBenefitModal()).toBe(true);
  });

  test('should return false as remember is true', () => {
    (getSession as any).mockReturnValue({
      screen: 'card',
      svelteCardTab: {
        isOnSavedCardsScreen: () => false,
      },
    });
    remember.set(true);
    expect(showTokenisationBenefitModal()).toBe(false);
  });
});
describe('Test trackCardOTPEntered', () => {
  test('should not trigger card funnel events if its not card tab', () => {
    tabStore.set('');
    trackCardOTPEntered(otpReasons.access_card);
    expect(CardsTracker.NATIVE_OTP_FILLED).not.toHaveBeenCalled();
    expect(CardsTracker.OTP_ENTERED).not.toHaveBeenCalled();
  });
  test('should trigger OTP_ENTERED for normal OTP flow', () => {
    tabStore.set('card');
    trackCardOTPEntered(otpReasons.access_card);
    expect(CardsTracker.OTP_ENTERED).toHaveBeenCalledTimes(1);
    expect(CardsTracker.OTP_ENTERED).toHaveBeenCalledWith({
      for: otpReasons.access_card,
    });
  });
  test('should trigger NATIVE_OTP_FILLED for native OTP flow', () => {
    (isHeadless as any).mockReturnValue(true);
    tabStore.set('card');
    AnalyticsV2State.selectedInstrumentForPayment = {
      method: {
        name: 'card',
      },
      instrument: {
        issuer: 'ICIC',
        personalisation: false,
        saved: true,
        network: 'Visa',
        type: 'credit',
      },
    };
    AnalyticsV2State.cardFlow = flow.SAVED_CARD_L1;
    trackCardOTPEntered('');
    expect(CardsTracker.NATIVE_OTP_FILLED).toHaveBeenCalledTimes(1);
    expect(CardsTracker.NATIVE_OTP_FILLED).toHaveBeenCalledWith(
      expect.objectContaining({
        ...AnalyticsV2State.selectedInstrumentForPayment,
        flow: AnalyticsV2State.cardFlow,
      })
    );
  });
});
describe('Test trackCardOTPResend', () => {
  test('should not trigger card funnel events if its not card tab', () => {
    tabStore.set('');
    trackCardOTPResend(otpReasons.access_card);
    expect(CardsTracker.NATIVE_OTP_SMS_RESEND_CLICKED).not.toHaveBeenCalled();
    expect(CardsTracker.RESEND_OTP_CLICKED).not.toHaveBeenCalled();
  });
  test('should trigger RESEND_OTP_CLICKED for normal OTP flow', () => {
    tabStore.set('card');
    (isHeadless as any).mockReturnValue(false);
    trackCardOTPResend(otpReasons.access_card);
    expect(CardsTracker.RESEND_OTP_CLICKED).toHaveBeenCalledTimes(1);
    expect(CardsTracker.RESEND_OTP_CLICKED).toHaveBeenCalledWith({
      for: otpReasons.access_card,
    });
  });
  test('should trigger NATIVE_OTP_SMS_RESEND_CLICKED for native OTP flow', () => {
    (isHeadless as any).mockReturnValue(true);
    tabStore.set('card');
    trackCardOTPResend('');
    expect(CardsTracker.NATIVE_OTP_SMS_RESEND_CLICKED).toHaveBeenCalledTimes(1);
    expect(CardsTracker.NATIVE_OTP_SMS_RESEND_CLICKED).toHaveBeenCalledWith({
      instrument: AnalyticsV2State.selectedInstrumentForPayment.instrument,
    });
  });
});
