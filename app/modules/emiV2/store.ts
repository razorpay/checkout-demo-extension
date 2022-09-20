import { get, Writable, writable } from 'svelte/store';
import type { EMIBANKS, EmiPlan, EmiPlans } from 'emiV2/types';
import { getMerchantMethods } from 'razorpay';

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

export const getSelectedEmiBank = () => {
  return get(selectedBank);
};

// State to store the selected cardless emi provider zestmoney, earlysalary etc.
export const selectedCardlessEmiProvider = writable('');

/**
 * Storing value in flag if user reached emi screen from cards screen
 */
export const emiViaCards = writable(false);

// State to store whether any bank exists with No Cost EMI plan
// Used to show the No cost label on L0 screen
export const isNoCostEmiAvailable = writable(false);

/**
 * Checks if the plan is no cost emi plan
 * If subvention is merchant return true
 * @param {EmiPlan} plan
 * @returns {boolean}
 */
const isCurrentPlanNoCost = (plan: EmiPlan) => {
  return plan.subvention === 'merchant';
};

export const isNoCostAvailable = (emiPlans: EmiPlans) => {
  return emiPlans.some((plan) => {
    // If subvention is merchant it means that the selected emi plan is a no cost emi plan
    return isCurrentPlanNoCost(plan);
  });
};

/**
 * Returns whether no cost emi is available for any of the emi options (For No Cost Emi label in L0 screen)
 * Checks if any plan has subvention = 'merchant'
 * Note: We dont't need to explicitly check for interest to be zero for NC EMI
 * @returns {boolean}
 */
export function setNoCostAvailable() {
  let noCostAvailable = false;
  const options = getMerchantMethods().emi_options;
  if (!options) {
    noCostAvailable = false;
  } else {
    noCostAvailable = Object.keys(options).some((option) => {
      const emiPlans = options[option];
      return isNoCostAvailable(emiPlans);
    });
  }
  isNoCostEmiAvailable.set(noCostAvailable);
  return noCostAvailable;
}

// State to store whether current card of selected bank has emi enabled
export const isCurrentCardInvalidForEmi = writable(false);

// State to store whether current card entered matches the selected bank and tab
export const isCurrentCardProviderInvalid = writable(false);

export const isCardValidForEMiPayment = () => {
  return !get(isCurrentCardInvalidForEmi);
};
