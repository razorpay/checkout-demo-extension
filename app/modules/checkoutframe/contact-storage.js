import BrowserStorage from 'browserstorage';
import { disableEmailAsCookie } from 'razorpay';

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
  if (disableEmailAsCookie()) {
    return;
  }

  let existing = get();

  existing.contact = contact || existing.contact;
  existing.email = email || existing.email;

  set(existing);
}
