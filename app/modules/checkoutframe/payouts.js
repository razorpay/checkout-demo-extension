import { makeAuthUrl } from 'common/makeAuthUrl';
import fetch from 'utils/fetch';
import * as ObjectUtils from 'utils/object';

const _headers = {
  'Content-Type': 'application/x-www-form-urlencoded',
};

/**
 * Fetches all the accounts for a given contact_id
 * @param contactId {string}
 * @return {Promise<Object>}
 */
export function fetchFundAccounts(contactId) {
  let url = makeAuthUrl(`contacts/${contactId}/public`);

  return new Promise((resolve, reject) =>
    fetch({
      url,
      callback: function (result) {
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
  let url = makeAuthUrl('fund_accounts/public');

  return new Promise((resolve, reject) =>
    fetch({
      url,
      headers: _headers,
      method: 'post',
      data: fundAccount,
      callback: function (result) {
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
 * Masks sensitive data from fund account
 * @param account
 */
export function makeTrackingDataFromAccount(account) {
  const copy = ObjectUtils.clone(account);
  if (copy.bank_account) {
    const { account_number } = copy.bank_account;
    copy.bank_account.account_number = maskAccountNumber(account_number);
  }
  return copy;
}

/**
 * Masks account number
 * @param accountNumber {string} the account number to be masked
 * @return {string}
 */
function maskAccountNumber(accountNumber) {
  return (
    Array(accountNumber.length - 4)
      .fill('X')
      .join('') + accountNumber.slice(-4)
  );
}
