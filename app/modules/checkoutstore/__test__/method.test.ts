import { getFPXBanks } from 'checkoutstore/methods';
import { getMerchantMethods } from 'razorpay';

jest.mock('razorpay', () => {
  return {
    ...jest.requireActual('razorpay'),
    getMerchantMethods: jest.fn(),
  };
});

describe('getFPXBanks', () => {
  test('should return list of fpx banks from preferences', () => {
    const bankList = {
      CITI: 'Citi Bank',
    };
    (getMerchantMethods as jest.Mock).mockReturnValue({
      fpx: bankList,
    });

    const banks = getFPXBanks();
    expect(banks).toEqual(bankList);
  });

  test('should return empty object if no banks in preferences', () => {
    (getMerchantMethods as jest.Mock).mockReturnValue({});

    const banks = getFPXBanks();
    expect(banks).toEqual({});
  });
});
