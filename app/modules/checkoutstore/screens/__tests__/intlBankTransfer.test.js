import { get } from 'svelte/store';
import {
  selectedMethod,
  setSelectedMethod,
  isMethodSelected,
} from '../intlBankTransfer';

describe('Test IntlBankTransfer selectMethod store', () => {
  test('should return null', () => {
    expect(get(selectedMethod)).toStrictEqual(null);
  });
  test('should set value in store', () => {
    expect(setSelectedMethod).toBeInstanceOf(Function);
    setSelectedMethod('a');
    expect(get(selectedMethod)).toStrictEqual('a');
  });
  test('should return true for isMethodSelected', () => {
    expect(isMethodSelected).toBeInstanceOf(Function);
    expect(isMethodSelected()).toStrictEqual(true);
  });
});
