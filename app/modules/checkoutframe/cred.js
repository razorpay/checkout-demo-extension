import { makeAuthUrl } from 'common/Razorpay';
import { getSession } from 'sessionmanager';

const CRED_ELIGIBILITY_CACHE = {};

export const checkCREDEligibility = contact => {
  const session = getSession();

  const url = _.appendParamsToUrl(
    makeAuthUrl(session.r, 'payments/validate/account')
  );

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      CRED_ELIGIBILITY_CACHE[contact] = false;
      reject();
    }, 2000);
  });

  const promise = new Promise((resolve, reject) => {
    fetch
      .post(url, {
        entity: 'cred',
        value: '+919671967950',
      })
      .then(response => {
        console.log(response);
        if (response.state === 'ELIGIBLE') {
          resolve();
        } else {
          reject();
        }
      });
  });

  return promise;
};

export const isUserEligible = contact => {
  return CRED_ELIGIBILITY_CACHE[contact];
};
