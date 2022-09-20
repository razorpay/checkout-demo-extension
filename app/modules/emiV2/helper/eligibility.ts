import { getSelectedEmiBank } from 'emiV2/store';
import { selectedInstrumentCardlessEligible } from 'emiV2/ui/components/EmiTabsScreen/store';
import { get } from 'svelte/store';
import { emiContact, contact } from 'checkoutstore/screens/home';
import { handleEmiPaymentV2 } from 'emiV2/payment';
import { getCardlessPlansForProvider } from '../payment/cardlessEmi/helper';
import { clearPaymentRequest } from 'emiV2/payment/prePaymentHandler';

export const getEmiContactValue = () => {
  // use global contact if not passed in param -> Case when we make the API call as soon as we land on the contact page
  let emiContactValue: string = get(emiContact);
  if (!emiContactValue) {
    emiContactValue = get(contact);
  }
  if (!emiContactValue.match(/^\+91/)) {
    emiContactValue = '+91' + emiContactValue;
  }
  return emiContactValue;
};

export const getEmiProviderCode = () => {
  const provider = getSelectedEmiBank();
  const bankCode = provider?.code?.toLowerCase();
  return bankCode;
};

/**
 * Helper function to check whether the cardless emi plans already exists in store.
 * Prevents the api call if plans are found
 */
export const cardlessEmiPlansChecker = () => {
  const contact: string = getEmiContactValue();
  const provider = getEmiProviderCode();

  if (!provider) {
    return null;
  }

  const filteredPlanForContactNumber = getCardlessPlansForProvider(
    provider,
    contact
  );

  if (filteredPlanForContactNumber && filteredPlanForContactNumber.plans) {
    return filteredPlanForContactNumber;
  }

  return null;
};

/**
 * Helper function to check for cardless emi eligibility for selected provider
 * If the eligibility is already checked for the number and provider
 * We retreive the emi plans from the store
 * Else make an Ajax Request to check for eligibilty
 * If the user has already checked eligiblity and has changed the contact now
 * Clear the existing Ajax request
 * @returns
 */
export const checkEligibility = () => {
  // Check whether the emi plan already exists for that contact and bank in the store
  if (cardlessEmiPlansChecker()) {
    selectedInstrumentCardlessEligible.set(true);
    return;
  }

  /** If a request for eligibility already exists but the user clicks on check eligiblity
   * Clear the existing payment request
   */
  clearPaymentRequest();

  handleEmiPaymentV2({
    action: 'cardless',
    payloadData: {
      contact: getEmiContactValue(),
      provider: getEmiProviderCode(),
    },
    cardlessEligibilityFlow: true,
  });
  return;
};
