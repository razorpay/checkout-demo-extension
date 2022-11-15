import * as ChargesStore from 'one_click_checkout/charges/store';
import { getBankFromCardCache } from 'common/bank';
import { API_NETWORK_CODES_MAP, getCardFeatures } from 'common/card';
import { makeAuthUrl } from 'common/helper';
import {
  getAmount,
  getOrderId,
  getSubscription,
  isASubscription,
  isOneClickCheckout,
} from 'razorpay';
import { writable, derived, get, Writable, Readable } from 'svelte/store';
import { cardIin, cardTab } from 'checkoutstore/screens/card';
import Analytics from 'analytics';
import { BEHAV } from 'analytics-types';
import fetch, { FetchPrototype } from 'utils/fetch';
import * as _ from 'utils/_';

export const appliedOffer: Writable<Offers.OfferItem | null> = writable();
export const offerWindowOpen = writable(false);
export const showOfferAppliedStrip = writable(false);
export const offerErrorViewOpen = writable(false);

/**
 * to remove circular dep migrate from 1cc
 */
appliedOffer.subscribe((offer) => {
  const isOneCC = isOneClickCheckout();
  if (!isOneCC) {
    return;
  }
  let currentAmount =
    offer && isOneCC ? get(ChargesStore.cartAmount) : get(ChargesStore.amount);
  if (offer) {
    if (isOneCC) {
      const shippingCharges = get(ChargesStore.shippingCharge) || 0;
      const couponDis = get(ChargesStore.cartDiscount) || 0;
      currentAmount = currentAmount + shippingCharges - couponDis;
    }
    const offerDiscount =
      (offer as Offers.InstantDiscountOfferItem).original_amount -
        (offer as Offers.InstantDiscountOfferItem).amount || 0;

    currentAmount = currentAmount - offerDiscount;
    ChargesStore.offerAmount.set(offerDiscount);
  } else {
    currentAmount = currentAmount + get(ChargesStore.offerAmount);
    ChargesStore.offerAmount.set(0);
  }
  ChargesStore.amount.set(currentAmount);
});

let currentRequest: FetchPrototype | null;

export const isCardValidForOffer: Readable<boolean> = derived(
  [appliedOffer, cardIin, cardTab],
  ([$appliedOffer, $cardIin, $cardTab], set) => {
    set(true);

    if (currentRequest) {
      currentRequest.abort();
    }

    // Validate only for cards and emi
    if (!['card', 'emi'].includes($cardTab)) {
      return;
    }

    if (!$appliedOffer) {
      return;
    }

    // After applying Cred offer,
    // FE should not hit the offer API as Cred is a view only offer
    // which resides at CRED and not in Razorpay system.
    if (
      $appliedOffer?.id === 'CRED_experimental_offer' &&
      $cardTab === $appliedOffer?.payment_method
    ) {
      return;
    }

    if (!($appliedOffer && $cardIin.length > 5)) {
      return;
    }

    const method = $appliedOffer.payment_method;
    if (method !== 'card' && method !== 'emi') {
      return;
    }

    if ($appliedOffer.emi_subvention || method === 'emi') {
      getCardFeatures($cardIin)
        .then(() => {
          // IIN changed, abort
          if (get(cardIin) !== $cardIin) {
            return;
          }

          const bank = getBankFromCardCache($cardIin);
          if (!bank) {
            set(false);
          } else {
            const issuer =
              $appliedOffer[
                bank.code === 'AMEX' ? 'payment_network' : 'issuer'
              ];

            // Validate if a issuer specific order is applied
            // If card issuer and offer issuer do not match set false
            // If the card entered has a co-branding provider set false
            // Since for co-branding cards issuer specific offers do not work
            if (issuer && (issuer !== bank.code || bank.cobrandingPartner)) {
              set(false);
            }
            // Validate if the offer applied is on a specific network
            const offerNetworkCode: string = $appliedOffer['payment_network'];
            // Since with offer entity we have network code as MC, VISA therefore we need to map to actual network codes
            // Find the entry in API_NETWORK_CODES_MAP
            const network = Object.entries(API_NETWORK_CODES_MAP).find(
              (map) => map[0] === offerNetworkCode
            );

            if (network && network[1] !== bank.network) {
              set(false);
            }
          }
        })
        .catch(() => {
          console.error('Unable to fetch card features/meta');
        });
      return;
    }

    const url = makeAuthUrl(null, 'validate/checkout/offers');

    let orderId = getOrderId();

    if (isASubscription()) {
      const subscription = getSubscription();

      orderId = subscription.order_id;
    }

    currentRequest = fetch.post({
      url,
      data: {
        amount: getAmount(),
        method: 'card',
        'card[number]': $cardIin,
        order_id: orderId,
        offers: [$appliedOffer.id],
      },
      callback: (data) => {
        currentRequest = null;
        if (data.error || (_.isArray(data) && !data.length)) {
          // set card invalid for offer
          Analytics.track('offers:card_invalid', {
            type: BEHAV,
            data: {
              offer_id: $appliedOffer.id,
              iin: $cardIin,
            },
          });
          set(false);
        }
      },
    });
  }
);

export const amountAfterOffer = derived(
  [appliedOffer, isCardValidForOffer],
  ([$appliedOffer, $isCardValidForOffer]) => {
    if ($appliedOffer && $isCardValidForOffer) {
      return get(appliedOffer)?.amount;
    }
    return getAmount();
  }
);

/**
 * Store to control the visiblitity of offers tab
 */
export const showOffers = writable(true);
