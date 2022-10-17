import fetch from 'utils/fetch';
import { makeAuthUrl } from 'common/makeAuthUrl';

const CONSENT_UPDATE_URL = '1cc/customer/consent/marketing';

export const updateCustomerConsent = (consent = false) => {
  // TODO: Add analytics
  return new Promise((resolve, reject) => {
    fetch.post({
      url: makeAuthUrl(CONSENT_UPDATE_URL),
      callback: (response) => {
        if (response.status_code === 200) {
          resolve(response);
        } else {
          reject(response);
        }
      },
      data: {
        '1cc_customer_consent': consent ? 1 : 0,
      },
    });
  });
};
