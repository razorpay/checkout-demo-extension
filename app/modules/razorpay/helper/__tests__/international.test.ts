import { isInternational } from '../international';
import { getOption, getPreferences } from 'razorpay';

jest.mock('../base', () => ({
  __esModule: true,
  ...jest.requireActual('../base'),
  getPreferences: jest.fn(),
  getOption: jest.fn(),
}));

describe('test cases for isInternational()', () => {
  test('If the merchant is Indian and payment currency in INR', async () => {
    (getPreferences as unknown as jest.Mock)
      .mockReturnValueOnce('INR')
      .mockReturnValueOnce('IN');
    (getOption as unknown as jest.Mock).mockReturnValueOnce('INR');
    expect(isInternational()).toBeFalsy();
  });

  test('If the merchant is Indian and payment currency is non-INR', async () => {
    (getPreferences as unknown as jest.Mock)
      .mockReturnValueOnce('INR')
      .mockReturnValueOnce('IN');
    (getOption as unknown as jest.Mock).mockReturnValueOnce('MYR');
    expect(isInternational()).toBeTruthy();
  });

  test('If the merchant is Malaysian and payment currency is MYR', async () => {
    (getPreferences as unknown as jest.Mock)
      .mockReturnValueOnce('MYR')
      .mockReturnValueOnce('MY');
    (getOption as unknown as jest.Mock).mockReturnValueOnce('MYR');
    expect(isInternational()).toBeFalsy();
  });

  test('If the merchant is Malaysian and payment currency is non-MYR', async () => {
    (getPreferences as unknown as jest.Mock)
      .mockReturnValueOnce('MYR')
      .mockReturnValueOnce('MY');
    (getOption as unknown as jest.Mock).mockReturnValueOnce('INR');
    expect(isInternational()).toBeTruthy();
  });

  test('If the merchant is from outside of supported region and payment currency as its domestic', async () => {
    // say from indonesia
    (getPreferences as unknown as jest.Mock)
      .mockReturnValueOnce('IDR')
      .mockReturnValueOnce('IDN');
    (getOption as unknown as jest.Mock).mockReturnValueOnce('IDR');
    expect(isInternational()).toBeTruthy();
  });

  test('If the merchant is from outside of supported region and payment currency as non-domestic', async () => {
    // say from indonesia
    (getPreferences as unknown as jest.Mock)
      .mockReturnValueOnce('IDR')
      .mockReturnValueOnce('IDN');
    (getOption as unknown as jest.Mock).mockReturnValueOnce('INR');
    expect(isInternational()).toBeTruthy();
  });
});
