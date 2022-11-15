import { getAllOffers } from 'checkoutframe/offers';
import { selectedPlan } from 'checkoutstore/emi';
import { appliedOffer } from 'offers/store';
import { get } from 'svelte/store';
import CTAStore from 'cta/store';
import { getAmount } from 'ui/components/MainModal/helper';
import type { EMIBANKS, EMIOptionsMap } from 'emiV2/types';
import { emiMethod, selectedBank } from 'emiV2/store';

/**
 * Helper function to remove Auto applied no cost emi offer
 * Use Case: When user is switching tabs / when user is paying full amount
 */

export const removeNoCostOffer = () => {
  const offerApplied: Offers.OfferItem | null = get(appliedOffer);
  if (offerApplied && offerApplied.emi_subvention) {
    appliedOffer.set(null);
  }
};

/**
 * Find a no cost emi offer for the selected plan and auto apply
 */
export const applyNoCostOffer = (offerId: string) => {
  const allOffers = (getAllOffers() || []) as Array<Offers.OfferItem>;
  // if any other offer is already applied and we are on emi tab
  // we need to remove the offer
  if (allOffers?.length) {
    const offerToApply = allOffers.find(
      (offer: Offers.OfferItem) => offer.id === offerId
    );
    if (offerToApply) {
      // CTA state not getting updated for amount on applying NC EMI
      // if card or any other if applicable
      appliedOffer.set(offerToApply);
      const amount = Number(getAmount());
      CTAStore.setAmount(amount);
    }
  }
};

/**
 * Helper function to apply or remove no cost emi offer based on plan selection
 */
export const handlePlanOffer = () => {
  const plan: EMIPlanView.EMIPlanDurationData = get(selectedPlan);
  if (plan.subvention === 'merchant') {
    applyNoCostOffer(plan.offer_id ?? '');
  } else {
    /**
     * Remove the auto applied NC EMI offer if selected plan is not No Cost EMI
     */
    if (get(appliedOffer)?.emi_subvention) {
      appliedOffer.set(null);
    }
  }
};

/**
 * Remove applied offer if the selected method does not
 * match the offer method
 * @param method String
 */
export const removeAppliedOfferForMethod = (method: string) => {
  const offerApplied: Offers.OfferItem | null = get(appliedOffer);
  if (offerApplied && offerApplied.payment_method !== method) {
    appliedOffer.set(null);
  }
};

/**
 * helper function to check if offer issuer matches the emi provider
 * @param {EMIBANKS} emiProvider
 * @returns {boolean}
 */
export const filterOfferIssuer = (emiProvider: EMIBANKS) => {
  const offerApplied: Offers.OfferItem | null = get(appliedOffer);

  // If Amex offer is applied we need to check for offer network since issuer can be null
  const appliedOfferIssuer =
    offerApplied?.payment_network === 'AMEX'
      ? offerApplied.payment_network
      : offerApplied?.issuer;

  return offerApplied && appliedOfferIssuer === emiProvider.code;
};

/**
 * Helper function to auto-select the emi provider
 * if an offer is applied for a specific issuer
 * Note: Since emi options are grouped into bank and other emi options
 * Therefore we need to check both the lists to validate the offer issuer and select it
 * @param {EMIOptionsMap} emiProviders
 */
export const selectEmiInstrumentForOffer = (emiProviders: EMIOptionsMap) => {
  if (emiProviders && Object.keys(emiProviders).length > 0) {
    const bankEmiProviders = emiProviders.bank;
    const otherEmiProviders = emiProviders.other;

    const offerIssuerMatchesBankEmiProvider = bankEmiProviders.find(
      (provider) => {
        return filterOfferIssuer(provider);
      }
    );
    const offerIsssuerMatchesOtherEmiProvider = otherEmiProviders.find(
      (provider) => {
        return filterOfferIssuer(provider);
      }
    );

    // If offer issuer matches the bank emi provider
    // filter the provider from bankEmiProviders list
    if (offerIssuerMatchesBankEmiProvider) {
      selectedBank.set(offerIssuerMatchesBankEmiProvider);
      emiMethod.set('bank');
    } else if (offerIsssuerMatchesOtherEmiProvider) {
      // If offer issuer matches the other emi provider like cardless emis
      // filter the provider from otherEmiProviders list
      selectedBank.set(offerIsssuerMatchesOtherEmiProvider);
      emiMethod.set('other');
    }
  }
};
