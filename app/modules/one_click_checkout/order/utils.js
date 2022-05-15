export function computeHash(contact, email) {
  return `${contact}-${email}`;
}
