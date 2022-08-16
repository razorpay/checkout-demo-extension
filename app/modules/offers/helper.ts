import { appliedOffer } from 'offers/store';
import { getAmount } from 'razorpay';
import { getAllOffers } from 'checkoutframe/offers';
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

export const showOffersOnSelectedCurrncy = (currency: string) => {
  /*
Intentionally kept currency && currency.toUpperCase() 
instead of currency?.toUpperCase()
Reason for this is by default currency is empty string, 
and we assume it as INR, so if we keep later check 
then we fail to load offers even though it is INR.
  */
  if (currency && currency.toUpperCase() !== 'INR') {
    return false;
  }
  const allOffers = (getAllOffers() || []) as Array<Offers.OfferItem>;
  if (allOffers?.length) {
    return true;
  }
  return false;
};
