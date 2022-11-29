import * as CardLessEmi from 'common/cardlessemi';

describe('common/cardlessemi', () => {
  test('getNetworkFromCardNumber', function () {
    expect(CardLessEmi.isProviderHeadless('walnut369')).toBe(false);
    expect(CardLessEmi.isProviderHeadless('bajaj')).toBe(true);
    expect(CardLessEmi.isProviderHeadless('onecard')).toBe(true);
  });

  test('getImageUrl', function () {
    expect(CardLessEmi.getImageUrl('walnut369')).toBe(
      'https://cdn.razorpay.com/cardless_emi/walnut369.svg'
    );
    expect(CardLessEmi.getImageUrl('bajaj')).toBe(
      'https://cdn.razorpay.com/cardless_emi/bajaj.svg'
    );
    expect(CardLessEmi.getImageUrl('onecard')).toBe(
      'https://cdn.razorpay.com/cardless_emi/onecard.svg'
    );
  });
});
