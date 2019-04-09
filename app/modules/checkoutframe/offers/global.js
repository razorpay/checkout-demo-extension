/**
 * Global offers: Offers that apply to all merchants.
 */

const alwaysEligible = _ => true;

export default [
  {
    isEligible: alwaysEligible,

    offer: {
      id: 'zestmoney_0_interest_3_months_offer1',
      name: 'ZestMoney: 0% Interest available',
      payment_method: 'cardless_emi',
      provider: 'zestmoney',
      display_text:
        'Applicable only on EMI tenure of 3 months.\nInterest will be returned as cashback on repayment of each EMI.',

      homescreen: false,
      removable: false,
    },
  },
];
