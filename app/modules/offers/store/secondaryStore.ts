/**
 * To remove circular deps introduce another store
 */
import * as ChargesStore from 'one_click_checkout/charges/store';
import { setAppropriateCtaText, setWithoutOffer } from 'cta';
import { getOption, isCustomerFeeBearer, isOneClickCheckout } from 'razorpay';
import { getSession } from 'sessionmanager';
import { derived, get } from 'svelte/store';
import { appliedOffer, isCardValidForOffer } from './store';
import { formatAmountWithSymbol } from 'common/currency';
import { updateAmountFontSize } from 'checkoutframe/components/header';

isCardValidForOffer.subscribe((value) => {
  setWithoutOffer(!value);
});

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
    /**
     * TODO remove function updateAmountInHeaderForOffer for header update
     * in 1.5 ideally this will be removed with header
     */
    session.updateAmountInHeaderForOffer(
      returnObj.discountAmount,
      returnObj.hasFee,
      true
    );
    updateAmountFontSize();
    return returnObj;
  }
);
