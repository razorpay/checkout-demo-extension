import fetch from 'utils/fetch';

export function resolveMxRecords(domain) {
  return new Promise((resolve) => {
    fetch({
      url: `https://dns.google/resolve?name=${domain}&type=MX`,
      callback: (response) => {
        if (response.Status === 0) {
          resolve(true);
          return;
        }
        resolve(false);
      },
    });
  });
}
