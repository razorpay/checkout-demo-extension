import BrowserStorage from 'browserstorage';
import { isMobile } from 'common/useragent';

const KEY = 'rzp_contact';

export function get() {
  let details;

  try {
    details = JSON.parse(BrowserStorage.getItem(KEY));
  } catch (err) {}

  if (!details) {
    details = {};
  }

  return Object.assign(
    {
      contact: '',
      email: '',
    },
    details
  );
}

function set(details) {
  BrowserStorage.setItem(KEY, JSON.stringify(details));
}

export function update({ contact, email }) {
  // Store only on mobile since Desktops can be shared b/w users
  if (!isMobile()) {
    return;
  }

  let existing = get();

  existing.contact = contact || existing.contact;
  existing.email = email || existing.email;

  set(existing);
}
