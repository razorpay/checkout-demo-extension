const fundAccountsApiUrl = 'https://api.razorpay.com/v1/fund_accounts';

const _headers = {
  Authorization: 'Bearer ' + '',
};

export function fetchFundAccounts(accountId, callback) {
  setTimeout(_ =>
    callback({
      entity: 'collection',
      count: 2,
      items: [
        {
          id: 'fa_00000000000001',
          entity: 'fund_account',
          contact_id: 'cont_00000000000001',
          account_type: 'bank_account',
          bank_account: {
            ifsc: 'HDFC0000053',
            bank_name: 'HDFC Bank',
            name: 'Gaurav Kumar',
            account_number: '765432123456789',
          },
          active: false,
          batch_id: null,
          created_at: 1545312598,
        },
        {
          id: 'fa_00000000000002',
          entity: 'fund_account',
          contact_id: 'cont_00000000000001',
          account_type: 'vpa',
          vpa: { address: 'gauravkumar@upi' },
          active: true,
          batch_id: null,
          created_at: 1545313478,
        },
      ],
    })
  );
}
