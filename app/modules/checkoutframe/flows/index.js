import { getSession } from 'sessionmanager';
import { DEFAULT_AUTH_TYPE_RADIO, SHOWN_CLASS } from 'common/constants';
import { Formatter } from 'formatter';
import { getCardType, getIin, getCardDigits } from 'common/card';
import { getCardFlowsFromCache } from 'payment';

const INVALID_CLASS = 'invalid';

/**
 * Tells whether or not Native OTP is possible for the payment.
 * @param {Object} paymentData Data that will be used for payment creation
 * @param {Array} tokens List of tokens
 *
 * @return {Boolean}
 */
export function isNativeOtpPossibleForPayment(paymentData, tokens = []) {
  const cardNumber = paymentData['card[number]'];
  const token = paymentData['token'];

  if (token) {
    const cardToken = tokens.find(t => t.token === token);

    return Boolean(
      cardToken &&
        cardToken.card &&
        cardToken.card.flows &&
        cardToken.card.flows.otp
    );
  } else if (cardNumber) {
    const flows = getCardFlowsFromCache(cardNumber);

    return Boolean(flows && flows.otp);
  }

  return false;
}

/**
 * Sets the visibility of ATM-PIN radio buttons on new card screen.
 * @param {Boolean} visible
 */
function setDebitPinRadiosVisibility(visible) {
  const container = _Doc.querySelector(
    '#add-card-container .flow-selection-container'
  );
  const checkedRadio = _Doc.querySelector(
    '#add-card-container .flow.input-radio input[type=radio]:checked'
  );

  if (visible) {
    // Show container
    _El.addClass(container, SHOWN_CLASS);

    // Get default radio
    const defaultRadio = _Doc.querySelector(
      `#add-card-container .flow.input-radio #flow-${DEFAULT_AUTH_TYPE_RADIO}`
    );

    // Set default radio to checked if none is checked
    if (!checkedRadio && defaultRadio) {
      defaultRadio.checked = true;
    }
  } else {
    // Hide container
    _El.removeClass(container, SHOWN_CLASS);

    // Uncheck values
    if (checkedRadio) {
      checkedRadio.checked = false;
    }
  }
}
const showDebitPinRadios = () => setDebitPinRadiosVisibility(true);
const hideDebitPinRadios = () => setDebitPinRadiosVisibility(false);

/**
 * Sets classes and performs actions depending
 * on the validity of the card.
 * @param {Boolean} isValid
 * @param {DOMNode} cardElem #elem-card or similar
 * @param {DOMNode} cardInput <input> for card number
 * @param {DOMNode} cardExpiry Expiry <input> on which to focus if card is valid
 */
function setCardValidity(
  isValid,
  cardElem,
  cardInput = cardElem.querySelector('input[name="card[number]"]'),
  cardExpiry
) {
  const session = getSession();
  const cardNumber = getCardDigits(cardInput.value);
  const cardType = getCardType(cardNumber);
  const caretPosition = session.delegator.card.caretPosition; // TODO: Find a better way to get this value

  if (isValid) {
    _El.removeClass(cardElem, INVALID_CLASS);

    /**
     * Focus on expiry elem if we have the entire card number
     * and the cursor is at the end of the input field.
     */
    if (
      cardInput.value.length === caretPosition &&
      document.activeElement === cardInput
    ) {
      if (cardType !== 'maestro') {
        cardExpiry && cardExpiry.focus();
      }
    }
  } else {
    _El.addClass(cardElem, INVALID_CLASS);
  }
}

const cardValidator = {
  /**
   * Validate the card number.
   * @param {DOMNode} cardInput <input> for card number
   *
   * @return {Boolean}
   */
  sync: function(cardInput) {
    const cardNumber = getCardDigits(cardInput.value);
    const session = getSession();
    const cardType = getCardType(cardNumber);

    let isValid = Formatter.rules.card.isValid.call({
      value: cardNumber,
      type: cardType,
    });

    if (!session.preferences.methods.amex && cardType === 'amex') {
      isValid = false;
    }

    return isValid;
  },
};

/**
 * Checks and performs actions related to card flows
 * and validate the card input.
 * @param cardElem {DOMNode} #elem-card or similar
 * @param cardInput (DOMNode) <input /> of card number
 * @param {DOMNode} cardExpiry Expiry <input> on which to focus if card is valid
 */
export function performCardFlowActionsAndValidate(
  cardElem,
  cardInput,
  cardExpiry
) {
  // Perform sync validation initially
  setCardValidity(
    cardValidator.sync(cardInput),
    cardElem,
    cardInput,
    cardExpiry
  );

  const cardNumber = getCardDigits(cardInput.value);
  const iin = getIin(cardNumber);
  const session = getSession();
  const isRecurring = session.recurring;

  const flowChecker = (flows = {}) => {
    const cardNumber = getCardDigits(cardInput.value);
    const isIinSame = getIin(cardNumber) === iin;

    // If the card number was changed before response, do nothing
    if (!isIinSame) {
      return;
    }

    let isValid = cardValidator.sync(cardInput);

    // Perform actual-flow checking only if the IIN has changed.
    if (isRecurring) {
      isValid = isValid && flows.recurring;
    } else {
      // Debit-PIN is not supposed to work in case of recurring
      if (flows.pin) {
        showDebitPinRadios();
      } else {
        hideDebitPinRadios();
      }
    }

    setCardValidity(isValid, cardElem, cardInput, cardExpiry);
  };

  if (iin.length < 6) {
    hideDebitPinRadios();
  }

  if (iin.length >= 6) {
    session.r.getCardFlows(iin, flowChecker);
  }
}
