import { writable, derived, get } from 'svelte/store';
import { getSession } from 'sessionmanager';
import { displayAmount, formatAmountWithSymbol } from 'common/currency';
import {
  isOneClickCheckout,
  isCustomerFeeBearer,
  isOfferForced,
  getAmount,
  isRedesignV15,
} from 'razorpay';
import { CtaViews } from 'ui/labels/cta';

import { locale } from 'svelte-i18n';
import { formatTemplateWithLocale } from 'i18n';
import { debounce } from 'lib/utils';
import * as _El from 'utils/DOM';
import { querySelector } from 'utils/doc';
import Analytics from 'analytics';
import CTAHelper from './store';

export const ctaInfo = writable({
  view: '',
  data: {},
});

export const cta = derived([ctaInfo, locale], ([$ctaInfo, $locale]) => {
  const { view, data } = $ctaInfo;
  if (!view) {
    return '';
  }
  const label = `cta.${view}`;
  return formatTemplateWithLocale(label, data, $locale);
});

export function init() {
  initSuscription();
  setAppropriateCtaText();
}

function initSuscription() {
  cta.subscribe((text) => {
    const span = querySelector('#footer > span');

    if (span) {
      _El.setContents(span, text);
    }
  });
}

let withoutOffer = false;
export function setWithoutOffer(value: boolean) {
  withoutOffer = value;
  setAppropriateCtaText();
}

export function getStore() {
  return cta;
}

/**
 * Sets the view to be shown in the CTA
 * @param {string} view the view
 * @param {boolean} show whether to make CTA visible or not
 * @param {Object} data
 */
function setView(view: string, show = false, data = {}) {
  if (isRedesignV15()) {
    // handle by CTA component use within svelte
    return;
  }
  ctaInfo.set({ view, data });
  if (show) {
    showCta();
  }
}

export function showAmount(amount?: string, show = true) {
  if (isRedesignV15()) {
    if (amount) {
      CTAHelper.setRawAmount(amount);
    }
    return;
  }
  setView(CtaViews.AMOUNT, show, { amount });
}

export function showContinue() {
  setView(CtaViews.CONTINUE, true);
}

export function showSubmit() {
  setView(CtaViews.SUBMIT, true);
}

export function showProceed() {
  setView(CtaViews.PROCEED, true);
}

export function showNext() {
  setView(CtaViews.NEXT, true);
}

export function showPayViaSingleMethod(method: string) {
  let label = '';
  if (isCustomerFeeBearer()) {
    label = `cta.${CtaViews.PAY}`;
    setView(CtaViews.PAY, true);
  } else {
    label = `cta.${CtaViews.PAY_SINGLE_METHOD}`;
    setView(CtaViews.PAY_SINGLE_METHOD, true, { method });
  }
  return {
    label,
    labelData: { method },
  };
}

export function showAuthenticate() {
  setView(CtaViews.AUTHENTICATE, true);
}

export function showViewEmiPlans() {
  setView(CtaViews.VIEW_EMI_PLANS, true);
}

export function showSelectEmiPlan() {
  setView(CtaViews.SELECT_EMI_PLAN, true);
}

export function showEnterCardDetails() {
  setView(CtaViews.ENTER_CARD_DETAILS, true);
}

export function showConfirmAccount() {
  setView(CtaViews.CONFIRM_ACCOUNT, true);
}

export function showVerify() {
  setView(CtaViews.VERIFY, true);
}

export function showPayWithoutOffer() {
  setView(CtaViews.PAY_WITHOUT_OFFER, true);
}

export function showUploadNachForm() {
  setView(CtaViews.UPLOAD_NACH_FORM, true);
}

/**
 * Shows amount in CTA.
 * If amount is 0, shows "Authenticate"
 */
export function showAmountInCta() {
  const session = getSession();

  if (!session.get('amount')) {
    setView(CtaViews.AUTHENTICATE, false);
  } else {
    if (isCustomerFeeBearer()) {
      setView(CtaViews.PAY, true);
    } else {
      const offer = session.getAppliedOffer();
      let amount = (offer && offer.amount) || session.get('amount');
      if (isOneClickCheckout()) {
        amount = session.get('amount');
      }

      /** withoutOffer = !get(isCardValidForOffer) */
      if (offer && offer.payment_method === 'card' && withoutOffer) {
        /**
         * invalid card offer use original amount
         */
        amount = session.get('amount');
      }
      let currency = session.get('currency') || 'INR';
      if (session.dccPayload) {
        /** value of dccPayload set via DynamicCurrencyView.svelte */
        if (session.dccPayload.enable && session.dccPayload.currency) {
          currency = session.dccPayload.currency;
        }
        if (
          session.dccPayload.enable &&
          session.dccPayload.currencyPayload &&
          session.dccPayload.currencyPayload.all_currencies
        ) {
          const dccAmount =
            session.dccPayload.currencyPayload.all_currencies[currency];

          if (dccAmount) {
            amount = dccAmount.amount;
          }
        }
      }
      showAmount(displayAmount(session.r, amount, currency), false);
    }
  }
}

/**
 * Sets the appropriate text for CTA.
 */
export function setAppropriateCtaText() {
  const session = getSession();
  if (!session) {
    return;
  }
  const tab = session.tab;

  if (tab === '') {
    if (session.homeTab?.onDetailsScreen()) {
      session.homeTab.setDetailsCta();
    } else {
      showAmountInCta();
    }
  } else {
    if (withoutOffer && (tab === 'card' || tab === 'emi')) {
      if (isOfferForced()) {
        setView(CtaViews.PAY);
        return;
      }
      setView(CtaViews.PAY_WITHOUT_OFFER);
    } else {
      showAmountInCta();
    }
  }
}

const trackCTAVisibility = debounce(function () {
  // To figure out cases when CTA is shown logically
  // but is not visible physically.
  setTimeout(function () {
    const el = querySelector('#footer-cta');
    if (!el) {
      return;
    }
    const bottom = el.getBoundingClientRect().bottom;
    const windowHeight = window.innerHeight;
    const ctaVisible = bottom <= windowHeight;
    Analytics.track('cta:show', {
      data: {
        ctaVisible,
        doctypeMissing: document.doctype === null,
        windowHeight,
        bottom,
      },
    });
  }, 300);
}, 300);

/**
 * Shows the CTA
 */
export function showCta() {
  if (isRedesignV15()) {
    return;
  }
  const session = getSession();
  if (session?.body?.[0]) {
    _El.addClass(session.body[0], 'sub');
  }

  try {
    trackCTAVisibility();
  } catch (e) {}
}

/**
 * Hides the CTA
 */
export function hideCta() {
  if (isRedesignV15()) {
    return;
  }
  const session = getSession();
  if (session?.body?.[0]) {
    _El.removeClass(session.body[0], 'sub');
  }
}

/**
 * Tells whether or not the CTA is shown
 *
 * @returns {boolean}
 */
export function isCtaShown() {
  if (isRedesignV15()) {
    return CTAHelper.isCTAShown();
  }
  const session = getSession();

  return _El.hasClass(session.body?.[0], 'sub');
}

/**
 * Shows the CTA with appropriate text.
 */
export function showCtaWithDefaultText() {
  setAppropriateCtaText();
  showCta();
}

export function getCTAAmount(): string {
  const store = get(CTAHelper.store);
  return (
    store.rawAmount ||
    formatAmountWithSymbol(store.amount || getAmount(), store.currency, false)
  );
}
