import {
  getSelectedEmiBank,
  selectedInstrumentCardlessEligible,
} from 'checkoutstore/screens/emi';
import { contact, emiContact } from 'checkoutstore/screens/home';
import { getSession } from 'sessionmanager';
import { get } from 'svelte/store';
import * as I18n from 'i18n';
import { moveControlToSession } from 'navstack';
import { screenStore } from 'checkoutstore';
import { getImageUrl } from 'common/cardlessemi';
import type { CardlessEMIStore } from 'emiV2/types';
import { resetCount } from 'common/otpservice';
import { getCardlessPlansForProvider, updateCardlessEmiStore } from './helper';
import Analytics from 'analytics';
import { BEHAV } from 'analytics-types';
import fetch from 'utils/fetch';
import type { CardlessEmiCallbackData, CardlessParams } from '../types/payment';

export const getEmiContact = () => {
  let currentEmiContact = get(emiContact);

  if (!currentEmiContact) {
    currentEmiContact = get(contact);
  }

  currentEmiContact = `+91${get(emiContact)}`;

  return currentEmiContact;
};

export const fetchCardlessEmiPlans = (params: CardlessParams = {}) => {
  const providerCode = getSelectedEmiBank()?.code;
  const session = getSession();
  const currentEmiContact = getEmiContact();

  const incorrectOtp = params.incorrect;

  if (!currentEmiContact) {
    return;
  }

  if (!providerCode) {
    return;
  }

  const topbarImages = getImageUrl(providerCode);

  session.topBar.setTitleOverride('otp', 'image', topbarImages);
  session.setOneCCTabLogo(topbarImages);

  session.otpView.updateScreen({
    showCtaOneCC: false,
  });

  const locale = I18n.getCurrentLocale();

  moveControlToSession(true);

  session.commenceOTP('cardlessemi_sending', 'cardless_emi_enter', {
    phone: currentEmiContact,
    provider: I18n.getCardlessEmiProviderName(providerCode, locale),
  });

  if (session.screen !== 'otp') {
    return;
  }

  const callback = function () {
    let otpMessageView = 'cardlessemi_plans';

    if (incorrectOtp) {
      otpMessageView = 'incorrect_otp_retry';
    }

    const locale = I18n.getCurrentLocale();
    session.askOTP(session.otpView, otpMessageView, true, {
      phone: currentEmiContact,
      provider: I18n.getCardlessEmiProviderName(providerCode, locale),
    });
    session.otpView.updateScreen({
      allowSkip: false,
      showCtaOneCC: true,
      ctaOneCCDisabled: false,
      disableCTA: false,
    });
  };

  const resend = params.resend;

  const cardlessEmiStore: CardlessEMIStore | null = getCardlessPlansForProvider(
    providerCode,
    currentEmiContact
  );
  if (cardlessEmiStore && cardlessEmiStore.urls) {
    const resendUrl: string =
      (cardlessEmiStore.urls[providerCode] &&
        cardlessEmiStore.urls[providerCode].resend_otp) ||
      '';

    if (resend && resendUrl) {
      Analytics.track('otp:resend', {
        type: BEHAV,
        data: {
          cardless_emi: providerCode,
        },
      });

      fetch.post({
        url: resendUrl,
        data: {
          contact: currentEmiContact,
        },
        callback: callback,
      });
    } else {
      callback();
    }
  }
};

export const cardlessEmiCallBack = (
  msg?: string,
  data: CardlessEmiCallbackData = {}
) => {
  const session = getSession();
  const providerCode: string = getSelectedEmiBank()?.code || '';

  if (!providerCode) {
    return;
  }

  if (msg) {
    session.otpView.updateScreen({
      showCtaOneCC: true,
    });
    fetchCardlessEmiPlans({
      incorrect: true,
    });
  } else {
    // OTP verification successful
    resetCount('razorpay');

    const cardlessEmiObject: CardlessEMIStore = {
      providerCode,
      contact: getEmiContact(),
      ott: data.ott,
      loan_url: data.loan_url,
      lenderBranding: data.lender_branding_url,
    };

    if (data.emi_plans) {
      [
        (cardlessEmiObject.plans = {
          [providerCode]: data.emi_plans,
        }),
      ];
    }

    // Update the cardless emi plans in the cardlessemistore
    // for the selected contact and provider name
    updateCardlessEmiStore(cardlessEmiObject);

    // Enable the eligibility check to render the plans
    selectedInstrumentCardlessEligible.set(true);

    screenStore.set('emiPlans');
    session.screen = 'emiPlans';

    moveControlToSession(false);
  }
};
