import { writable, derived } from 'svelte/store';
import { getSession } from 'sessionmanager';
import { displayAmount } from 'common/currency';
import { isCardValidForOffer } from 'checkoutstore/offers';

import { locale } from 'svelte-i18n';

import { formatTemplateWithLocale } from 'i18n';

const CtaViews = {
  AMOUNT: 'amount',
  CONTINUE: 'continue',
  SUBMIT: 'submit',
  NEXT: 'next',
  PROCEED: 'proceed',
  COPY_DETAILS: 'copy_details',
  COPIED: 'copied',
  AUTHENTICATE: 'authenticate',
  VIEW_EMI_PLANS: 'view_emi_plans',
  SELECT_EMI_PLAN: 'select_emi_plan',
  ENTER_CARD_DETAILS: 'enter_card_details',
  CONFIRM_ACCOUNT: 'confirm_account',
  VERIFY: 'verify',
  PAY_WITHOUT_OFFER: 'pay_without_offer',
  PAY_SINGLE_METHOD: 'pay_single_method',
  UPLOAD_NACH_FORM: 'upload_nach_form',
};

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
  setView(CtaViews.PAY_SINGLE_METHOD, true, { method });
}

export function showCopyDetails() {
  setView(CtaViews.COPY_DETAILS, true);
}

export function showCopied() {
  setView(CtaViews.COPIED, true);
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
    const offer = session.getAppliedOffer();
    const amount = (offer && offer.amount) || session.get('amount');
    setView(CtaViews.AMOUNT, false, {
      amount: displayAmount(session.r, amount),
    });
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

/**
 * Shows the CTA
 */
export function showCta() {
  const session = getSession();

  _El.addClass(session.body[0], 'sub');
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
