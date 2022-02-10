import { getUniqueValues } from 'utils/array';

describe('Array Utils', () => {
  describe('getUniqueValues', () => {
    test('Array contains duplicate values', () => {
      expect(
        getUniqueValues(['Razorpay', 1, 2, 3, 2, 3, 'Razorpay'])
      ).toStrictEqual(['Razorpay', 1, 2, 3]);
    });
    test('Array contains unique values', () => {
      expect(getUniqueValues([1, 2, 3])).toStrictEqual([1, 2, 3]);
    });
  });
});
