import { makeAuthUrl, makeUrl } from 'common/Razorpay';
import { getSession } from 'sessionmanager';

const _headers = {
  'Content-Type': 'application/x-www-form-urlencoded',
};

/**
 * Fetches all the accounts for a given contact_id
 * @param contactId {string}
 * @return {Promise<Object>}
 */
export function fetchFundAccounts(contactId) {
  const { r } = getSession();
  return new Promise((resolve, reject) =>
    fetch({
      url: makeAuthUrl(r, `contacts/${contactId}/public`),
      callback: function(result) {
        if (result.error) {
          reject(result);
        } else {
          resolve(result);
        }
      },
    })
  );
}

/**
 * Creates a fund account.
 * @param fundAccount {Object} The fund account to be created.
 * @return {Promise<Object>}
 */
export function createFundAccount(fundAccount) {
  const { r } = getSession();
  return new Promise((resolve, reject) =>
    fetch({
      url: makeAuthUrl(r, 'fund_accounts/public'),
      headers: _headers,
      method: 'post',
      data: fundAccount,
      callback: function(result) {
        if (result.error) {
          reject(result);
        } else {
          resolve(result);
        }
      },
    })
  );
}
