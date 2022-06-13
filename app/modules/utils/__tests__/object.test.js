import { hasProp, isEmpty } from 'utils/object';

describe('Object Utils', () => {
  describe('hasProp', () => {
    test('checks the property in the given object is inherited and owns', () => {
      expect(hasProp({ company: 'Razorpay' }, 'company')).toEqual(true);
    });
    test('checks the property in the given object is inherited and owns', () => {
      expect(hasProp({ company: 'Razorpay' }, 'service')).toEqual(false);
    });
    test('checks when the property non defined', () => {
      expect(hasProp({ company: 'Razorpay' })).toEqual(false);
    });
    test('checks the property in the given empty object', () => {
      expect(hasProp({}, 'company')).toEqual(false);
    });
  });
});

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
