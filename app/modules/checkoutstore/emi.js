import { writable, derived, get } from 'svelte/store';

export const selectedPlanTextForNewCard = writable('');
export const selectedPlanTextForSavedCard = writable('');
export const newCardEmiDuration = writable('');

export const selectedTokenId = writable(null);
export const selectedPlan = writable();
export const emiDurations = writable({});

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
