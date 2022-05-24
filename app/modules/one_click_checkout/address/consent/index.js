import { pushOverlay } from 'navstack';
import AddressConsentModal from 'one_click_checkout/address/consent/ui/AddressConsentModal.svelte';
import AddressConsentError from 'one_click_checkout/address/consent/ui/AddressConsentError.svelte';

/**
 * Method to show the Address Consent modal
 */
export function showAddressConsentModal(props) {
  pushOverlay({
    component: AddressConsentModal,
    props,
  });
}

/**
 * Method to show the Address Consent Error modal
 */
export function showAddressConsentError(props) {
  pushOverlay({
    component: AddressConsentError,
    props,
  });
}
