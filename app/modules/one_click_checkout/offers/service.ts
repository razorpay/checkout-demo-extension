import { get } from 'svelte/store';
import { getPreferences, getOrderId, isOffersFixExpEnabled } from 'razorpay';
import fetch from 'utils/fetch';
import { Events } from 'analytics';
import MagicOfferEvents from 'one_click_checkout/offers/analytics';
import { timer } from 'utils/timer';
import { amount } from 'one_click_checkout/charges/store';
import { makeAuthUrl } from 'common/makeAuthUrl';
import { setOffersInSessionAndStore } from './controller';
import * as _ from 'utils/_';
import { isOffersAvailable } from './cache';

export function getOffersWithUpdatedAmount(): Promise<void> {
  const preferences = getPreferences();
  const orderId = getOrderId();
  return new Promise((resolve, reject) => {
    if (!isOffersAvailable(preferences, orderId) || !isOffersFixExpEnabled()) {
      resolve();
      return;
    }
    const getDuration = timer();
    Events.TrackMetric(MagicOfferEvents.OFFERS_FETCH_START);
    fetch({
      url: _.appendParamsToUrl(makeAuthUrl(`order/${orderId}/payment_offers`), {
        amount: get(amount),
      }),
      callback: (response) => {
        Events.TrackMetric(MagicOfferEvents.OFFERS_FETCH_END, {
          time: getDuration(),
          success: response.ok ? true : false,
        });
        if (Array.isArray(response.offers)) {
          const updatedPrefs = { ...preferences, offers: response.offers };
          setOffersInSessionAndStore(updatedPrefs);
          resolve();
        } else {
          reject();
        }
      },
    });
  });
}
