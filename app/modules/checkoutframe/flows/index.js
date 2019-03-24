import { getSession } from 'sessionmanager';
import Analytics from 'analytics';
import * as AnalyticsTypes from 'analytics-types';
import { DEFAULT_AUTH_TYPE_RADIO } from 'common/constants';
import { Formatter } from 'formatter';

const VISIBLE_CLASS = 'drishy';
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
    _El.addClass(container, VISIBLE_CLASS);

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
    _El.removeClass(container, VISIBLE_CLASS);

    // Uncheck values
    if (checkedRadio) {
      checkedRadio.checked = false;
    }
  }
}
const showDebitPinRadios = () => setDebitPinRadiosVisibility(true);
const hideDebitPinRadios = () => setDebitPinRadiosVisibility(false);

let CURRENT_IIN;

/**
 * Checks and performs actions related to card flows.
 * @param {String} cardNumber Card number
 */
export function performCardFlowActions(cardNumber) {
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
  if (CURRENT_IIN === iin) {
    return;
  }

  CURRENT_IIN = iin;
  hideDebitPinRadios();

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

    if (isRecurring) {
      const cardElem = _Doc.querySelector('#elem-card');
      const cardInput = _Doc.querySelector(
        '#elem-card input[name="card[number]"]'
      );
      const isValid =
        flows.recurring && Formatter.rules.card.isValid.call(cardInput);

      if (isValid) {
        _El.removeClass(cardElem, INVALID_CLASS);
      } else {
        _El.addClass(cardElem, INVALID_CLASS);
      }
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
  });
}
