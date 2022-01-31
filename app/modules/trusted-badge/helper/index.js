import { getPreferences } from 'razorpay';
import { get } from 'svelte/store';
import { RTB } from 'checkoutstore/rtb';
import Analytics, { Events, MetaProperties } from 'analytics';
import { contact } from 'checkoutstore/screens/home';
import * as AnalyticsTypes from 'analytics-types';

const TRUSTED_BADGE_EXPERIMENT_VARIANTS = ['not_applicable', 'rtb_show'];

export function getTrustedBadgeHighlights(data) {
  if (getPreferences('rtb')) {
    if (checkTrustedBadgeAvailbility(data)) {
      return true;
    }
    if (!data.experiment) {
      return getPreferences('rtb');
    }
  }

  return false;
}
function checkTrustedBadgeAvailbility(rtb) {
  return (
    rtb.experiment && TRUSTED_BADGE_EXPERIMENT_VARIANTS.includes(rtb.variant)
  );
}
export function setTrustedBadgeVariant(exp, sendAnalytics = true) {
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
    if (sendAnalytics) {
      if (rtb.variant) {
        Analytics.track('RTB_experiment_variant', {
          type: AnalyticsTypes.METRIC,
          data: {
            rtb_experiment_variant: rtb.variant,
            contact: get(contact),
          },
        });
        Events.setMeta(MetaProperties.RTB_EXPERIMENT_VARIANT, rtb.variant);
      }
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
