import fetch from 'utils/fetch';
import { isNumber } from 'utils/_';

export function resolveMxRecords(domain) {
  return new Promise((resolve) => {
    // https://developers.google.com/speed/public-dns/docs/doh/json
    fetch({
      url: `https://dns.google/resolve?name=${domain}&type=MX`,
      callback: (response) => {
        if (isNumber(response.Status)) {
          resolve(response.Status === 0);
        } else {
          // allow emails to pass through if the there's a network error
          resolve(true);
        }
      },
    });
  });
}
