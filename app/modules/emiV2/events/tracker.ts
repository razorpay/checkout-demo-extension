import Analytics from 'analytics';
import * as AnalyticsTypes from 'analytics-types';
import { selectedPlan } from 'checkoutstore/emi';
import { currentCardType, selectedCard } from 'checkoutstore/screens/card';
import { selectedBank, emiViaCards } from 'emiV2/store';
import { eligibilityInfoClicked } from 'emiV2/ui/components/EmiTabsScreen/store';
import { contact as defaultContact } from 'checkoutstore/screens/home';
import { selectedTab } from 'components/Tabs/tabStore';
import { errorTypes, getSelectedSavedCard } from 'emiV2/helper/card';
import type {
  EMIBANKS,
  SavedCardMeta,
  EmiOptionsMeta,
  Tokens,
  EmiProviderMeta,
  EmiTabMeta,
  EmiPlansMeta,
  payFullAmountMeta,
  paymentMeta,
  addCardMeta,
  CVVMeta,
  DebitEligibilityChecked,
  EmiPlan,
  OtpMeta,
  OtpType,
} from 'emiV2/types';
import { formatTemplateWithLocale } from 'i18n';
import { getSession } from 'sessionmanager';
import { get } from 'svelte/store';
import {
  EMI_NOT_SUPPORTED,
  ENTER_BANK_CARD_TO_AVAIL_EMI,
} from 'ui/labels/card';
import { clone } from 'utils/object';

import { EVENTS } from './constants';
import { capture, SEVERITY_LEVELS } from 'error-service';

export const emiMethodClicked = (labelShown: boolean) => {
  Analytics.track(EVENTS.L0_EMI_CLICK, {
    type: AnalyticsTypes.BEHAV,
    data: {
      nc_emi_tag: labelShown,
    },
  });
};

export const selectedDifferentBank = () => {
  Analytics.track(EVENTS.SELECT_DIFFERENT_BANK_CLICKED, {
    type: AnalyticsTypes.BEHAV,
  });
};

export const trackDifferentBankSelected = (provider: EmiOptionsMeta) => {
  Analytics.track(EVENTS.SELECTED_DIFFERENT_BANK, {
    type: AnalyticsTypes.BEHAV,
    data: provider,
  });
};

export const trackEmiProviderSelected = (provider: EmiProviderMeta) => {
  Analytics.track(EVENTS.EMI_PROVIDER_SELECTED, {
    type: AnalyticsTypes.BEHAV,
    data: provider,
  });
};

export const emiOptionsRendered = (emiOptionsMeta: {
  emiOptions: EMIBANKS[];
  savedCards: SavedCardMeta[];
}) => {
  try {
    // Slicing because we render only top 5 banks
    const emiProvidersTrackMeta: EmiOptionsMeta[] = emiOptionsMeta.emiOptions
      .map((providers: EMIBANKS) => ({
        name: providers.name,
        nc_emi_tag: !!providers.isNoCostEMI,
        interest_rate_tag: !!providers.startingFrom,
      }))
      .slice(0, 5);
    Analytics.track(EVENTS.EMI_OPTIONS_RENDERED, {
      type: AnalyticsTypes.RENDER,
      data: {
        saved_cards: emiOptionsMeta.savedCards,
        emi_providers: emiProvidersTrackMeta,
      },
    });
  } catch (e: any) {
    capture(e.message, { severity: SEVERITY_LEVELS.S2, unhandled: true });
  }
};

export const trackEmiTabChange = (tab: EmiTabMeta) => {
  Analytics.track(EVENTS.EMI_TAB_CHANGED, {
    type: AnalyticsTypes.BEHAV,
    data: tab,
  });
};

export const getSavedCardMeta = (card: Tokens) => {
  return {
    card_type: card.card.type,
    card_issuer: card.card.issuer,
    card_network: card.card.network,
  };
};

export const trackEmiPlansRendered = (
  plans: EmiPlansMeta,
  savedCard: Tokens | null
) => {
  try {
    if (savedCard) {
      plans.saved_card = getSavedCardMeta(savedCard);
    } else {
      plans.saved_card = 'NA';
    }
    Analytics.track(EVENTS.EMI_PLANS_RENDERED, {
      type: AnalyticsTypes.RENDER,
      data: plans,
    });
  } catch (e: any) {
    capture(e.message, { severity: SEVERITY_LEVELS.S2, unhandled: true });
  }
};

export const trackEmiPlansSelected = (plan: EmiPlansMeta, trigger?: string) => {
  const savedCard: Tokens | null = getSelectedSavedCard();

  if (savedCard) {
    plan.saved_card = getSavedCardMeta(savedCard);
  } else {
    plan.saved_card = 'NA';
  }
  Analytics.track(
    trigger === 'nc_emi'
      ? EVENTS.NC_EMI_TEXT_CLICKED
      : EVENTS.EMI_PLANS_SELECTED,
    {
      type: AnalyticsTypes.BEHAV,
      data: plan,
    }
  );
};

export const trackPayFullAmount = (
  data: payFullAmountMeta,
  eventType?: string
) => {
  Analytics.track(
    eventType === 'try_another'
      ? EVENTS.TRY_ANOTHER_EMI_CLICKED
      : eventType === 'confirm'
      ? EVENTS.PAY_FULL_AMOUNT_CONFIRMED
      : EVENTS.PAY_FULL_AMOUNT_CLICKED,
    {
      type: AnalyticsTypes.BEHAV,
      data,
    }
  );
};

export const trackCardlessEligibility = (data: paymentMeta) => {
  Analytics.track(EVENTS.CARDLESS_EMI_ELIGIBILITY_CHECK, {
    type: AnalyticsTypes.BEHAV,
    data,
  });
};

export const trackAddCardDetails = (data: addCardMeta) => {
  Analytics.track(EVENTS.ADD_CARD_DETAILS, {
    type: AnalyticsTypes.BEHAV,
    data,
  });
};

// if error message ispassed from the arguements use that (in case of bajaj form validations)
// else compute error message depending on error type
export const trackAddCardDetailsError = (
  data: addCardMeta,
  errorType: string,
  errorString?: string
) => {
  try {
    const trackPayload = clone(data);
    const errorDescription =
      errorType === errorTypes.BANK_INVALID
        ? ENTER_BANK_CARD_TO_AVAIL_EMI
        : EMI_NOT_SUPPORTED;
    trackPayload.error_description =
      errorString ||
      formatTemplateWithLocale(
        errorDescription,
        {
          bank: data.provider_name,
          type: data.tab_name,
        },
        'en'
      );
    trackPayload.pay_full_amount_cta =
      errorType === errorTypes.EMI_NOT_SUPPORTED;
    trackPayload.change_emi_option_cta = errorType === errorTypes.BANK_INVALID;
    trackPayload.error_type =
      errorType === errorTypes.BANK_INVALID
        ? 'card_invalid'
        : 'emi_not_supported_on_card';

    Analytics.track(EVENTS.ADD_CARD_DETAILS_ERROR, {
      type: AnalyticsTypes.BEHAV,
      data: trackPayload,
    });
  } catch (e: any) {
    capture(e.message, { severity: SEVERITY_LEVELS.S2, unhandled: true });
  }
};

export const trackPaymentAttempt = (
  data: paymentMeta,
  eventType: string,
  savedCard?: Tokens | null
) => {
  const analyticEvent =
    eventType === 'success'
      ? EVENTS.EMI_PAYMENT_SUCCESS
      : EVENTS.EMI_PAYMENT_FAILURE;

  if (savedCard) {
    data.saved_card = getSavedCardMeta(savedCard);
  }

  Analytics.track(analyticEvent, {
    type: AnalyticsTypes.BEHAV,
    data,
  });
};

export const trackEmiFromCardScreen = (data: SavedCardMeta) => {
  Analytics.track(EVENTS.EMI_FROM_CARDS_SCREEN, {
    type: AnalyticsTypes.BEHAV,
    data,
  });
};

export const trackCVVEnteredForSavedCards = (data: CVVMeta) => {
  Analytics.track(EVENTS.CVV_ENTERED, {
    type: AnalyticsTypes.BEHAV,
    data,
  });
};

export const trackDebitCardEligibilityChecked = (isEligible: boolean) => {
  try {
    const session = getSession();
    const savedCards: Tokens | null = get(selectedCard);
    const plan: EmiPlan = get(selectedPlan);
    const contact: string = session.payload.contact;
    const isDefaultContact: boolean = `+91${contact}` === get(defaultContact);

    const payload: DebitEligibilityChecked = {
      provider_name: get(selectedBank)?.name || 'NA',
      tab_name: get(selectedTab),
      emi_plan: {
        nc_emi_tag: plan.subvention === 'merchant',
        tenure: plan.duration,
      },
      is_eligible: isEligible,
      mobile_number: contact || 'NA',
      is_default_mobile_number: contact ? isDefaultContact : true,
      check_eligibility_info_clicked: get(eligibilityInfoClicked),
    };
    if (savedCards) {
      payload.saved_card = getSavedCardMeta(savedCards);
      payload.card_type = 'NA';
    } else {
      payload.card_type = get(currentCardType) || 'NA';
      payload.saved_card = 'NA';
    }

    Analytics.track(EVENTS.DC_ELIGIBILITY_CHECK, {
      type: AnalyticsTypes.BEHAV,
      data: payload,
    });
  } catch (e: any) {
    capture(e.message, { severity: SEVERITY_LEVELS.S2, unhandled: true });
  }
};

export const trackOtpEntered = (otp_timer: boolean, otp_type: OtpType) => {
  try {
    const plan: EmiPlan = get(selectedPlan);
    const currentTab: string = get(selectedTab);
    const savedCards: Tokens | null = get(selectedCard);

    const payload: OtpMeta = {
      provider_name: get(selectedBank)?.name || 'NA',
      tab_name: currentTab,
      emi_plan: 'NA',
      emi_via_cards_screen: get(emiViaCards),
      emi_type: currentTab === 'debit_cardless' ? 'cardless' : currentTab,
      otp_screen_time_out: otp_timer,
      otp_type,
    };

    // if emi plans are present add to payload
    if (plan && plan.duration) {
      payload.emi_plan = {
        nc_emi_tag: plan.subvention === 'merchant',
        tenure: plan.duration,
      };
    }

    if (savedCards) {
      payload.saved_card = getSavedCardMeta(savedCards);
      payload.card_type = 'NA';
    } else {
      payload.card_type = get(currentCardType) || 'NA';
      payload.saved_card = 'NA';
    }

    Analytics.track(EVENTS.OTP_ENTERED, {
      type: AnalyticsTypes.BEHAV,
      data: payload,
    });
  } catch (e: any) {
    capture(e.message, { severity: SEVERITY_LEVELS.S2, unhandled: true });
  }
};
