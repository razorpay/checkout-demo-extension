import { writable, derived, get } from 'svelte/store';
import { getSession } from 'sessionmanager';
import { displayAmount } from 'common/currency';
import { isCardValidForOffer } from 'checkoutstore/offers';
import { isCustomerFeeBearer } from 'checkoutstore/index';
import { CtaViews } from 'ui/labels/cta';

import { locale } from 'svelte-i18n';
import { formatTemplateWithLocale } from 'i18n';

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
  cta.subscribe(text => {
    const span = _Doc.querySelector('#footer > span');

    if (span) {
      _El.setContents(span, text);
    }
  });
}

let withoutOffer = false;
isCardValidForOffer.subscribe(value => {
  withoutOffer = !value;
  setAppropriateCtaText();
});

export function getStore() {
  return cta;
}

/**
 * Sets the view to be shown in the CTA
 * @param {string} view the view
 * @param {boolean} show whether to make CTA visible or not
 * @param {Object} data
 */
function setView(view, show = false, data = {}) {
  ctaInfo.set({ view, data });
  if (show) {
    showCta();
  }
}

export function showAmount(amount) {
  setView(CtaViews.AMOUNT, true, { amount });
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

export function showPayViaSingleMethod(method) {
  if (isCustomerFeeBearer()) {
    setView(CtaViews.PAY, false);
  } else {
    setView(CtaViews.PAY_SINGLE_METHOD, true, { method });
  }
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
      setView(CtaViews.PAY, false);
    } else {
      const offer = session.getAppliedOffer();
      let amount = (offer && offer.amount) || session.get('amount');

      if((offer && offer.payment_method === 'card') && !get(isCardValidForOffer)) {
        /**
         * invalid card offer use original amount
         */
        amount = session.get('amount');
      }
      let currency = 'INR';
      if (offer && session.dccPayload) {
        /** value of dccPayload set via DynamicCurrencyView.svelte */
        if(session.dccPayload.enable && session.dccPayload.currency) {
          currency = session.dccPayload.currency;
        }
        if(session.dccPayload.enable && session.dccPayload.currencyPayload && session.dccPayload.currencyPayload.all_currencies) {
          amount = session.dccPayload.currencyPayload.all_currencies[currency].amount;
        }
      }
      setView(CtaViews.AMOUNT, false, {
        amount: displayAmount(session.r, amount, currency),
      });
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
      setView(CtaViews.PAY_WITHOUT_OFFER);
    } else {
      showAmountInCta();
    }
  }
}

const trackCTAVisibility = _Func.debounce(function() {
  // To figure out cases when CTA is shown logically
  // but is not visible physically.
  setTimeout(function() {
    const session = getSession();

    const el = _Doc.querySelector('#footer-cta');
    if (!el) {
      return;
    }
    const bottom = el.getBoundingClientRect().bottom;
    const windowHeight = window.innerHeight;
    const ctaVisible = bottom <= windowHeight;

    session.trackEvent('cta:show', {
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
  const session = getSession();

  _El.addClass(session.body[0], 'sub');

  try {
    trackCTAVisibility();
  } catch (e) {}
}

/**
 * Hides the CTA
 */
export function hideCta() {
  const session = getSession();

  _El.removeClass(session.body[0], 'sub');
}

/**
 * Tells whether or not the CTA is shown
 *
 * @returns {boolean}
 */
export function isCtaShown() {
  const session = getSession();

  return _El.hasClass(session.body[0], 'sub');
}

/**
 * Shows the CTA with appropriate text.
 */
export function showCtaWithDefaultText() {
  setAppropriateCtaText();
  showCta();
}
