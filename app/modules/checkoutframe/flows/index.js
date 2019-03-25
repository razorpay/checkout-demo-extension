import { getSession } from 'sessionmanager';
import Analytics from 'analytics';
import * as AnalyticsTypes from 'analytics-types';
import { DEFAULT_AUTH_TYPE_RADIO, SHOWN_CLASS } from 'common/constants';
import { Formatter } from 'formatter';
import { getCardType, getCardMaxLen } from 'common/card';

const INVALID_CLASS = 'invalid';

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
 */
function setCardValidity(isValid) {
  const session = getSession();
  const cardElem = _Doc.querySelector('#elem-card');
  const cardInput = _Doc.querySelector('#elem-card input[name="card[number]"]');
  const cardExpiry = _Doc.querySelector('#card_expiry');
  const cardType = getCardType(cardInput.value);
  const caretPosition = session.delegator.card.caretPosition; // TODO: Find a better way to get this value

  if (isValid) {
    _El.removeClass(cardElem, INVALID_CLASS);

    /**
     * Focus on expiry elem if we have the entire card number
     * and the cursor is at the end of the input field.
     */
    if (cardInput.value.length === caretPosition) {
      if (cardType !== 'maestro') {
        cardExpiry.focus();
      }
    }
  } else {
    _El.addClass(cardElem, INVALID_CLASS);
  }
}

let CURRENT_IIN;

/**
 * Checks and performs actions related to card flows
 * and validate the card input.
 * @param {String} cardNumber Card number
 */
export function performCardFlowActionsAndValidate(cardNumber) {
  // Sanity
  if (!cardNumber) {
    return;
  }

  // Get IIN from card number
  const iin = cardNumber.replace(/\D/g, '').slice(0, 6);

  if (iin.length < 6) {
    CURRENT_IIN = null;
    hideDebitPinRadios();
    return;
  }

  // If IIN has not changed, do nothing.
  if (CURRENT_IIN !== iin) {
    CURRENT_IIN = iin;
    hideDebitPinRadios();
  }

  const session = getSession();
  const isRecurring = session.recurring;

  session.r.getCardFlows(iin, flows => {
    Analytics.track('card:flows:fetched', {
      data: {
        iin,
        default_auth_type: DEFAULT_AUTH_TYPE_RADIO,
      },
    });

    // If we got a new IIN before a response, abort.
    if (CURRENT_IIN !== iin) {
      return;
    }

    // Sanity check
    if (!flows) {
      return;
    }

    const cardInput = _Doc.querySelector(
      '#elem-card input[name="card[number]"]'
    );
    const cardType = getCardType(cardInput.value);

    let isValid = Formatter.rules.card.isValid.call({
      value: cardNumber,
      type: cardType,
    });

    if (isRecurring) {
      isValid = isValid && flows.recurring;
    } else {
      // Debit-PIN is not supposed to work in case of recurring
      if (flows.pin) {
        Analytics.track('atmpin:flows', {
          type: AnalyticsTypes.RENDER,
          data: {
            iin: iin,
            default_auth_type: DEFAULT_AUTH_TYPE_RADIO,
          },
        });

        showDebitPinRadios();
      } else {
        hideDebitPinRadios();
      }
    }

    if (!session.preferences.methods.amex && cardType === 'amex') {
      isValid = false;
    }

    setCardValidity(isValid);
  });
}
