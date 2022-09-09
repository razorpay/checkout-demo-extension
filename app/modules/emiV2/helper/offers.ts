import { getAllOffers } from 'checkoutframe/offers';
import { selectedPlan } from 'checkoutstore/emi';
import { appliedOffer } from 'offers/store';
import { get } from 'svelte/store';
import CTAStore from 'cta/store';
import { getAmount } from 'ui/components/MainModal/helper';

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
