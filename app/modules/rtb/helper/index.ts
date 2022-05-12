import { getPreferences } from 'razorpay';
import { get } from 'svelte/store';
import { Events, MetaProperties } from 'analytics';
import { contact } from 'checkoutstore/screens/home';
import { RTBExperiment } from 'rtb/store';
import { RTBExperimentEvents } from 'rtb/events';
import type { EmptyObject } from 'types';
import * as RTB from 'rtb/types/rtb';

const RTB_EXPERIMENT_VARIANTS_ALLOWED: RTB.ExperimentVariants[] = [
  RTB.ExperimentVariants.NotApplicable,
  RTB.ExperimentVariants.Show,
];

export function isRTBEnabled(data: RTB.RTBExperiment | EmptyObject): boolean {
  const isRTBEnabledForMerchant = getPreferences('rtb');
  if (isRTBEnabledForMerchant) {
    // If experiment is present, then look at the allowed variants and then decide whether or not RTB is to be shown
    if (data?.experiment) {
      return isRTBExperimentVariantAllowed(data as RTB.RTBExperiment);
    }
    return true;
  }
  return false;
}

function isRTBExperimentVariantAllowed(rtb: RTB.RTBExperiment): boolean {
  return (
    rtb.experiment && RTB_EXPERIMENT_VARIANTS_ALLOWED.includes(rtb.variant)
  );
}

export function setRTBVariant(exp: RTB.RTBExperiment) {
  const rtbExperiment = get(RTBExperiment);

  if (!rtbExperiment?.variant && !!exp?.variant) {
    RTBExperiment.update((val) => ({ ...val, ...exp }));

    (Events as any).TrackMetric(RTBExperimentEvents.EXPERIMENT_VARIANT, {
      rtb_experiment_variant: exp.variant,
      contact: get(contact),
    });
    (Events as any).setMeta(MetaProperties.RTB_EXPERIMENT_VARIANT, exp.variant);
  }
}

export function getRTBAnalyticsPayload() {
  const rtb = get(RTBExperiment);
  return {
    rtb_experiment_variant: rtb?.variant || null,
    contact: get(contact),
  };
}
