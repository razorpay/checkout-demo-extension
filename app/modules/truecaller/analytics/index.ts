import Analytics from 'analytics';
import { getPrefilledContact, getPrefilledEmail } from 'checkoutframe/customer';
import { isLoggedIn } from 'checkoutstore/customer';
import { get } from 'svelte/store';
import type { TruecallerVariantNames } from 'truecaller/types';

/**
 * Sets meta properties for truecaller related features.
 */
export function setTruecallerMetaData() {
  if (get(isLoggedIn)) {
    return;
  } // Don't consider logged in case

  Analytics.setMeta('email_prefilled', !!getPrefilledEmail());
  Analytics.setMeta('contact_prefilled', !!getPrefilledContact());
}

export function startTruecallerTimer(variant: TruecallerVariantNames) {
  const start = Date.now();
  return function endTruecallerTimer() {
    const end = Date.now();
    return {
      screen: variant,
      total_response_time: (end - start) / 1000,
      initiated_at: end,
      completed_at: start,
    };
  };
}
