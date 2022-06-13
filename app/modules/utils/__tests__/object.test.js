import { isEmpty } from 'utils/object';

describe('Object Utils', () => {
  describe('isEmpty', () => {
    test('Checks if the Object is empty, returns false if it has value', () => {
      expect(
        isEmpty({ company: 'Razorpay' }, { contact: '+91-9999999999' })
      ).toEqual(false);
    });
    test('Checks if the Object is empty, returns true if it is empty', () => {
      expect(isEmpty({})).toEqual(true);
    });
  });
});
