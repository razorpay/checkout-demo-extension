export default {
  blocks: {
    hdfcemi: {
      name: 'Pay using HDFC Bank',
      instruments: [
        {
          method: 'netbanking',
          banks: ['HDFC'],
        },
        {
          method: 'card',
          issuers: ['HDFC'],
          types: ['credit'],
        },
        {
          method: 'card',
          issuers: ['HDFC'],
          types: ['debit'],
        },
        {
          method: 'wallet',
          wallets: ['payzapp'],
        },
        {
          method: 'emi',
          issuers: ['HDFC'],
        },
      ],
    },
  },
  sequence: ['block.hdfcemi'],
};
