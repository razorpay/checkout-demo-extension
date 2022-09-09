import { cardlessEmiStore } from 'checkoutstore/screens/emi';
import type { CardlessEMIStore } from 'emiV2/types';
import { get } from 'svelte/store';

/**
 * Helper function to update the cardless emi store
 * Updates the array of cardless emi store if contact and provider matches
 */
export const updateCardlessEmiStore = (storeValue: CardlessEMIStore) => {
  const cardlessEmiStorePlans: CardlessEMIStore[] = get(cardlessEmiStore);

  if (cardlessEmiStorePlans) {
    const updatedStore = cardlessEmiStorePlans.map((providerStore) => {
      if (
        providerStore.contact === storeValue.contact &&
        providerStore.providerCode === storeValue.providerCode
      ) {
        return {
          ...providerStore,
          ...storeValue,
        };
      }
      return {
        ...providerStore,
      };
    });
    cardlessEmiStore.set(updatedStore);
  }
};

/**
 * Helper function to get the cardless emi store
 * for respective provider and contact to avoid eligibility call
 */
export const getCardlessPlansForProvider = (
  provider: string,
  contact: string
): CardlessEMIStore | null => {
  const cardlessEmiStorePlans: CardlessEMIStore[] = get(cardlessEmiStore);
  const filteredPlanForContactNumber: CardlessEMIStore | undefined =
    cardlessEmiStorePlans.find(
      (plan) => plan.providerCode === provider && plan.contact === contact
    );
  // If plans dont exists for that provider and contact
  // return null
  if (!filteredPlanForContactNumber) {
    return null;
  }

  return filteredPlanForContactNumber;
};
