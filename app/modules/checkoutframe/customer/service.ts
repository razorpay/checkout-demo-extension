import fetch from 'utils/fetch';
import { makeAuthUrl } from 'common/makeAuthUrl';

// This updates the email on the backend when user logs in
// with Truecaller but did not get any email in response.
// And, on checkout email is a mandatory field. This
// updates the email on the BE after logging in
export function patchCustomerEmail(email: string) {
  fetch.patch({
    url: makeAuthUrl('customers'),
    data: {
      email,
    },
  });
}
