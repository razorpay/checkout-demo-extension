import { getSession } from 'sessionmanager';
import { selectedInstrumentId } from 'checkoutstore/screens/home';

/**
 * Using it to create COD payments
 */
export function createCodPayment() {
  const session = getSession();

  session.submit();
  selectedInstrumentId.set(null);
}
