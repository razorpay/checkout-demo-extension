import type { PreferencesObject } from 'razorpay/types/Preferences';

const isOffersAvailableCache: { [order_id: string]: Offers.OffersList } = {};

export function isOffersAvailable(
  prefs: PreferencesObject,
  orderId: string
): boolean {
  if (!isOffersAvailableCache[orderId]) {
    isOffersAvailableCache[orderId] = prefs.offers ?? [];
  }

  return !!isOffersAvailableCache[orderId].length;
}
