import { setNoCostAvailable } from 'checkoutstore/emi';

const merchantMethods = {
  emi_options: {
    HDFC: [
      {
        duration: 3,
        interest: 15,
        subvention: 'merchant',
        min_amount: 300000,
        merchant_payback: '2.45',
      },
      {
        duration: 6,
        interest: 15,
        subvention: 'customer',
        min_amount: 300000,
        merchant_payback: '4.23',
      },
    ],
    SBI: [
      {
        duration: 3,
        interest: 15,
        subvention: 'customer',
        min_amount: 300000,
        merchant_payback: '2.45',
      },
      {
        duration: 6,
        interest: 15,
        subvention: 'customer',
        min_amount: 300000,
        merchant_payback: '4.23',
      },
    ],
  },
};

jest.mock('razorpay', () => ({
  getMerchantMethods: () => merchantMethods,
  getOrderMethod: () => null,
}));

describe('Test no cost label', () => {
  test('Should show no cost label if any plan has subvention merchant', () => {
    const noCostLabel = setNoCostAvailable();
    expect(noCostLabel).toBeTruthy();
  });
});
