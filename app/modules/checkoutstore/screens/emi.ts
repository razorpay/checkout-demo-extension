import { get, Writable, writable } from 'svelte/store';
import type { EMIBANKS, CardlessEMIStore } from 'emiV2/types';
import { selectedTab } from 'components/Tabs/tabStore';

const initialCardlessEmiStore: CardlessEMIStore[] = [];

/**
 * This state is for EMI selected bank option
 * And this is also used for the highlighting the tile in EMI L1 screen
 */
export const selectedBank: Writable<EMIBANKS | null> = writable(null);

/**
 * State to store th current emi instrument option
 * Whether it's a bank emi or other emi option
 */
export const emiMethod = writable('');

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

export const getSelectedEmiBank = () => {
  return get(selectedBank);
};

// State to store the current loading value when API call is being made to check eligibility
export const loadingEligibility = writable(false);

// State to store the selected cardless emi provider zestmoney, earlysalary etc.
export const selectedCardlessEmiProvider = writable('');

// State to store whether the current emi contact is valid
// Used to enable or disable payment button
export const isEmiContactValid = writable(true);

/**
 * Storing value in flag if user reached emi screen from cards screen
 */
export const emiViaCards = writable(false);

/**
 * Store whether phone number eligibility tooltip was clicked
 */
export const eligibilityInfoClicked = writable(false);

export const getCurrentTab = () => {
  return get(selectedTab);
};
