const API_URL = 'https://api.razorpay.com/v1/';

export function fetchFundAccounts(contactId, callback) {
  callback({
    contact_id: 'cont_BSQxC46dCKUs97',
    contact_name: 'John Doe',
    records: [
      {
        account_type: 'bank_account',
        fund_account_id: 'fa_00000001',
        bank_account: {
          name: 'John Doe',
          ifsc: 'SBIN0007105',
          bank_name: 'State Bank of India',
          account_number: '111XXXXXX4567',
        },
      },
      {
        account_type: 'vpa',
        fund_account_id: 'fa_00000002',
        vpa: {
          address: 'john*****@upi',
        },
      },
    ],
  });
  // return fetch({
  //   url: API_URL + `/contacts/${contactId}/fund_accounts/public`,
  //   callback
  // })
}

export function saveFundAccount(contactId, fundAccount, callback) {
  return callback({
    id: 'fa_00000000000001',
    entity: 'fund_account',
    contact_id: 'cont_00000000000001',
    account_type: 'card',
    card: {
      name: 'Gaurav Kumar',
      last4: '6789',
      network: 'Visa',
      type: 'credit',
      issuer: 'HDFC',
    },
    active: true,
    batch_id: null,
    created_at: 1543650891,
  });
  // return fetch({
  //   url: API_URL + '/fund_accounts/public',
  //   data: {
  //     contact_id: contactId,
  //     ...fundAccount
  //   },
  //   callback
  // });
}
