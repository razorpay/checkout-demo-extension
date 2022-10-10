import { isValidContact } from '../validation';

describe('test #isValidContact', () => {
  test('valid indian contact', () => {
    expect(isValidContact('+91', '8888888888')).toBeTruthy();
  });

  test('invalid indian contact', () => {
    expect(isValidContact('+91', '888888888')).toBeFalsy();
  });

  test('valid international contact', () => {
    expect(isValidContact('+1', '888888888')).toBeTruthy();
  });

  test('invalid international contact', () => {
    expect(isValidContact('+1', '88888')).toBeFalsy();
  });
});
