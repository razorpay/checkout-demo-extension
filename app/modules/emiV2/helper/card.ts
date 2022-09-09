import { selectedCard } from 'checkoutstore/screens/card';
import type { Tokens } from 'emiV2/types';
import { get } from 'svelte/store';

// Helper function to get the saved card
export const getSelectedSavedCard = (): Tokens | null => {
  const selectedSavedCard: Tokens | null = get(selectedCard);
  if (selectedSavedCard) {
    return selectedSavedCard;
  }
  return null;
};
