// svelte imports
import { get } from 'svelte/store';

// analytics imports
import { Events } from 'analytics';
import EVENTS from 'one_click_checkout/customer/analytics';

// store imports
import {
  customerConsentCheckboxState,
  customerConsentStatus,
  shouldShowConsentCheckbox,
} from 'one_click_checkout/customer/store';
import { customerConsentDefaultAccept } from 'razorpay';

// service imports
import * as Service from 'one_click_checkout/customer/service';

export const setCustomerConsentStatus = (status = 0) => {
  customerConsentStatus.set(status === 1);
};

export const setCustomerConsentCheckboxStatus = () => {
  if (customerConsentDefaultAccept()) {
    customerConsentCheckboxState.set(true);
    return;
  }
  customerConsentCheckboxState.set(false);
};

export const updateCustomerConsent = async (consent: boolean) => {
  try {
    if (
      get(shouldShowConsentCheckbox) &&
      consent !== get(customerConsentStatus)
    ) {
      await Service.updateCustomerConsent(consent);
      customerConsentStatus.set(consent);
    }
  } catch (error) {
    console.log(error);
    Events.TrackMetric(EVENTS.UPDATE_CUSTOMER_CONSENT_FAILED);
  }
};
