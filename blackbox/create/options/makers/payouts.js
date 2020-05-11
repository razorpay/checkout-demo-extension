function makeOptions(features, options) {
  options = {
    contact_id: 'cont_BXV5GAmaJEcGr1',
    payout: true,
    key: 'rzp_test_1DP5mmOlF5G5ag',
  };
  return options;
}

function makePreferences(features, preferences) {
  const {
    VPAWithoutExistingInstrument,
    bankWithoutExistingInstrument,
  } = features;

  if (bankWithoutExistingInstrument || VPAWithoutExistingInstrument) {
    preferences.contact = {
      id: 'cont_BXV5GAmaJEcGr1',
      name: 'Contact 1',
      fund_accounts: [],
    };
  } else {
    preferences.contact = {
      id: 'cont_BXV5GAmaJEcGr1',
      name: 'Contact 1',
      fund_accounts: [
        {
          id: 'fa_DgYKg6fjnEPb72',
          account_type: 'vpa',
          vpa: {
            address: 'yvp@upi',
          },
        },
        {
          id: 'fa_DgY4tYmCBkEl2z',
          account_type: 'bank_account',
          bank_account: {
            ifsc: 'SBIN0007105',
            bank_name: 'State Bank of India',
            name: 'Mehul Kaushik',
            notes: [],
            account_number: 'XXXXXX1122',
          },
        },
      ],
    };
  }

  return preferences;
}

module.exports = {
  makeOptions,
  makePreferences,
};
