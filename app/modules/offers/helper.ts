import { appliedOffer } from 'offers/store';
import { getAmount } from 'razorpay';
import { get } from 'svelte/store';

export function getAppliedOffer(): Offers.OfferItem | null {
  return get(appliedOffer);
}

/**
 * Says whether or not the offer is applicable
 * on the provided offer.
 * @param {string} issuer
 * @param {Offer} offer
 *
 * @return {boolean}
 */
export function isOfferApplicableOnIssuer(issuer: string) {
  issuer = issuer.toLowerCase();
  const offer = getAppliedOffer();

  if (!offer) {
    return false;
  }

  const offerIssuer = (offer.issuer || '').toLowerCase(),
    offerNetwork = (offer.payment_network || '').toLowerCase();

  if (issuer === 'amex') {
    return !offerNetwork || offerNetwork === issuer;
  }

  return !offerIssuer || offerIssuer === issuer;
}

/**
 * Returns the discounted amount if there's
 * an amount with the offer applied.
 *
 * @returns {Number}
 */
export function getDiscountedAmount() {
  const appliedOffer = getAppliedOffer();
  return (appliedOffer && appliedOffer.amount) || getAmount();
}
