import RazorpayStore from 'razorpay';
import type { PreferencesObject } from 'razorpay/types/Preferences';
import { getSession } from 'sessionmanager';

export function setOffersInSessionAndStore(prefs: PreferencesObject) {
  const razorpayInstance = RazorpayStore.get();
  const session = getSession();
  razorpayInstance.preferences = prefs;
  RazorpayStore.updateInstance(razorpayInstance);
  session.setOffers();
}
