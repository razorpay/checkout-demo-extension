import { getBankFromCardCache } from 'common/bank';
import { getCardFeatures } from 'common/card';
import {
  getOrderId,
  getAmount,
  makeAuthUrl,
  isASubscription,
  getSubscription,
} from 'checkoutstore';
import { writable, derived, get } from 'svelte/store';
import { cardIin, cardTab } from 'checkoutstore/screens/card';
import Analytics from 'analytics';
import { BEHAV } from 'analytics-types';
import { getCurrentLocale } from 'i18n';

export const appliedOffer = writable();

let currentRequest;
export const isCardValidForOffer = derived(
  [appliedOffer, cardIin, cardTab],
  ([$appliedOffer, $cardIin, $cardTab], set) => {
    set(true);

    if (currentRequest) {
      currentRequest.abort();
    }

    // Validate only for cards
    if ($cardTab !== 'card') {
      return;
    }

    if (!($appliedOffer && $cardIin.length > 5)) {
      return;
    }

    const method = $appliedOffer.payment_method;
    if (method !== 'card' && method !== 'emi') {
      return;
    }
    if ($appliedOffer.emi_subvention) {
      getCardFeatures($cardIin).then(() => {
        // IIN changed, abort
        if (get(cardIin) !== $cardIin) {
          return;
        }

        const bank = getBankFromCardCache($cardIin);
        if (!bank) {
          set(false);
        } else {
          const issuer =
            $appliedOffer[bank.code === 'AMEX' ? 'payment_network' : 'issuer'];
          if (!bank || issuer !== bank.code) {
            set(false);
          }
        }
      });
      return;
    }

    let url = makeAuthUrl('validate/checkout/offers');

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
      callback: data => {
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
