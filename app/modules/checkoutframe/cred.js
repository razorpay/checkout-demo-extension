import { makeAuthUrl } from 'common/Razorpay';
import { getSession } from 'sessionmanager';
import Analytics from 'analytics';

const CRED_ELIGIBILITY_CACHE = {};

const setCREDEligibility = (contact, value) => {
  CRED_ELIGIBILITY_CACHE[contact] = value;
};

export const setCREDEligibilityFromPreferences = preferences => {
  const contact = preferences.customer?.contact;
  const eligible = preferences.methods?.app_meta?.cred?.user_eligible;
  if (eligible !== undefined && contact) {
    Analytics.track('cred:eligibility_check', {
      data: 'preferences',
    });
    setCREDEligibility(contact, eligible);
  }
};

export const checkCREDEligibility = contact => {
  const session = getSession();

  const url = _.appendParamsToUrl(
    makeAuthUrl(session.r, 'payments/validate/account')
  );

  const promise = new Promise((resolve, reject) => {
    fetch.post({
      url,
      data: {
        entity: 'cred',
        value: contact,
      },
      callback: response => {
        const eligibility = response.data?.state === 'ELIGIBLE';
        Analytics.track('cred:eligibility_check', {
          data: 'validate_api',
        });
        if (eligibility) {
          setCREDEligibility(contact, true);
          resolve();
        } else {
          setCREDEligibility(contact, false);
          reject('User not eligible');
        }
      },
    });
  });

  return promise;
};

export const isUserEligible = contact => {
  return CRED_ELIGIBILITY_CACHE[contact];
};
