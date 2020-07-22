const KEY = 'rzp_contact';

export function get() {
  let details;

  try {
    details = JSON.parse(global.localStorage.getItem(KEY));
  } catch (err) {}

  if (!details) {
    details = {};
  }

  return _Obj.extend(
    {
      contact: '',
      email: '',
    },
    details
  );
}

function set(details) {
  try {
    global.localStorage.setItem(KEY, JSON.stringify(details));
  } catch (err) {}
}

export function update({ contact, email }) {
  let existing = get();

  existing.contact = contact || existing.contact;
  existing.email = email || existing.email;

  set(existing);
}
