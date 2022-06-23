import * as ChargesStore from 'one_click_checkout/charges/store';
import { updateAmountFontSize } from 'checkoutframe/components/header';
import { getBankFromCardCache } from 'common/bank';
import { getCardFeatures } from 'common/card';
import { makeAuthUrl } from 'checkoutstore';
import {
  getAmount,
  getOption,
  getOrderId,
  getSubscription,
  isASubscription,
  isCustomerFeeBearer,
  isOneClickCheckout,
} from 'razorpay';
import { writable, derived, get, Writable, Readable } from 'svelte/store';
import { cardIin, cardTab } from 'checkoutstore/screens/card';
import Analytics from 'analytics';
import { BEHAV } from 'analytics-types';
import fetch, { FetchPrototype } from 'utils/fetch';
import { getSession } from 'sessionmanager';
import { formatAmountWithSymbol } from 'common/currency';
import { setAppropriateCtaText, setWithoutOffer } from 'checkoutstore/cta';

export const appliedOffer: Writable<Offers.OfferItem | null> = writable();

/**
 * to remove circular dep migrate from 1cc
 */
appliedOffer.subscribe((offer) => {
  if (!isOneClickCheckout()) {
    return;
  }
  let currentAmount = offer
    ? get(ChargesStore.cartAmount)
    : get(ChargesStore.amount);
  if (offer) {
    const shippingCharges = get(ChargesStore.shippingCharge) || 0;
    const couponDis = get(ChargesStore.cartDiscount) || 0;
    const offerDiscount =
      (offer as Offers.InstantDiscountOfferItem).original_amount -
        (offer as Offers.InstantDiscountOfferItem).amount || 0;
    currentAmount = currentAmount + shippingCharges - offerDiscount - couponDis;
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

    // Validate only for cards
    if ($cardTab !== 'card') {
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

    const url = makeAuthUrl('validate/checkout/offers');

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

export const computeOfferClass = derived(
  [appliedOffer, isCardValidForOffer],
  ([$appliedOffer, $isCardValidForOffer]) => {
    const session = getSession();
    const offer = $appliedOffer;
    let hasDiscount = Boolean(offer && offer.amount !== offer.original_amount);
    let currency = getOption('currency') || 'INR';
    let amount;

    if (offer) {
      if (isOneClickCheckout()) {
        amount = get(ChargesStore.amount);
      } else {
        amount = offer.amount;
      }
    }
    const { currency: dccCurrency, amount: dccAmount } =
      session.getDCCPayload();
    if (dccCurrency) {
      currency = dccCurrency;
    }
    if (dccAmount) {
      amount = dccAmount;
    }

    if (hasDiscount && session.offers) {
      hasDiscount = $isCardValidForOffer;
    }

    const hasDiscountAndFee = offer && isCustomerFeeBearer() && amount;
    const returnObj = {
      hasFee: Boolean(hasDiscountAndFee),
      hasDiscount: hasDiscount,
      discountAmount: hasDiscount
        ? formatAmountWithSymbol(amount, currency)
        : '',
      hideOriginalAmount: Boolean(hasDiscount && isOneClickCheckout()),
    };
    setAppropriateCtaText();
    updateAmountFontSize();
    return returnObj;
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

isCardValidForOffer.subscribe((value) => {
  setWithoutOffer(!value);
});