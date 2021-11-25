export const HOME_VIEWS = {
  METHODS: 'methods',
  ADDRESS: 'address',
  DETAILS: 'details',
  COUPONS: 'coupons',
  OTP: 'otp',
};
export const debitCardConfig = {
  _ungrouped: [
    {
      type: 'debit',
      method: 'debit_card',
      _type: 'instrument',
    },
  ],
  method: 'debit_card',
  _type: 'instrument',
};
export const creditCardConfig = {
  _ungrouped: [
    {
      type: 'credit',
      method: 'credit_card',
      _type: 'instrument',
    },
  ],
  method: 'credit_card',
  _type: 'instrument',
};

export const MAX_CHAR_LIMIT_FOR_BANK = 6;
