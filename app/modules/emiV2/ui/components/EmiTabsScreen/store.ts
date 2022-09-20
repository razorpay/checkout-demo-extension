import { selectedTab } from 'components/Tabs/tabStore';
import type { CardlessEMIStore } from 'emiV2/types';
import { writable, get } from 'svelte/store';

const initialCardlessEmiStore: CardlessEMIStore[] = [];

/**
 * State to store whether the current contact number is eligible for cardless emi
 * for selected instrument like HDFC cardless, ICIC cardless etc.
 */
export const selectedInstrumentCardlessEligible = writable(false);

// State to store the error message when cardless emi eligibility checks fails
export const cardlessEligibilityError = writable('');

/**
 * Storing the cardless emi plans in store in an array
 * Since a single phone number can be linked with multiple banks
 */
export const cardlessEmiStore = writable(initialCardlessEmiStore);

// State to store the current loading value when API call is being made to check eligibility
export const loadingEligibility = writable(false);

// State to store whether the current emi contact is valid
// Used to enable or disable payment button
export const isEmiContactValid = writable(true);

/**
 * Store whether phone number eligibility tooltip was clicked
 */
export const eligibilityInfoClicked = writable(false);

/**
 * Store helper function to return the current tab is on
 * @returns {String} credit | debit | cardless | debit_cardless
 */
export const getCurrentTab = () => {
  return get(selectedTab);
};
