import { isCustomerConsentFeatureEnabled } from 'razorpay';
import { derived, writable } from 'svelte/store';

export const customerConsentStatus = writable<boolean>(false);

export const customerConsentCheckboxState = writable<boolean>(false);

export const shouldShowConsentCheckbox = derived(
  [customerConsentStatus],
  ([$customerConsentStatus]) => {
    if (isCustomerConsentFeatureEnabled() && !$customerConsentStatus) {
      return true;
    }
    return false;
  }
);
