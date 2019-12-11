import { writable } from 'svelte/store';
import { getSession } from 'sessionmanager';
import { displayAmount } from 'common/currency';
import { TAB_TITLES } from 'common/constants';

export const cta = writable('');

cta.subscribe(text => {
  const span = _Doc.querySelector('#footer > span');

  if (span) {
    _El.setContents(span, text);
  }
});

export function getStore() {
  return cta;
}

export function updateCta(text) {
  cta.set(text);
}

/**
 * Shows amount in CTA.
 * If amount is 0, shows "Authenticate"
 */
export function showAmountInCta() {
  const session = getSession();

  if (!session.get('amount')) {
    updateCta('Authenticate');
  } else {
    const offer = session.getAppliedOffer();
    const amount = (offer && offer.amount) || session.get('amount');

    updateCta('PAY ' + displayAmount(session.r, amount));
  }
}

/**
 * Sets the appropriate text for CTA.
 */
export function setAppropriateCtaText() {
  const session = getSession();

  if (session.newHomeScreen) {
    if (session.tab === '') {
      if (session.homeTab.onDetailsScreen()) {
        session.homeTab.setDetailsCta();
      } else {
        showAmountInCta();
      }
    } else {
      showAmountInCta();
    }
  } else {
    if (!session.get('amount')) {
      updateCta('Authenticate');
    } else if (session.oneMethod && session.tab === '') {
      updateCta('Pay by ' + TAB_TITLES[session.oneMethod]);
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
 * Updates the CTA with provided text
 * and shows it.
 * @param {string} text
 */
export function showCtaWithText(text) {
  if (!text) {
    return;
  }

  updateCta(text);
  showCta();
}

/**
 * Shows the CTA with appropriate text.
 */
export function showCtaWithDefaultText() {
  setAppropriateCtaText();
  showCta();
}