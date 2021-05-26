import { getSession } from 'sessionmanager';
import { isCustomerFeeBearer } from 'checkoutstore';

/**
 * Get the font size depending on the number of chars in amount, customer fee bearer and offer.
 * 
 * @param {Number|String} amount
 * @param {Boolean} hasFee
 * @param {Boolean} hasOffer
 */
 export function getNormalizedAmountFontSize(amount, hasFee = false, hasOffer = false) {
  const MIN_FONT_SIZE = 17;
  const MAX_FONT_SIZE = 24;
  const AUTOSCALE_STEP = 1.5; // decrease fontsize by this for every char over threshold

  if (!amount) return MAX_FONT_SIZE;

  // start decreasing fontsize when number of chars exceed this
  let autoscaleThreasholdChars = 12;

  if (hasFee) autoscaleThreasholdChars = 10;
  if (hasOffer) autoscaleThreasholdChars = 7;
  if (hasFee && hasOffer) autoscaleThreasholdChars = 6;

  return Math.max(
    MIN_FONT_SIZE,
    Math.min(
      MAX_FONT_SIZE,
      MAX_FONT_SIZE - (String(amount).length - autoscaleThreasholdChars) * AUTOSCALE_STEP
    ));
}

 /**
 * Fit original amount or discount amount in header by scaling the font size
 * 
 */
export function updateAmountFontSize() {
  const session = getSession();

  let hasFee = isCustomerFeeBearer();
  let offer = session.getAppliedOffer();
  let hasOffer = offer && offer.amount !== offer.original_amount;

  let discountString = offer ? session.formatAmountWithCurrency(offer.amount) : '';
  let originalAmountString = session.formatAmountWithCurrency(session.get('amount'));

  let amount_figure = discountString ? discountString : originalAmountString;
  // to get the actual sense of length, remove chars which barely take any space
  amount_figure = String(amount_figure).replace(/,|\.| /g, '');

  let fontSize = getNormalizedAmountFontSize(amount_figure, hasFee, hasOffer);

  _Doc.querySelector('#amount').style.fontSize = fontSize+'px';
  }
