import { getBankFromCard } from 'common/bank';
import { getOrderId, getAmount, makeAuthUrl } from 'checkoutstore';
import { writable, derived } from 'svelte/store';
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
      const bank = getBankFromCard($cardIin);
      if (!bank) {
        set(false);
      } else {
        const issuer =
          $appliedOffer[bank.code === 'AMEX' ? 'payment_network' : 'issuer'];
        if (!bank || issuer !== bank.code) {
          set(false);
        }
      }
      return;
    }

    let url = makeAuthUrl('validate/checkout/offers');

    url = _.appendParamsToUrl(url, { language_code: getCurrentLocale() });

    currentRequest = fetch.post({
      url,
      data: {
        amount: getAmount(),
        method: 'card',
        'card[number]': $cardIin,
        order_id: getOrderId(),
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
