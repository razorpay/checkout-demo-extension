import { getSession } from 'sessionmanager';
import { selectedInstrumentId } from 'checkoutstore/screens/home';

/**
 *
 * @param {string} amount
 * @returns
 */
export function formatAmountWithCurrency(amount) {
  const session = getSession();

  return session.formatAmountWithCurrency(amount);
}

/**
 * Using it to create COD payments
 */
export function createCodPayment() {
  const session = getSession();

  session.submit();
  selectedInstrumentId.set(null);
}
