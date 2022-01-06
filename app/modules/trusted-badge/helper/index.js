import { getPreferences } from 'razorpay';
import { get } from 'svelte/store';
import { RTB } from 'checkoutstore/rtb';

import { contact } from 'checkoutstore/screens/home';

const TRUSTED_BADGE_EXPERIMENT_VARIANTS = ['not_applicable', 'rtb_show'];

export function getTrustedBadgeHighlights(data) {
  if (getPreferences('rtb') && checkTrustedBadgeAvailbility(data)) {
    return getPreferences('rtb') && checkTrustedBadgeAvailbility(data);
  } else if (getPreferences('rtb') && !data.experiment) {
    return getPreferences('rtb');
  }
}
function checkTrustedBadgeAvailbility(rtb) {
  return (
    rtb.experiment && TRUSTED_BADGE_EXPERIMENT_VARIANTS.includes(rtb.variant)
  );
}
export function setTrustedBadgeVariant(exp) {
  if (!get(RTB).variant) {
    let rtb;
    if (
      getPreferences('rtb_experiment') &&
      checkTrustedBadgeAvailbility(getPreferences('rtb_experiment'))
    ) {
      rtb = getPreferences('rtb_experiment');
    } else if (getPreferences('rtb') && checkTrustedBadgeAvailbility(exp)) {
      rtb = exp;
    } else {
      rtb = exp;
    }
    RTB.update((val) => ({ ...val, ...rtb }));
  }
}

export function getTrustedBadgeAnaltyicsPayload() {
  return {
    rtb_experiment_variant: get(RTB).variant,
    contact: get(contact),
  };
}
