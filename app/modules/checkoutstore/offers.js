import { getBankFromCard } from 'common/bank';
import { getOrderId, getAmount, makeAuthUrl } from 'checkoutstore';
import { writable, derived } from 'svelte/store';
import { cardIin } from 'checkoutstore/screens/card';

export const appliedOffer = writable();

let currentRequest;
export const isCardValidForOffer = derived(
  [appliedOffer, cardIin],
  ([$appliedOffer, $cardIin], set) => {
    set(true);
    if (currentRequest) {
      currentRequest.abort();
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
    currentRequest = fetch.post({
      url: makeAuthUrl('validate/checkout/offers'),
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
          set(false);
        }
      },
    });
  }
);
