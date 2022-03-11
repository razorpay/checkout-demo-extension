import { getSession } from 'sessionmanager';
import { handleEditContact } from 'one_click_checkout/sessionInterface';

export function getSessionTab() {
  const session = getSession();

  return session.tab;
}

export function handleLogout() {
  const session = getSession();

  session.logUserOut(
    session.getCurrentCustomer(),
    handleEditContact.bind(null, true)
  );
}

export function handleLogoutAllDevices() {
  const session = getSession();

  session.logUserOutOfAllDevices(
    session.getCurrentCustomer(),
    handleEditContact.bind(null, true)
  );
}
