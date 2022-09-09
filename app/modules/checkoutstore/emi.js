import { getMerchantMethods } from 'razorpay';
import { writable, derived, get } from 'svelte/store';

export const selectedPlanTextForNewCard = writable('');
export const selectedPlanTextForSavedCard = writable('');
export const newCardEmiDuration = writable('');

export const selectedTokenId = writable(null);
export const selectedPlan = writable();
export const emiDurations = writable({});
export const bajajTCAccepted = writable(false);
export const bajajTCAcceptedConsent = writable(false);

export const savedCardEmiDuration = derived(
  [selectedTokenId, emiDurations],
  ([selectedTokenId, emiDuration]) => emiDuration[selectedTokenId]
);

export function getEmiDurationForNewCard() {
  return get(newCardEmiDuration);
}

export function getEmiDurationForSavedCard() {
  return get(savedCardEmiDuration);
}

export function setEmiDurationForSavedCard(duration) {
  const $emiDurations = get(emiDurations);
  const $selectedToken = get(selectedTokenId);

  $emiDurations[$selectedToken] = duration;

  emiDurations.set($emiDurations);
}

export function getBajajTCAccepted() {
  return get(bajajTCAccepted);
}

export function setBajajTCAcceptedConsent() {
  bajajTCAcceptedConsent.set(true);
}

export const isCurrentCardInvalidForEmi = writable(false);

export const isCurrentCardProviderInvalid = writable(false);

export const isCardValidForEMiPayment = () => {
  return !get(isCurrentCardInvalidForEmi);
};

export const isNoCostEmiAvailable = writable(false);

const isNoCostAvailable = (emiPlans) => {
  return emiPlans.some((option) => {
    // If subvention is merchant it means that the selected emi plan is a no cost emi plan
    return option.subvention === 'merchant';
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
