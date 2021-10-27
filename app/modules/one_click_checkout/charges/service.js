import { makeAuthUrl } from 'checkoutstore';

export function resetOrderApiCall(orderId) {
  return new Promise((resolve) => {
    fetch.post({
      url: makeAuthUrl(`orders/1cc/${orderId}/reset`),
      callback: (response) => {
        resolve(response);
      },
    });
  });
}
