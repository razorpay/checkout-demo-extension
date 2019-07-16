import { makeAuthUrl, makeUrl } from 'common/Razorpay';
import { getSession } from 'sessionmanager';

const _headers = {
  'Content-Type': 'application/x-www-form-urlencoded',
};

const mock = false;

const FETCH_MOCK_RESPONSE = {
  id: 'cont_BSQxC46dCKUs97',
  name: 'John Doe',
  fund_accounts: [
    {
      account_type: 'bank_account',
      id: 'fa_00000000000002',
      bank_account: {
        name: 'John Doe',
        ifsc: 'SBIN0007105',
        bank_name: 'State Bank of India',
        account_number: '111XXXXXX4567',
      },
    },
    {
      account_type: 'vpa',
      id: 'fa_00000000000003',
      vpa: {
        address: 'john*****@upi',
      },
    },
  ],
};

const SAVE_MOCK_RESPONSE = {
  id: 'fa_CuLw0crMkC5eeb',
  account_type: 'bank_account',
  bank_account: {
    ifsc: 'SBIN0000012',
    bank_name: 'State Bank of India',
    name: 'Test',
    account_number: 'X2345',
  },
};

export function fetchFundAccounts(contactId) {
  const { r } = getSession();
  if (mock) {
    return new Promise(resolve => {
      setTimeout(_ => resolve(FETCH_MOCK_RESPONSE), 2000);
    });
  }
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

export function createFundAccount(fundAccount) {
  const { r } = getSession();
  if (mock) {
    return new Promise(resolve => {
      setTimeout(_ => resolve(SAVE_MOCK_RESPONSE), 2000);
    });
  }
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
